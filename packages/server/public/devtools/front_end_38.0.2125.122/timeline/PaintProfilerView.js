/*
 * Copyright (C) 2013 Google Inc. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Google Inc. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/**
 * @constructor
 * @param {function(string=)} showImageCallback
 * @extends {WebInspector.HBox}
 */
WebInspector.PaintProfilerView = function(showImageCallback)
{
    WebInspector.HBox.call(this);
    this.element.classList.add("paint-profiler-overview", "hbox");
    this._canvasContainer = this.element.createChild("div", "paint-profiler-canvas-container");
    this._pieChart = new WebInspector.PieChart(55, this._formatPieChartTime.bind(this));
    this.element.createChild("div", "paint-profiler-pie-chart").appendChild(this._pieChart.element);

    this._showImageCallback = showImageCallback;

    this._canvas = this._canvasContainer.createChild("canvas", "fill");
    this._context = this._canvas.getContext("2d");
    this._selectionWindow = new WebInspector.OverviewGrid.Window(this._canvasContainer);
    this._selectionWindow.addEventListener(WebInspector.OverviewGrid.Events.WindowChanged, this._onWindowChanged, this);

    this._innerBarWidth = 4 * window.devicePixelRatio;
    this._minBarHeight = window.devicePixelRatio;
    this._barPaddingWidth = 2 * window.devicePixelRatio;
    this._outerBarWidth = this._innerBarWidth + this._barPaddingWidth;

    this._reset();
}

WebInspector.PaintProfilerView.Events = {
    WindowChanged: "WindowChanged"
};

