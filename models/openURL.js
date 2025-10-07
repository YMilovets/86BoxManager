const { shell } = require("electron");

function openURL(_, url) {
  shell.openExternal(url);
}

module.exports = openURL;