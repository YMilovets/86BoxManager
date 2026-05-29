const { app: App, dialog } = require("electron");
const { release, type } = require("os");

const { AUTHOR_NAME, RELEASE_YEAR } = require("../shared/index.js");
const { fixLocalizationButton } = require("../shared/utils.js");

const getTransition = require("./getTransition.js");

function getAppVersion({ dictionary, mainWindow }) {
  const getDictionary = getTransition(dictionary);

  const versionList = {
    version: App.getVersion(),
    Electron: globalThis.process.versions.electron,
    Chrome: globalThis.process.versions.chrome,
    Node: globalThis.process.versions.node,
    OS: `${type} ${release}`,
  };

  const description = `${getDictionary("description")}\n`;

  const versionText = Object.entries(versionList)
    .map(([name, version]) => `${getDictionary(name)}: ${version}`)
    .join("\n");

  const currentYear = new Date().getFullYear();

  const lastPeriodYear = currentYear > RELEASE_YEAR ? ` — ${currentYear}` : "";

  const copyright = [
    "",
    `${AUTHOR_NAME}, ${RELEASE_YEAR}${lastPeriodYear}`,
    getDictionary("copyright"),
  ].join("\n");

  const message = [description, versionText, copyright].join("\n");

  dialog.showMessageBox(mainWindow, {
    message,
    title: getDictionary("about"),
    buttons: fixLocalizationButton("OK"),
    type: "info",
  });
}

module.exports = getAppVersion;