WebInspector.PaintProfilerView.prototype = {
    onResize: function()
    {
        this._update();
    },

    /**
     * @param {?WebInspector.PaintProfilerSnapshot} snapshot
     * @param {!Array.<!WebInspector.PaintProfilerLogItem>} log
     */
    setSnapshotAndLog: function(snapshot, log)
    {
        this._reset();
        this._snapshot = snapshot;
        this._log = log;
        this._logCategories = this._log.map(WebInspector.PaintProfilerView._categoryForLogItem);

        if (!this._snapshot) {
            this._update();
            return;
        }
        snapshot.requestImage(null, null, 1, this._showImageCallback);
        snapshot.profile(onProfileDone.bind(this));
        /**
         * @param {!Array.<!LayerTreeAgent.PaintProfile>=} profiles
         * @this {WebInspector.PaintProfilerView}
         */
        function onProfileDone(profiles)
        {
            this._profiles = profiles;
            this._update();
        }
    },

    _update: function()
    {
        this._canvas.width = this._canvasContainer.clientWidth * window.devicePixelRatio;
        this._canvas.height = this._canvasContainer.clientHeight * window.devicePixelRatio;
        this._samplesPerBar = 0;
        if (!this._profiles || !this._profiles.length)
            return;

        var maxBars = Math.floor((this._canvas.width - 2 * this._barPaddingWidth) / this._outerBarWidth);
        var sampleCount = this._log.length;
        this._samplesPerBar = Math.ceil(sampleCount / maxBars);
        var barCount = Math.floor(sampleCount / this._samplesPerBar);

        var maxBarTime = 0;
        var barTimes = [];
        var barHeightByCategory = [];
        var heightByCategory = {};
        for (var i = 0, lastBarIndex = 0, lastBarTime = 0; i < sampleCount;) {
            var categoryName = (this._logCategories[i] && this._logCategories[i].name) || "misc";
            var sampleIndex = this._log[i].commandIndex;
            for (var row = 0; row < this._profiles.length; row++) {
                var sample = this._profiles[row][sampleIndex];
                lastBarTime += sample;
                heightByCategory[categoryName] = (heightByCategory[categoryName] || 0) + sample;
            }
            ++i;
            if (i - lastBarIndex == this._samplesPerBar || i == sampleCount) {
                // Normalize by total number of samples accumulated.
                var factor = this._profiles.length * (i - lastBarIndex);
                lastBarTime /= factor;
                for (categoryName in heightByCategory)
                    heightByCategory[categoryName] /= factor;

                barTimes.push(lastBarTime);
                barHeightByCategory.push(heightByCategory);

                if (lastBarTime > maxBarTime)
                    maxBarTime = lastBarTime;
                lastBarTime = 0;
                heightByCategory = {};
                lastBarIndex = i;
            }
        }

        const paddingHeight = 4 * window.devicePixelRatio;
        var scale = (this._canvas.height - paddingHeight - this._minBarHeight) / maxBarTime;
        for (var i = 0; i < barTimes.length; ++i) {
            for (var categoryName in barHeightByCategory[i])
                barHeightByCategory[i][categoryName] *= (barTimes[i] * scale + this._minBarHeight) / barTimes[i];
            this._renderBar(i, barHeightByCategory[i]);
        }
    },

    /**
     * @param {number} index
     * @param {!Object.<string, number>} heightByCategory
     */
    _renderBar: function(index, heightByCategory)
    {
        var categories = WebInspector.PaintProfilerView.categories();
        var currentHeight = 0;
        var x = this._barPaddingWidth + index * this._outerBarWidth;
        for (var categoryName in categories) {
            if (!heightByCategory[categoryName])
                continue;
            currentHeight += heightByCategory[categoryName];
            var y = this._canvas.height - currentHeight;
            this._context.fillStyle = categories[categoryName].color;
            this._context.fillRect(x, y, this._innerBarWidth, heightByCategory[categoryName]);
        }
    },

    _onWindowChanged: function()
    {
        this.dispatchEventToListeners(WebInspector.PaintProfilerView.Events.WindowChanged);

        // Update pie chart
        var window = this.windowBoundaries();
        var totalTime = 0;
        var timeByCategory = {};
        for (var i = window.left; i <= window.right; ++i) {
            var logEntry = this._log[i];
            var category = WebInspector.PaintProfilerView._categoryForLogItem(logEntry);
            timeByCategory[category.color] = timeByCategory[category.color] || 0;
            for (var j = 0; j < this._profiles.length; ++j) {
                var time = this._profiles[j][logEntry.commandIndex];
                totalTime += time;
                timeByCategory[category.color] += time;
            }
        }
        this._pieChart.setTotal(totalTime / this._profiles.length);
        for (var color in timeByCategory)
          this._pieChart.addSlice(timeByCategory[color] / this._profiles.length, color);

        if (this._updateImageTimer)
            return;
        this._updateImageTimer = setTimeout(this._updateImage.bind(this), 100);
    },

    /**
     * @param {number} value
     * @return {string}
     */
    _formatPieChartTime: function(value)
    {
        return Number.millisToString(value * 1000, true);
    },

    /**
     * @return {{left: number, right: number}}
     */
    windowBoundaries: function()
    {
        var screenLeft = this._selectionWindow.windowLeft * this._canvas.width;
        var screenRight = this._selectionWindow.windowRight * this._canvas.width;
        var barLeft = Math.floor((screenLeft - this._barPaddingWidth) / this._outerBarWidth);
        var barRight = Math.floor((screenRight - this._barPaddingWidth + this._innerBarWidth)/ this._outerBarWidth);
        var stepLeft = Number.constrain(barLeft * this._samplesPerBar, 0, this._log.length - 1);
        var stepRight = Number.constrain(barRight * this._samplesPerBar, 0, this._log.length - 1);

        return { left: stepLeft, right: stepRight };
    },

    _updateImage: function()
    {
        delete this._updateImageTimer;
        if (!this._profiles || !this._profiles.length)
            return;

        var window = this.windowBoundaries();
        this._snapshot.requestImage(this._log[window.left].commandIndex, this._log[window.right].commandIndex, 1, this._showImageCallback);
    },

    _reset: function()
    {
        this._snapshot = null;
        this._profiles = null;
        this._selectionWindow.reset();
    },

    __proto__: WebInspector.HBox.prototype
};

/**
 * @constructor
 * @extends {WebInspector.VBox}
 */
WebInspector.PaintProfilerCommandLogView = function()
{
    WebInspector.VBox.call(this);
    this.setMinimumSize(100, 25);
    this.element.classList.add("outline-disclosure");
    var sidebarTreeElement = this.element.createChild("ol", "sidebar-tree");
    sidebarTreeElement.addEventListener("mousemove", this._onMouseMove.bind(this), false);
    sidebarTreeElement.addEventListener("mouseout", this._onMouseMove.bind(this), false);
    sidebarTreeElement.addEventListener("contextmenu", this._onContextMenu.bind(this), true);
    this.sidebarTree = new TreeOutline(sidebarTreeElement);
    this._popoverHelper = new WebInspector.ObjectPopoverHelper(this.element, this._getHoverAnchor.bind(this), this._resolveObjectForPopover.bind(this), undefined, true);

    this._reset();
}

