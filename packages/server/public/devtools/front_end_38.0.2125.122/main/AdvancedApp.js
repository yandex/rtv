// Copyright 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @constructor
 * @extends {WebInspector.App}
 */
WebInspector.AdvancedApp = function()
{
    WebInspector.App.call(this);
    if (WebInspector.overridesSupport.responsiveDesignAvailable()) {
        this._toggleEmulationButton = new WebInspector.StatusBarButton(WebInspector.UIString("Toggle device mode."), "emulation-status-bar-item");
        this._toggleEmulationButton.toggled = WebInspector.overridesSupport.emulationEnabled();
        this._toggleEmulationButton.addEventListener("click", this._toggleEmulationEnabled, this);
        WebInspector.overridesSupport.addEventListener(WebInspector.OverridesSupport.Events.EmulationStateChanged, this._emulationEnabledChanged, this);
        WebInspector.overridesSupport.addEventListener(WebInspector.OverridesSupport.Events.OverridesWarningUpdated, this._overridesWarningUpdated, this);
    }
    WebInspector.dockController.addEventListener(WebInspector.DockController.Events.BeforeDockSideChanged, this._openToolboxWindow, this);
};

WebInspector.AdvancedApp.prototype = {
    _toggleEmulationEnabled: function()
    {
        var enabled = !this._toggleEmulationButton.toggled;
        if (enabled)
            WebInspector.userMetrics.DeviceModeEnabled.record();
        WebInspector.overridesSupport.setEmulationEnabled(enabled);
    },

    _emulationEnabledChanged: function()
    {
        this._toggleEmulationButton.toggled = WebInspector.overridesSupport.emulationEnabled();
        if (!WebInspector.overridesSupport.responsiveDesignAvailable() && WebInspector.overridesSupport.emulationEnabled())
            WebInspector.inspectorView.showViewInDrawer("emulation", true);
    },

    _overridesWarningUpdated: function()
    {
        if (!this._toggleEmulationButton)
            return;
        var message = WebInspector.overridesSupport.warningMessage();
        this._toggleEmulationButton.title = message || WebInspector.UIString("Toggle device mode.");
        this._toggleEmulationButton.element.classList.toggle("warning", !!message);
    },

    createRootView: function()
    {
        var rootView = new WebInspector.RootView();

        this._rootSplitView = new WebInspector.SplitView(false, true, "InspectorView.splitViewState", 300, 300, true);
        this._rootSplitView.show(rootView.element);

        WebInspector.inspectorView.show(this._rootSplitView.sidebarElement());

        this._inspectedPagePlaceholder = new WebInspector.InspectedPagePlaceholder();
        this._inspectedPagePlaceholder.addEventListener(WebInspector.InspectedPagePlaceholder.Events.Update, this._onSetInspectedPageBounds.bind(this, false), this);
        this._responsiveDesignView = new WebInspector.ResponsiveDesignView(this._inspectedPagePlaceholder);
        this._responsiveDesignView.show(this._rootSplitView.mainElement());

        WebInspector.dockController.addEventListener(WebInspector.DockController.Events.BeforeDockSideChanged, this._onBeforeDockSideChange, this);
        WebInspector.dockController.addEventListener(WebInspector.DockController.Events.DockSideChanged, this._onDockSideChange, this);
        WebInspector.dockController.addEventListener(WebInspector.DockController.Events.AfterDockSideChanged, this._onAfterDockSideChange, this);
        this._onDockSideChange();

        console.timeStamp("AdvancedApp.attachToBody");
        rootView.attachToBody();
        this._inspectedPagePlaceholder.update();
    },

    /**
     * @param {!WebInspector.Target} mainTarget
     */
    presentUI: function(mainTarget)
    {
        WebInspector.App.prototype.presentUI.call(this, mainTarget);
        this._overridesWarningUpdated();
    },

    /**
     * @param {!WebInspector.Event} event
     */
    _openToolboxWindow: function(event)
    {
        if (/** @type {string} */ (event.data.to) !== WebInspector.DockController.State.Undocked)
            return;

        if (this._toolboxWindow)
            return;

        var toolbox = (window.location.search ? "&" : "?") + "toolbox=true";
        var hash = window.location.hash;
        var url = window.location.href.replace(hash, "") + toolbox + hash;
        this._toolboxWindow = window.open(url, undefined);
    },

    /**
     * @param {!WebInspector.ResponsiveDesignView} responsiveDesignView
     * @param {!WebInspector.InspectedPagePlaceholder} placeholder
     */
    toolboxLoaded: function(responsiveDesignView, placeholder)
    {
        this._toolboxResponsiveDesignView = responsiveDesignView;
        placeholder.addEventListener(WebInspector.InspectedPagePlaceholder.Events.Update, this._onSetInspectedPageBounds.bind(this, true));
        this._updatePageResizer();
    },

    _updatePageResizer: function()
    {
        if (this._isDocked())
            this._responsiveDesignView.updatePageResizer();
        else if (this._toolboxResponsiveDesignView)
            this._toolboxResponsiveDesignView.updatePageResizer();
    },

    /**
     * @param {!WebInspector.Event} event
     */
    _onBeforeDockSideChange: function(event)
    {
        if (/** @type {string} */ (event.data.to) === WebInspector.DockController.State.Undocked && this._toolboxResponsiveDesignView) {
            // Hide inspectorView and force layout to mimic the undocked state.
            this._rootSplitView.hideSidebar();
            this._inspectedPagePlaceholder.update();
        }

        this._changingDockSide = true;
    },

    /**
     * @param {!WebInspector.Event=} event
     */
    _onDockSideChange: function(event)
    {
        this._updatePageResizer();

        var toDockSide = event ? /** @type {string} */ (event.data.to) : WebInspector.dockController.dockSide();
        if (toDockSide === WebInspector.DockController.State.Undocked) {
            this._updateForUndocked();
        } else if (this._toolboxResponsiveDesignView && event && /** @type {string} */ (event.data.from) === WebInspector.DockController.State.Undocked) {
            // Don't update yet for smooth transition.
            this._rootSplitView.hideSidebar();
        } else {
            this._updateForDocked(toDockSide);
        }
    },

    /**
     * @param {!WebInspector.Event} event
     */
    _onAfterDockSideChange: function(event)
    {
        // We may get here on the first dock side change while loading without BeforeDockSideChange.
        if (!this._changingDockSide)
            return;
        this._changingDockSide = false;
        if (/** @type {string} */ (event.data.from) === WebInspector.DockController.State.Undocked) {
            // Restore docked layout in case of smooth transition.
            this._updateForDocked(/** @type {string} */ (event.data.to));
        }
        this._inspectedPagePlaceholder.update();
    },

    /**
     * @param {string} dockSide
     */
    _updateForDocked: function(dockSide)
    {
        this._rootSplitView.setVertical(dockSide === WebInspector.DockController.State.DockedToLeft || dockSide === WebInspector.DockController.State.DockedToRight);
        this._rootSplitView.setSecondIsSidebar(dockSide === WebInspector.DockController.State.DockedToRight || dockSide === WebInspector.DockController.State.DockedToBottom);
        this._rootSplitView.toggleResizer(this._rootSplitView.resizerElement(), true);
        this._rootSplitView.toggleResizer(WebInspector.inspectorView.topResizerElement(), dockSide === WebInspector.DockController.State.DockedToBottom);
        this._rootSplitView.showBoth();
    },

    _updateForUndocked: function()
    {
        this._rootSplitView.toggleResizer(this._rootSplitView.resizerElement(), false);
        this._rootSplitView.toggleResizer(WebInspector.inspectorView.topResizerElement(), false);
        this._rootSplitView.hideMain();
    },

    _isDocked: function()
    {
        return WebInspector.dockController.dockSide() !== WebInspector.DockController.State.Undocked;
    },

    /**
     * @param {boolean} toolbox
     * @param {!WebInspector.Event} event
     */
    _onSetInspectedPageBounds: function(toolbox, event)
    {
        if (this._changingDockSide || (this._isDocked() === toolbox))
            return;
        if (!window.innerWidth || !window.innerHeight)
            return;
        var bounds = /** @type {{x: number, y: number, width: number, height: number}} */ (event.data);
        console.timeStamp("AdvancedApp.setInspectedPageBounds");
        InspectorFrontendHost.setInspectedPageBounds(bounds);
    },

    __proto__: WebInspector.App.prototype
};

