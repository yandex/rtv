/**
 * Fix for deprecated event.keyIdentifier in Chrome > 43
 * See: https://github.com/node-inspector/node-inspector/issues/951#issuecomment-290134589
 */
Object.defineProperty(KeyboardEvent.prototype, 'keyIdentifier', {
  get: function() {
    switch (this.key) {
      case "ArrowDown":
        return "Down";
      case "ArrowLeft":
        return "Left";
      case "ArrowRight":
        return "Right";
      case "ArrowUp":
        return "Up";
      case "Tab":
        return "U+0009";
      case "Escape":
        return "U+001B";
      default:
        return this.key;
    }
  }
});
