import { ipcMain, app as App, dialog } from "electron";
import { join } from "path";

import { Window } from "./lib/Window.js";
import { readdirSync } from "fs";
import { exec } from "child_process";
import { format } from "url";

const ROOT_DIR = `${App.getPath("home")}//.86Box`;
const lockInstance = App.requestSingleInstanceLock();
if (!lockInstance) {
  App.quit();
}
let mainWindow = null;
let isMachineStarted = false;

function main() {
  mainWindow = new Window({
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
  });
  mainWindow.setMenu(null);
  // mainWindow.webContents.openDevTools();

  mainWindow.on("close", (e) => {
    if (isMachineStarted) {
      e.preventDefault();
      dialog.showMessageBox({
        type: "info",
        buttons: ["OK"],
        message:
          "Для закрытия окна программы выключите все запущенные виртуальные машины",
      });
    }
    return false;
  });
}

App.on("ready", main);

App.on("second-instance", () => {
  return false;
});

function getHandleInit(e) {
  const listConfigFolders = readdirSync(ROOT_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
  e.reply("get-config-machines", listConfigFolders);
}

function handleInvokeMachine(e, machineId) {
  isMachineStarted = true;

  exec(`cd ${ROOT_DIR}/${machineId} && 86Box`, (error, stdout) => {
    if (stdout) {
      e.reply("unlocked-machine", machineId);
      isMachineStarted = false;
    }
  });
}

ipcMain.on("get-init", getHandleInit);

ipcMain.on("invoke-machine", handleInvokeMachine);
