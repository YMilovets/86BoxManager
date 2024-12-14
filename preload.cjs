/* eslint-disable no-undef */
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  getInit: () => ipcRenderer.send("get-init"),
  removeMachine: (machineName) =>
    ipcRenderer.invoke("remove-machine", machineName),
  renameMachine: (machineName, newMachineName) =>
    ipcRenderer.invoke("rename-machine", machineName, newMachineName),
  onConfigMachines: (callback) =>
    ipcRenderer.on("get-config-machines", (_, args) => callback(args)),
  onUnlockedConfiguration: (callback) =>
    ipcRenderer.on("unlocked-machine", (_, configurationId) =>
      callback(configurationId)
    ),
  invokeMachine: (machineId) => ipcRenderer.send("invoke-machine", machineId),
  createMachine: (machineName) =>
    ipcRenderer.invoke("create-machine", machineName),
});