/**
 * @constructor
 * @implements {WebInspector.StatusBarItem.Provider}
 */
WebInspector.AdvancedApp.DeviceCounter = function()
{
    if (!WebInspector.experimentsSettings.devicesPanel.isEnabled() || !(WebInspector.app instanceof WebInspector.AdvancedApp)) {
        this._counter = null;
        return;
    }

    this._counter = new WebInspector.StatusBarCounter(["device-icon-small"]);
    this._counter.addEventListener("click", showDevices);

    function showDevices()
    {
        WebInspector.inspectorView.showViewInDrawer("devices", true);
    }

    InspectorFrontendHost.setDeviceCountUpdatesEnabled(true);
    InspectorFrontendHost.events.addEventListener(InspectorFrontendHostAPI.Events.DeviceCountUpdated, this._onDeviceCountUpdated, this);
}

WebInspector.AdvancedApp.DeviceCounter.prototype = {
    /**
     * @param {!WebInspector.Event} event
     */
    _onDeviceCountUpdated: function(event)
    {
        var count = /** @type {number} */ (event.data);
        this._counter.setCounter("device-icon-small", count, WebInspector.UIString(count > 1 ? "%d devices found" : "%d device found", count));
        WebInspector.inspectorView.toolbarItemResized();
    },

    /**
     * @return {?WebInspector.StatusBarItem}
     */
    item: function()
    {
        return this._counter;
    }
}

/**
 * @constructor
 * @implements {WebInspector.StatusBarItem.Provider}
 */
WebInspector.AdvancedApp.EmulationButtonProvider = function()
{
}

WebInspector.AdvancedApp.EmulationButtonProvider.prototype = {
    /**
     * @return {?WebInspector.StatusBarItem}
     */
    item: function()
    {
        if (!(WebInspector.app instanceof WebInspector.AdvancedApp))
            return null;
        return WebInspector.app._toggleEmulationButton || null;
    }
}

/**
 * @constructor
 * @implements {WebInspector.ActionDelegate}
 */
WebInspector.AdvancedApp.ToggleDeviceModeActionDelegate = function()
{
}

WebInspector.AdvancedApp.ToggleDeviceModeActionDelegate.prototype = {
    /**
     * @return {boolean}
     */
    handleAction: function()
    {
        if (!WebInspector.overridesSupport.responsiveDesignAvailable())
            return false;
        if (!(WebInspector.app instanceof WebInspector.AdvancedApp))
            return false;
        WebInspector.app._toggleEmulationEnabled();
        return true;
    }
}