WebInspector.PaintProfilerCommandLogView.prototype = {
    /**
     * @param {?WebInspector.Target} target
     * @param {!Array.<!WebInspector.PaintProfilerLogItem>=} log
     */
    setCommandLog: function(target, log)
    {
        this._target = target;
        this._log = log;
        this.updateWindow();
    },

    /**
     * @param {number=} stepLeft
     * @param {number=} stepRight
     */
    updateWindow: function(stepLeft, stepRight)
    {
        stepLeft = stepLeft || 0;
        stepRight = stepRight || this._log.length - 1;
        this.sidebarTree.removeChildren();
        for (var i = stepLeft; i <= stepRight; ++i) {
            var node = new WebInspector.LogTreeElement(this, this._log[i]);
            this.sidebarTree.appendChild(node);
        }
    },

    _reset: function()
    {
        this._log = [];
    },

    /**
     * @param {!Element} target
     * @return {!Element}
     */
    _getHoverAnchor: function(target)
    {
        return /** @type {!Element} */ (target.enclosingNodeOrSelfWithNodeName("span"));
    },

    /**
     * @param {!Element} element
     * @param {function(!WebInspector.RemoteObject, boolean, !Element=):undefined} showCallback
     */
    _resolveObjectForPopover: function(element, showCallback)
    {
        var liElement = element.enclosingNodeOrSelfWithNodeName("li");
        var logItem = liElement.treeElement.representedObject;
        var obj = {"method": logItem.method};
        if (logItem.params)
            obj.params = logItem.params;
        showCallback(WebInspector.RemoteObject.fromLocalObject(obj), false);
    },

    /**
     * @param {?Event} event
     */
    _onMouseMove: function(event)
    {
        var node = this.sidebarTree.treeElementFromPoint(event.pageX, event.pageY);
        if (node === this._lastHoveredNode)
            return;
        if (this._lastHoveredNode)
            this._lastHoveredNode.setHovered(false);
        this._lastHoveredNode = node;
        if (this._lastHoveredNode)
            this._lastHoveredNode.setHovered(true);
    },

    /**
     * @param {?Event} event
     */
    _onContextMenu: function(event)
    {
        if (!this._target)
            return;
        var node = this.sidebarTree.treeElementFromPoint(event.pageX, event.pageY);
        if (!node || !node.representedObject)
            return;
        var logItem = /** @type {!WebInspector.PaintProfilerLogItem} */ (node.representedObject);
        if (!logItem.nodeId())
            return;
        var contextMenu = new WebInspector.ContextMenu(event);
        var domNode = new WebInspector.DeferredDOMNode(this._target, logItem.nodeId());
        contextMenu.appendApplicableItems(domNode);
        contextMenu.show();
    },

    __proto__: WebInspector.VBox.prototype
};

/**
  * @constructor
  * @param {!WebInspector.PaintProfilerCommandLogView} ownerView
  * @param {!WebInspector.PaintProfilerLogItem} logItem
  * @extends {TreeElement}
  */
WebInspector.LogTreeElement = function(ownerView, logItem)
{
    TreeElement.call(this, "", logItem);
    this._ownerView = ownerView;
    this._update();
}

WebInspector.LogTreeElement.prototype = {
    /**
      * @param {!Object} param
      * @param {string} name
      * @return {string}
      */
    _paramToString: function(param, name)
    {
        if (typeof param !== "object")
            return typeof param === "string" && param.length > 100 ? name : JSON.stringify(param);
        var str = "";
        var keyCount = 0;
        for (var key in param) {
            if (++keyCount > 4 || typeof param[key] === "object" || (typeof param[key] === "string" && param[key].length > 100))
                return name;
            if (str)
                str += ", ";
            str += param[key];
        }
        return str;
    },

    /**
      * @param {!Object} params
      * @return {string}
      */
    _paramsToString: function(params)
    {
        var str = "";
        for (var key in params) {
            if (str)
                str += ", ";
            str += this._paramToString(params[key], key);
        }
        return str;
    },

    _update: function()
    {
        var logItem = this.representedObject;
        var title = document.createDocumentFragment();
        title.createChild("div", "selection");
        var span = title.createChild("span");
        var textContent = logItem.method;
        if (logItem.params)
            textContent += "(" + this._paramsToString(logItem.params) + ")";
        span.textContent = textContent;
        this.title = title;
    },

    /**
     * @param {boolean} hovered
     */
    setHovered: function(hovered)
    {
        this.listItemElement.classList.toggle("hovered", hovered);
        var target = this._ownerView._target;
        if (!target)
            return;
        if (!hovered) {
            target.domModel.hideDOMNodeHighlight();
            return;
        }
        var logItem = /** @type {!WebInspector.PaintProfilerLogItem} */ (this.representedObject);
        if (!logItem)
            return;
        var backendNodeId = logItem.nodeId();
        if (!backendNodeId)
            return;
        new WebInspector.DeferredDOMNode(target, backendNodeId).resolve(highlightNode);
        /**
         * @param {?WebInspector.DOMNode} node
         */
        function highlightNode(node)
        {
            if (node)
                node.highlight();
        }
    },

    __proto__: TreeElement.prototype
};

