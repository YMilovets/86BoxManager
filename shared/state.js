const { app: App } = require("electron");
const { join } = require("path");

const { DEFAULT_FOLDER } = require("./index.js");

const LanguageList = {
  RU: "ru",
  EN: "en",
};

const globalState = {
  activeMachinesByFolder: new Map(),
  mainWindow: null,
  dictionary: null,
  isLockProcess: null,
  configuration: {
    pathConfig: join(App.getPath("home"), DEFAULT_FOLDER),
    pathApp: "86Box",
  },
  languageName: null,
  language: LanguageList.RU,
};

module.exports = globalState;
