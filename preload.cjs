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
  onSetLanguage: (callback) =>
    ipcRenderer.on("set-config-language", (_, args) => callback(args)),
  invokeMachine: (machineId) => ipcRenderer.send("invoke-machine", machineId),
  createMachine: (machineName) =>
    ipcRenderer.invoke("create-machine", machineName),
  changeLanguage: ({ language, isSelected }) =>
    ipcRenderer.invoke("get-config-language", { language, isSelected }),
  existFolder: (checkedFolder) =>
    ipcRenderer.invoke("exist-folder", checkedFolder),
  existAppPath: (currentPath) =>
    ipcRenderer.invoke("exist-app-path", currentPath),
  openFileDialog: (dialogType) =>
    ipcRenderer.invoke("open-file-dialog", dialogType),
  compareSavedConfiguration: (preferences) =>
    ipcRenderer.invoke("compare-configuration", preferences),
  getVersion: () => ipcRenderer.send("get-version"),
  openURL: (url) => ipcRenderer.send("open-url", url),
  getOSPlatform: () => ipcRenderer.invoke("get-platform"),
  openSpecificFolder: () => ipcRenderer.send("open-specific-folder"),
  getLanguageList: () => ipcRenderer.invoke("get-language-list"),
  setConfigLanguage: () => ipcRenderer.send("set-config-language"),
});
