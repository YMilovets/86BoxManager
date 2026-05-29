const { shell } = require("electron");

const globalState = require("../shared/state.js");

function openSpecificFolder() {
  shell.openPath(globalState.configuration.pathConfig);
}

module.exports = openSpecificFolder;