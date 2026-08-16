const assert = require('assert');

let caughtData = null;
let caughtFilename = null;

// Mock document
const document = {
  createElement: function(tagName) {
    const el = {
      tagName,
      attributes: {},
      setAttribute: function(k, v) { this.attributes[k] = v; },
      click: function() {
        if (this.attributes['href']) caughtData = this.attributes['href'];
        if (this.attributes['download']) caughtFilename = this.attributes['download'];
      },
      remove: function() {}
    };
    return el;
  },
  body: { appendChild: function() {} }
};

const originalCreateElement = document.createElement.bind(document);

document.createElement = function(tagName, options) {
  const el = originalCreateElement(tagName, options);
  if (tagName.toLowerCase() === 'a') {
    const origSetAttr = el.setAttribute.bind(el);
    el.setAttribute = function(name, value) {
      if (name === 'href' && value.startsWith('data:')) caughtData = value;
      if (name === 'download') caughtFilename = value;
      origSetAttr(name, value);
    };
    el.click = function() {
      // Intercepted!
      console.log('Intercepted click!');
    };
  }
  return el;
};

// Simulate app onSave
const dataStr = "data:text/json;charset=utf-8,{}";
const downloadAnchor = document.createElement('a');
downloadAnchor.setAttribute("href", dataStr);
downloadAnchor.setAttribute("download", `invoice.json`);
document.body.appendChild(downloadAnchor);
downloadAnchor.click();
downloadAnchor.remove();

document.createElement = originalCreateElement; // Restore

console.log('Caught:', caughtData, caughtFilename);
