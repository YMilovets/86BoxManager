import { ipcMain, app as App, dialog, Notification } from "electron";
import { join } from "path";

import { Window } from "./lib/Window.js";
import { existsSync, mkdir, readdirSync, renameSync, rmSync } from "fs";
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

async function removeMachine(e, machineName) {
  try {
    const { response: exitCode } = await dialog.showMessageBox(mainWindow, {
      type: "question",
      title: "Удалить виртуальную машину",
      message: `Вы действительно хотите удалить машину ${machineName}`,
      buttons: ["Да", "Нет"],
      isModal: true
    });
    if (!exitCode) {
      rmSync(join(ROOT_DIR, machineName), { recursive: true, force: true });
      new Notification({
        title: "Успешное удаление",
        body: `Виртуальная машина ${machineName} успешно удалена`,
      }).show();
      return new Promise((resolve) => resolve({ machineName }));
    }
    return new Promise((resolve) => resolve({ machineName: null }));
  } catch (error) {
    new Notification({
      title: "Ошибка удаления вирутальной машины",
      body: `Не удалось удалить виртуальную машину ${machineName}`,
    }).show();
    return new Promise((resolve) => resolve({ machineName: null }));
  }
}

async function renameMachine(_, machineName, newMachineName) {
  try {
    const { response: exitCode } = await dialog.showMessageBox({
      type: "question",
      title: "Изменить имя виртуальной машины",
      message: `Вы действительно хотите переименовать название машины ${machineName} на ${newMachineName}?`,
      buttons: ["Да", "Нет"],
      isModal: true,
    });
    if (!exitCode) {
      renameSync(join(ROOT_DIR, machineName), join(ROOT_DIR, newMachineName));
      new Notification({
        title: "Успешное переименование",
        body: `Виртуальная машина ${machineName} успешно переименована в ${newMachineName}`,
      }).show();
      return new Promise((resolve) => resolve({ machineName, newMachineName }));
    }
    return new Promise((resolve) => resolve({ machineName: null }));
  } catch (error) {
    new Notification({
      title: "Ошибка переименования виртуальной машины",
      body: `Не удалось переименовать виртуальную машину ${machineName}`,
    }).show();
    return new Promise((resolve) =>
      resolve({ machineName, newMachineName: machineName })
    );
  }
}

ipcMain.on("get-init", getHandleInit);

ipcMain.on("invoke-machine", handleInvokeMachine);

ipcMain.handle("create-machine", handleCreateMachine);

ipcMain.handle("remove-machine", removeMachine);

ipcMain.handle("rename-machine", renameMachine);
