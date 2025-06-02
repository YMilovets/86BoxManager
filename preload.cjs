/* eslint-disable no-undef */
const { contextBridge, ipcRenderer } = require("electron");

let handleUnlockedMachine = null;

contextBridge.exposeInMainWorld("electronAPI", {
  getInit: (configuration) => ipcRenderer.send("get-init", configuration),
  getNotification: (notification) =>
    ipcRenderer.send("get-notification", notification),
  removeMachine: (machineName) =>
    ipcRenderer.invoke("remove-machine", machineName),
  renameMachine: (machineName, newMachineName) =>
    ipcRenderer.invoke("rename-machine", machineName, newMachineName),
  onConfigMachines: (callback) =>
    ipcRenderer.on("get-config-machines", (_, args) => callback(args)),
  onUnlockedConfiguration: (callback) => {
    if (handleUnlockedMachine) {
      handleUnlockedMachine.removeAllListeners("unlocked-machine");
    }
    handleUnlockedMachine = ipcRenderer.on(
      "unlocked-machine",
      (_, configurationId) => callback(configurationId)
    );
    return handleUnlockedMachine;
  },
  invokeMachine: (machineId) => ipcRenderer.send("invoke-machine", machineId),
  createMachine: (machineName) =>
    ipcRenderer.invoke("create-machine", machineName),
  changeLanguage: (lang) => ipcRenderer.invoke("get-config-language", lang),
  existFolder: (checkedFolder) =>
    ipcRenderer.invoke("exist-folder", checkedFolder),
  openFileDialog: (dialogType) =>
    ipcRenderer.invoke("open-file-dialog", dialogType),
  compareSavedConfiguration: (preferences) =>
    ipcRenderer.invoke("compare-configuration", preferences),
});