/**
 * @return {!Object.<string, !WebInspector.PaintProfilerCategory>}
 */
WebInspector.PaintProfilerView.categories = function()
{
    if (WebInspector.PaintProfilerView._categories)
        return WebInspector.PaintProfilerView._categories;
    WebInspector.PaintProfilerView._categories = {
        shapes: new WebInspector.PaintProfilerCategory("shapes", WebInspector.UIString("Shapes"), "rgb(255, 161, 129)"),
        bitmap: new WebInspector.PaintProfilerCategory("bitmap", WebInspector.UIString("Bitmap"), "rgb(136, 196, 255)"),
        text: new WebInspector.PaintProfilerCategory("text", WebInspector.UIString("Text"), "rgb(180, 255, 137)"),
        misc: new WebInspector.PaintProfilerCategory("misc", WebInspector.UIString("Misc"), "rgb(206, 160, 255)")
    };
    return WebInspector.PaintProfilerView._categories;
};

/**
 * @constructor
 * @param {string} name
 * @param {string} title
 * @param {string} color
 */
WebInspector.PaintProfilerCategory = function(name, title, color)
{
    this.name = name;
    this.title = title;
    this.color = color;
}

/**
 * @return {!Object.<string, !WebInspector.PaintProfilerCategory>}
 */
WebInspector.PaintProfilerView._initLogItemCategories = function()
{
    if (WebInspector.PaintProfilerView._logItemCategoriesMap)
        return WebInspector.PaintProfilerView._logItemCategoriesMap;

    var categories = WebInspector.PaintProfilerView.categories();

    var logItemCategories = {};
    logItemCategories["Clear"] = categories["misc"];
    logItemCategories["DrawPaint"] = categories["misc"];
    logItemCategories["DrawData"] = categories["misc"];
    logItemCategories["SetMatrix"] = categories["misc"];
    logItemCategories["PushCull"] = categories["misc"];
    logItemCategories["PopCull"] = categories["misc"];
    logItemCategories["Translate"] = categories["misc"];
    logItemCategories["Scale"] = categories["misc"];
    logItemCategories["Concat"] = categories["misc"];
    logItemCategories["Restore"] = categories["misc"];
    logItemCategories["SaveLayer"] = categories["misc"];
    logItemCategories["Save"] = categories["misc"];
    logItemCategories["BeginCommentGroup"] = categories["misc"];
    logItemCategories["AddComment"] = categories["misc"];
    logItemCategories["EndCommentGroup"] = categories["misc"];
    logItemCategories["ClipRect"] = categories["misc"];
    logItemCategories["ClipRRect"] = categories["misc"];
    logItemCategories["ClipPath"] = categories["misc"];
    logItemCategories["ClipRegion"] = categories["misc"];
    logItemCategories["DrawPoints"] = categories["shapes"];
    logItemCategories["DrawRect"] = categories["shapes"];
    logItemCategories["DrawOval"] = categories["shapes"];
    logItemCategories["DrawRRect"] = categories["shapes"];
    logItemCategories["DrawPath"] = categories["shapes"];
    logItemCategories["DrawVertices"] = categories["shapes"];
    logItemCategories["DrawDRRect"] = categories["shapes"];
    logItemCategories["DrawBitmap"] = categories["bitmap"];
    logItemCategories["DrawBitmapRectToRect"] = categories["bitmap"];
    logItemCategories["DrawBitmapMatrix"] = categories["bitmap"];
    logItemCategories["DrawBitmapNine"] = categories["bitmap"];
    logItemCategories["DrawSprite"] = categories["bitmap"];
    logItemCategories["DrawPicture"] = categories["bitmap"];
    logItemCategories["DrawText"] = categories["text"];
    logItemCategories["DrawPosText"] = categories["text"];
    logItemCategories["DrawPosTextH"] = categories["text"];
    logItemCategories["DrawTextOnPath"] = categories["text"];

    WebInspector.PaintProfilerView._logItemCategoriesMap = logItemCategories;
    return logItemCategories;
}

/**
 * @param {!Object} logItem
 * @return {!WebInspector.PaintProfilerCategory}
 */
WebInspector.PaintProfilerView._categoryForLogItem = function(logItem)
{
    var method = logItem.method.toTitleCase();

    var logItemCategories = WebInspector.PaintProfilerView._initLogItemCategories();
    var result = logItemCategories[method];
    if (!result) {
        result = WebInspector.PaintProfilerView.categories()["misc"];
        logItemCategories[method] = result;
    }
    return result;
}
