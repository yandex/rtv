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
 * @extends {WebInspector.DialogDelegate}
 * @param {string} fileSystemPath
 */
WebInspector.EditFileSystemDialog = function(fileSystemPath)
{
    WebInspector.DialogDelegate.call(this);
    this.element.classList.add("dialog-contents");
    this._fileSystemPath = fileSystemPath;

    var header = this.element.createChild("div", "header");
    var headerText = header.createChild("span");
    headerText.textContent = WebInspector.UIString("Edit file system");

    var contents = this.element.createChild("div", "contents");

    WebInspector.fileSystemMapping.addEventListener(WebInspector.FileSystemMapping.Events.FileMappingAdded, this._fileMappingAdded, this);
    WebInspector.fileSystemMapping.addEventListener(WebInspector.FileSystemMapping.Events.FileMappingRemoved, this._fileMappingRemoved, this);
    WebInspector.isolatedFileSystemManager.addEventListener(WebInspector.IsolatedFileSystemManager.Events.ExcludedFolderAdded, this._excludedFolderAdded, this);
    WebInspector.isolatedFileSystemManager.addEventListener(WebInspector.IsolatedFileSystemManager.Events.ExcludedFolderRemoved, this._excludedFolderRemoved, this);

    var blockHeader = contents.createChild("div", "block-header");
    blockHeader.textContent = WebInspector.UIString("Mappings");
    this._fileMappingsSection = contents.createChild("div", "section");
    this._fileMappingsListContainer = this._fileMappingsSection.createChild("div", "settings-list-container");
    var entries = WebInspector.fileSystemMapping.mappingEntries(this._fileSystemPath);

    var urlColumn = { id: "url", placeholder: WebInspector.UIString("URL prefix") };
    var pathColumn = { id: "path", placeholder: WebInspector.UIString("Folder path") };

    this._fileMappingsList = new WebInspector.EditableSettingsList([urlColumn, pathColumn], this._fileMappingValuesProvider.bind(this), this._fileMappingValidate.bind(this), this._fileMappingEdit.bind(this));
    this._fileMappingsList.addEventListener(WebInspector.SettingsList.Events.Removed, this._fileMappingRemovedfromList.bind(this));

    this._fileMappingsList.element.classList.add("file-mappings-list");
    this._fileMappingsListContainer.appendChild(this._fileMappingsList.element);

    this._entries = {};
    for (var i = 0; i < entries.length; ++i)
        this._addMappingRow(entries[i]);

    blockHeader = contents.createChild("div", "block-header");
    blockHeader.textContent = WebInspector.UIString("Excluded folders");
    this._excludedFolderListSection = contents.createChild("div", "section excluded-folders-section");
    this._excludedFolderListContainer = this._excludedFolderListSection.createChild("div", "settings-list-container");

    this._excludedFolderList = new WebInspector.EditableSettingsList([pathColumn], this._excludedFolderValueProvider.bind(this), this._excludedFolderValidate.bind(this), this._excludedFolderEdit.bind(this));
    this._excludedFolderList.addEventListener(WebInspector.SettingsList.Events.Removed, this._excludedFolderRemovedfromList.bind(this));
    this._excludedFolderList.element.classList.add("excluded-folders-list");
    this._excludedFolderListContainer.appendChild(this._excludedFolderList.element);
    /** @type {!Set<string>} */
    this._excludedFolderEntries = new Set();
    for (var folder of WebInspector.isolatedFileSystemManager.fileSystem(fileSystemPath).excludedFolders().values())
        this._addExcludedFolderRow(folder, false);
    for (var folder of WebInspector.isolatedFileSystemManager.fileSystem(fileSystemPath).nonConfigurableExcludedFolders().values())
        this._addExcludedFolderRow(folder, true);

    this.element.tabIndex = 0;
    this._hasMappingChanges = false;
}

WebInspector.EditFileSystemDialog.show = function(fileSystemPath)
{
    var dialog = new WebInspector.EditFileSystemDialog(fileSystemPath);
    WebInspector.Dialog.show(dialog, false, true);
    var glassPane = dialog.element.ownerDocument.getElementById("glass-pane");
    glassPane.classList.add("settings-glass-pane");
}

