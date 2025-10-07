const { ipcMain, app: App, dialog } = require("electron");
const { join } = require("path");
const { format } = require("url");

const Window = require("./lib/Window.js");

const compareSavedConfiguration = require("./models/compareSavedConfiguration.js");
const handleCreateMachine = require("./models/createMachine.js");
const getAppVersion = require("./models/getAppVersion.js");
const getConfigLanguage = require("./models/getConfigLanguage.js");
const getExistFolder = require("./models/getExistFolder.js");
const getIcon = require("./models/getIcon.js");
const getHandleInit = require("./models/getInit.js");
const getLanguageList = require("./models/getLanguageList.js");
const getNotification = require("./models/getNotification.js");
const getOSPlatform = require("./models/getOSPlatform.js");
const getTransition = require("./models/getTransition.js");
const handleInvokeMachine = require("./models/invokeMachine.js");
const openFileDialog = require("./models/openFileDialog.js");
const openSpecificFolder = require("./models/openSpecificFolder.js");
const openURL = require("./models/openURL.js");
const removeMachine = require("./models/removeMachine.js");
const renameMachine = require("./models/renameMachine.js");
const { ErrorType, TAB_KEY } = require("./shared/index.js");
const globalState = require("./shared/state.js");
const { fixLocalizationButton } = require("./shared/utils.js");

const lockInstance = App.requestSingleInstanceLock();
if (!lockInstance) {
  App.quit();
}

function main() {
  globalState.mainWindow = new Window({
    file: format({
      pathname: join(App.getAppPath(), "dist", "index.html"),
      protocol: "file:",
      slashes: true,
    }),
    webPreferences: {
      preload: join(App.getAppPath(), "preload.cjs"),
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false,
    },
    icon: join(App.getAppPath(), "assets/icon", getIcon()),
    width: 550,
    height: 550,
  });
  globalState.mainWindow.setMenu(null);
  // globalState.mainWindow.webContents.openDevTools();

  globalState.mainWindow.on("close", (e) => {
    const getDictionary = getTransition(globalState.dictionary);
    const isExistActiveMachines = Array.from(
      globalState.activeMachinesByFolder,
      ([, machineValues]) => machineValues
    ).some((machineList) => machineList.size !== 0);

    if (isExistActiveMachines) {
      e.preventDefault();
      dialog.showMessageBox({
        type: "info",
        buttons: fixLocalizationButton("OK"),
        message: getDictionary("closeMessage"),
      });
    }
  });

  globalState.mainWindow.webContents.on("before-input-event", (e, { key }) => {
    if (key === TAB_KEY && globalState.isLockProcess) {
      e.preventDefault();
    }
  });
}

App.on("ready", main);

App.on("second-instance", () => {
  return false;
});

function getInitHandler(e, preferences) {
  globalState.configuration = getHandleInit(e, {
    preferences,
    dictionary: globalState.dictionary,
    configuration: globalState.configuration,
    activeMachinesByFolder: globalState.activeMachinesByFolder,
  });
}

async function createMachineHandler(_, machineName) {
  return await handleCreateMachine({
    machineName,
    dictionary: globalState.dictionary,
    configuration: globalState.configuration,
  });
}

async function invokeMachineHandler(e, machineId) {
  await handleInvokeMachine(e, {
    machineId,
    dictionary: globalState.dictionary,
    configuration: globalState.configuration,
    mainWindow: globalState.mainWindow,
  });
}

async function getConfigLanguageHandler(e, { language, isSelected = false }) {
  globalState.dictionary = await getConfigLanguage(e, {
    lang: language,
    isSelected,
  });

  return globalState.dictionary;
}

function setConfigLanguage(e) {  
  e.reply("set-config-language", {
    language: globalState.language,
    dictionary: globalState.dictionary,
  });
}

async function renameMachineHandler(e, machineName, newMachineName) {
  if (globalState.isLockProcess){
    return new Error(ErrorType.IsBlockProcess);
  }

  try {
    globalState.isLockProcess = true;
    const result = await renameMachine(e, {
      machineName,
      newMachineName,
      dictionary: globalState.dictionary,
      configuration: globalState.configuration,
      mainWindow: globalState.mainWindow,
    });
    globalState.isLockProcess = false;
    return result;
  } catch (error) {
    globalState.isLockProcess = false;
    throw error;
  }
}

async function removeMachineHandler(e, machineName) {
  if (globalState.isLockProcess) {
    return new Error(ErrorType.IsBlockProcess);
  }

  try {
    globalState.isLockProcess = true;
    const result = await removeMachine(e, {
      machineName,
      dictionary: globalState.dictionary,
      configuration: globalState.configuration,
      mainWindow: globalState.mainWindow,
    });
    globalState.isLockProcess = false;
    return result;
  } catch (error) {
    globalState.isLockProcess = false;
    throw error;
  }
}

function compareSavedConfigurationHandler(_, localConfiguration) {
  compareSavedConfiguration({
    localConfiguration,
    configuration: globalState.configuration,
  });
}

function getAppVersionHandler() {
  getAppVersion({
    dictionary: globalState.dictionary,
    mainWindow: globalState.mainWindow,
  });
}

ipcMain.on("get-init", getInitHandler);

ipcMain.on("invoke-machine", invokeMachineHandler);

ipcMain.on("get-notification", getNotification);

ipcMain.on("get-version", getAppVersionHandler);

ipcMain.on("open-url", openURL);

ipcMain.handle("compare-configuration", compareSavedConfigurationHandler);

ipcMain.handle("create-machine", createMachineHandler);

ipcMain.handle("get-config-language", getConfigLanguageHandler);

ipcMain.handle("remove-machine", removeMachineHandler);

ipcMain.handle("rename-machine", renameMachineHandler);

ipcMain.handle("exist-folder", getExistFolder);

ipcMain.handle("exist-app-path", (_, checkedFolder) =>
  getExistFolder(_, join(App.getAppPath(), checkedFolder))
);

ipcMain.handle(
  "open-file-dialog",
  openFileDialog({ mainWindow: globalState.mainWindow })
);

ipcMain.handle("get-platform", getOSPlatform);

ipcMain.on('open-specific-folder', openSpecificFolder);

ipcMain.handle("get-language-list", getLanguageList);

ipcMain.on("set-config-language", setConfigLanguage);