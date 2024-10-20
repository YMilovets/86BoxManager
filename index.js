import { ipcMain, app as App, dialog, Notification } from "electron";
import { join } from "path";

import { Window } from "./lib/Window.js";
import { existsSync, mkdir, readdirSync } from "fs";
import { exec } from "child_process";
import { format } from "url";

const ROOT_DIR = `${App.getPath("home")}//.86Box`;
const lockInstance = App.requestSingleInstanceLock();
if (!lockInstance) {
  App.quit();
}
let isMachineStarted = new Set();
let mainWindow = null;

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
    if (isMachineStarted.size !== 0) {
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
  isMachineStarted.add(machineId);
  mainWindow.minimize();

  exec(`cd ${ROOT_DIR}/${machineId} && 86Box`, (error, stdout) => {
    if (error) {
      dialog.showMessageBox({
        type: "error",
        buttons: ["OK"],
        message: `Виртуальной машины ${machineId} больше не существует`,
      });
      isMachineStarted.delete(machineId);
      getHandleInit(e);
      mainWindow?.show();
      return false;
    }
    if (stdout) {
      e.reply("unlocked-machine", machineId);
      isMachineStarted.delete(machineId);
      mainWindow?.show();
    }
  });
}

async function handleCreateMachine(_, machineName) {
  const newPathMachine = join(ROOT_DIR, machineName);

  if (existsSync(newPathMachine)) {
    throw new Error("0x000");
  }

  return mkdir(newPathMachine, () => {
    new Notification({
      title: "Добавление виртуальной машины",
      body: `Виртуальная машина ${machineName} была успешно добавлена`,
    }).show();
  });
}

ipcMain.on("get-init", getHandleInit);

ipcMain.on("invoke-machine", handleInvokeMachine);

ipcMain.handle("create-machine", handleCreateMachine);