WebInspector.EditFileSystemDialog.prototype = {
    /**
     * @override
     * @param {!Element} element
     */
    show: function(element)
    {
        this._dialogElement = element;
        element.appendChild(this.element);
        element.classList.add("settings-dialog", "settings-tab");
    },

    _resize: function()
    {
        if (!this._dialogElement || !this._container)
            return;

        const minWidth = 200;
        const minHeight = 150;
        var maxHeight = this._container.offsetHeight - 10;
        maxHeight = Math.max(minHeight, maxHeight);
        var maxWidth = Math.min(740, this._container.offsetWidth - 10);
        maxWidth = Math.max(minWidth, maxWidth);
        this._dialogElement.style.maxHeight = maxHeight + "px";
        this._dialogElement.style.width = maxWidth + "px";

        WebInspector.DialogDelegate.prototype.position(this._dialogElement, this._container);
    },

    /**
     * @override
     * @param {!Element} element
     * @param {!Element} container
     */
    position: function(element, container)
    {
        this._container = container;
        this._resize();
    },

    willHide: function(event)
    {
        if (!this._hasMappingChanges)
            return;
        if (window.confirm(WebInspector.UIString("It is recommended to restart DevTools after making these changes. Would you like to restart it?")))
            WebInspector.reload();
    },

    _fileMappingAdded: function(event)
    {
        var entry = /** @type {!WebInspector.FileSystemMapping.Entry} */ (event.data);
        this._addMappingRow(entry);
    },

    _fileMappingRemoved: function(event)
    {
        var entry = /** @type {!WebInspector.FileSystemMapping.Entry} */ (event.data);
        if (this._fileSystemPath !== entry.fileSystemPath)
            return;
        delete this._entries[entry.urlPrefix];
        if (this._fileMappingsList.itemForId(entry.urlPrefix))
            this._fileMappingsList.removeItem(entry.urlPrefix);
        this._resize();
    },

    /**
     * @param {string} itemId
     * @param {string} columnId
     * @return {string}
     */
    _fileMappingValuesProvider: function(itemId, columnId)
    {
        if (!itemId)
            return "";
        var entry = this._entries[itemId];
        switch (columnId) {
        case "url":
            return entry.configurable ? entry.urlPrefix : WebInspector.UIString("%s (via .devtools)", entry.urlPrefix);
        case "path":
            return entry.pathPrefix;
        default:
            console.assert("Should not be reached.");
        }
        return "";
    },

    /**
     * @param {?string} itemId
     * @param {!Object} data
     */
    _fileMappingValidate: function(itemId, data)
    {
        var oldPathPrefix = itemId ? this._entries[itemId].pathPrefix : null;
        return this._validateMapping(data["url"], itemId, data["path"], oldPathPrefix);
    },

    /**
     * @param {?string} itemId
     * @param {!Object} data
     */
    _fileMappingEdit: function(itemId, data)
    {
        if (itemId) {
            var urlPrefix = itemId;
            var pathPrefix = this._entries[itemId].pathPrefix;
            var fileSystemPath = this._entries[itemId].fileSystemPath;
            WebInspector.fileSystemMapping.removeFileMapping(fileSystemPath, urlPrefix, pathPrefix);
        }
        this._addFileMapping(data["url"], data["path"]);
    },

    /**
     * @param {string} urlPrefix
     * @param {?string} allowedURLPrefix
     * @param {string} path
     * @param {?string} allowedPathPrefix
     */
    _validateMapping: function(urlPrefix, allowedURLPrefix, path, allowedPathPrefix)
    {
        var columns = [];
        if (!this._checkURLPrefix(urlPrefix, allowedURLPrefix))
            columns.push("url");
        if (!this._checkPathPrefix(path, allowedPathPrefix))
            columns.push("path");
        return columns;
    },

    /**
     * @param {!WebInspector.Event} event
     */
    _fileMappingRemovedfromList: function(event)
    {
        var urlPrefix = /** @type{?string} */ (event.data);
        if (!urlPrefix)
            return;

        var entry = this._entries[urlPrefix];
        WebInspector.fileSystemMapping.removeFileMapping(entry.fileSystemPath, entry.urlPrefix, entry.pathPrefix);
        this._hasMappingChanges = true;
    },

    /**
     * @param {string} urlPrefix
     * @param {string} pathPrefix
     * @return {boolean}
     */
    _addFileMapping: function(urlPrefix, pathPrefix)
    {
        var normalizedURLPrefix = this._normalizePrefix(urlPrefix);
        var normalizedPathPrefix = this._normalizePrefix(pathPrefix);
        WebInspector.fileSystemMapping.addFileMapping(this._fileSystemPath, normalizedURLPrefix, normalizedPathPrefix);
        this._hasMappingChanges = true;
        this._fileMappingsList.selectItem(normalizedURLPrefix);
        return true;
    },

    /**
     * @param {string} prefix
     * @return {string}
     */
    _normalizePrefix: function(prefix)
    {
        if (!prefix)
            return "";
        return prefix + (prefix[prefix.length - 1] === "/" ? "" : "/");
    },

    _addMappingRow: function(entry)
    {
        var fileSystemPath = entry.fileSystemPath;
        var urlPrefix = entry.urlPrefix;
        if (!this._fileSystemPath || this._fileSystemPath !== fileSystemPath)
            return;

        this._entries[urlPrefix] = entry;
        // Insert configurable entries before non-configurable.
        var insertBefore = null;
        if (entry.configurable) {
            for (var prefix in this._entries) {
                if (!this._entries[prefix].configurable) {
                    insertBefore = prefix;
                    break;
                }
            }
        }
        this._fileMappingsList.addItem(urlPrefix, insertBefore, !entry.configurable);
        this._resize();
    },

    /**
     * @param {!WebInspector.Event} event
     */
    _excludedFolderAdded: function(event)
    {
        var path = /** @type {string} */ (event.data);
        this._addExcludedFolderRow(path, false);
    },

    /**
     * @param {!WebInspector.Event} event
     */
    _excludedFolderRemoved: function(event)
    {
        var path = /** @type {string} */ (event.data);
        delete this._excludedFolderEntries[path];
        if (this._excludedFolderList.itemForId(path))
            this._excludedFolderList.removeItem(path);
    },

    /**
     * @param {string} itemId
     * @param {string} columnId
     * @return {string}
     */
    _excludedFolderValueProvider: function(itemId, columnId)
    {
        return itemId;
    },

    /**
     * @param {?string} itemId
     * @param {!Object} data
     */
    _excludedFolderValidate: function(itemId, data)
    {
        var columns = [];
        if (!this._validateExcludedFolder(data["path"], itemId))
            columns.push("path");
        return columns;
    },

    /**
     * @param {string} path
     * @param {?string} allowedPath
     * @return {boolean}
     */
    _validateExcludedFolder: function(path, allowedPath)
    {
        return !!path && (path === allowedPath || !this._excludedFolderEntries.has(path));
    },

    /**
     * @param {?string} itemId
     * @param {!Object} data
     */
    _excludedFolderEdit: function(itemId, data)
    {
        if (itemId)
            WebInspector.isolatedFileSystemManager.fileSystem(this._fileSystemPath).removeExcludedFolder(itemId);
        var excludedFolderPath = data["path"];
        WebInspector.isolatedFileSystemManager.fileSystem(this._fileSystemPath).addExcludedFolder(excludedFolderPath);
    },

    /**
     * @param {!WebInspector.Event} event
     */
    _excludedFolderRemovedfromList: function(event)
    {
        var itemId = /** @type{?string} */ (event.data);
        if (!itemId)
            return;
        WebInspector.isolatedFileSystemManager.fileSystem(this._fileSystemPath).removeExcludedFolder(itemId);
    },

    /**
     * @param {string} path
     * @param {boolean} readOnly
     */
    _addExcludedFolderRow: function(path, readOnly)
    {
        if (this._excludedFolderEntries.has(path))
            return;
        this._excludedFolderEntries.add(path);
        if (readOnly && !this._firstNonConfigurableExcludedFolder)
            this._firstNonConfigurableExcludedFolder = WebInspector.UIString("%s (via .devtools)", path);

        // Insert configurable entries before non-configurable.
        var insertBefore = readOnly ? null : this._firstNonConfigurableExcludedFolder;
        this._excludedFolderList.addItem(readOnly ? WebInspector.UIString("%s (via .devtools)", path) : path, insertBefore, readOnly);
        this._resize();
    },

    /**
     * @param {string} value
     * @param {?string} allowedPrefix
     * @return {boolean}
     */
    _checkURLPrefix: function(value, allowedPrefix)
    {
        var prefix = this._normalizePrefix(value);
        return !!prefix && (prefix === allowedPrefix || !this._entries[prefix]);
    },

    /**
     * @param {string} value
     * @param {?string} allowedPrefix
     * @return {boolean}
     */
    _checkPathPrefix: function(value, allowedPrefix)
    {
        var prefix = this._normalizePrefix(value);
        if (!prefix)
            return false;
        if (prefix === allowedPrefix)
            return true;
        for (var urlPrefix in this._entries) {
            var entry = this._entries[urlPrefix];
            if (urlPrefix && entry.pathPrefix === prefix)
                return false;
        }
        return true;
    },

    focus: function()
    {
        WebInspector.setCurrentFocusElement(this.element);
    },

    onEnter: function()
    {
    },

    __proto__: WebInspector.DialogDelegate.prototype
}
