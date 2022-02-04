## Devtools versions for TVs
Here we host different versions of Devtools for current TV models:
* [Webkit frontend devtools](https://github.com/vitalets/node-webkit-agent-frontend) - Tizen 2
* [38.0.2125.122](https://chromium.googlesource.com/chromium/src/+/refs/tags/38.0.2125.122) - WebOS 1-3
* [47.0.2526.69](https://chromium.googlesource.com/chromium/src/+/refs/tags/47.0.2526.69/third_party/WebKit/Source/devtools) - Tizen 3
* [54.0.2792.0](https://chromium.googlesource.com/chromium/src/+/refs/tags/54.0.2792.0/third_party/WebKit/Source/devtools) - WebOS 4
* [56.0.2924.122](https://chromium.googlesource.com/chromium/src/+/refs/tags/56.0.2924.122/third_party/WebKit/Source/devtools) - Tizen 4+

Commit information about any Chromium version can be found via [omahaproxy](https://omahaproxy.appspot.com).

Although devtools can be hosted directly from TV browser
it is better to host them separately on server. It allows to make several some fixes and improvements.

## Fixes

### Tizen 3:
* put `protocol.json` from [here](https://chromium.googlesource.com/chromium/src/+/refs/tags/47.0.2526.69/third_party/WebKit/Source/devtools/protocol.json)
* generate `SupportedCSSProperties.js` from [here](https://chromium.googlesource.com/chromium/src/+/refs/tags/47.0.2526.69/third_party/WebKit/Source/core/css/CSSProperties.in)
* support `wss` query parameter to allow secure WebSocket connections
   ```js
   if (Runtime.queryParam("wss")) {
       var wss = "wss://" + Runtime.queryParam("wss");
       WebInspector.WebSocketConnection.Create(wss, this._connectionEstablished.bind(this));
       return;
   }
   ```
* disable loading `InspectorBackendCommands.js`. It is not needed because we have `protocol.json`
* remove CSP from `inspector.html`


### Tizen 3+, WebOS 4:
* for compatibility with old browsers put `devtools_compatibility.js`, [original](https://github.com/ChromeDevTools/devtools-frontend/blob/f06e8c075879bcd84def401f4e80afda9b74cc6a/front_end/devtools_compatibility.js)
