import { ipcMain, app as App, dialog } from "electron";
import { join } from "path";
import { format } from "url";

import { Window } from "./lib/Window.js";

import compareSavedConfiguration from "./models/compareSavedConfiguration.js";
import getAppVersion from "./models/getAppVersion.js";
import getConfigLanguage from "./models/getConfigLanguage.js";
import getHandleInit from "./models/getInit.js";
import getNotification from "./models/getNotification.js";
import getOSPlatform from "./models/getOSPlatform.js";
import getTransition from "./models/getTransition.js";
import getExistFolder from "./models/getExistFolder.js";
import getLanguageList from "./models/getLanguageList.js";
import getIcon from "./models/getIcon.js";
import handleCreateMachine from "./models/createMachine.js";
import handleInvokeMachine from "./models/invokeMachine.js";
import openFileDialog from "./models/openFileDialog.js";
import openSpecificFolder from "./models/openSpecificFolder.js";
import openURL from "./models/openURL.js";
import renameMachine from "./models/renameMachine.js";
import removeMachine from "./models/removeMachine.js";

import { fixLocalizationButton } from "./shared/utils.js";
import { ErrorType, TAB_KEY } from "./shared/index.js";
import { globalState } from "./shared/state.js";

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