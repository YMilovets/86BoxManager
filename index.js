import { ipcMain, app as App, dialog, Notification } from "electron";
import { join } from "path";

import { Window } from "./lib/Window.js";
import {
  existsSync,
  mkdir,
  readdirSync,
  promises,
  renameSync,
  rmSync,
} from "fs";
import { exec } from "child_process";
import { format } from "url";

const ROOT_DIR = `${App.getPath("home")}//.86Box`;
const lockInstance = App.requestSingleInstanceLock();
if (!lockInstance) {
  App.quit();
}
let isMachineStarted = new Set();
let mainWindow = null;
let dictionary = null;

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
    const getDictionary = getTransition(dictionary);
    if (isMachineStarted.size !== 0) {
      e.preventDefault();
      dialog.showMessageBox({
        type: "info",
        buttons: fixLocalizationButton("OK"),
        message: getDictionary("closeMessage"),
      });
    }
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

  const getDictionary = getTransition(dictionary);
  exec(`cd ${ROOT_DIR}/${machineId} && 86Box`, (error, stdout) => {
    if (error) {
      dialog.showMessageBox({
        type: "error",
        buttons: fixLocalizationButton("OK"),
        message: getDictionary("noExistsMachineMessage", (result) =>
          result.replace("$machineName", machineId)
        ),
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
  const getDictionary = getTransition(dictionary);

  if (existsSync(newPathMachine)) {
    throw new Error("0x000");
  }

  return mkdir(newPathMachine, () => {
    new Notification({
      title: getDictionary("addSuccessMachineTitle"),
      body: getDictionary("addSuccessMachineMessage", (result) =>
        result.replace("$machineName", machineName)
      ),
    }).show();
  });
}

async function removeMachine(_, machineName) {
  const getDictionary = getTransition(dictionary);
  try {
    const { response: exitCode } = await dialog.showMessageBox(mainWindow, {
      type: "question",
      title: getDictionary("removeConfirmMachineTitle"),
      message: getDictionary("removeConfirmMachineMessage", (result) =>
        result.replace("$machineName", machineName)
      ),
      buttons: fixLocalizationButton(getDictionary("no"), getDictionary("yes")),
      isModal: true,
    });
    if (exitCode) {
      rmSync(join(ROOT_DIR, machineName), { recursive: true, force: true });
      new Notification({
        title: getDictionary("removeSuccessMachineTitle"),
        body: getDictionary("removeSuccessMachineMessage", (result) =>
          result.replace("$machineName", machineName)
        ),
      }).show();
      return new Promise((resolve) => resolve({ machineName }));
    }
    return new Promise((resolve) => resolve({ machineName: null }));
  } catch (error) {
    new Notification({
      title: getDictionary("removeErrorMachineTitle"),
      body: getDictionary("removeErrorMachineMessage", (result) =>
        result.replace("$machineName", machineName)
      ),
    }).show();
    return new Promise((resolve) => resolve({ machineName: null }));
  }
}

async function renameMachine(_, machineName, newMachineName) {
  const getDictionary = getTransition(dictionary);
  try {
    const { response: exitCode } = await dialog.showMessageBox({
      type: "question",
      title: getDictionary("changeConfirmMachineTitle"),
      message: getDictionary("changeConfirmMachineMessage", (result) =>
        result
          .replace("$machineName", machineName)
          .replace("$newMachineName", newMachineName)
      ),
      buttons: fixLocalizationButton(getDictionary("no"), getDictionary("yes")),
      isModal: true,
    });
    if (exitCode) {
      if (existsSync(join(ROOT_DIR, newMachineName))) {
        new Notification({
          title: getDictionary("changeErrorMachineTitle"),
          body: getDictionary("changeErrorExistMachineMessage", (result) =>
            result.replace("$machineName", newMachineName)
          ),
        }).show();
        return new Promise((resolve) =>
          resolve({ machineName, newMachineName: machineName })
        );
      }
      renameSync(join(ROOT_DIR, machineName), join(ROOT_DIR, newMachineName));
      new Notification({
        title: getDictionary("changeSuccessMachineTitle"),
        body: getDictionary("changeSuccessMachineMessage", (result) =>
          result
            .replace("$machineName", machineName)
            .replace("$newMachineName", newMachineName)
        ),
      }).show();
      return new Promise((resolve) => resolve({ machineName, newMachineName }));
    }
    return new Promise((resolve) => resolve({ machineName: null }));
  } catch (error) {
    new Notification({
      title: getDictionary("changeErrorMachineTitle"),
      body: getDictionary("changeErrorMachineMessage", (result) =>
        result.replace("$machineName", machineName)
      ),
    }).show();
    return new Promise((resolve) =>
      resolve({ machineName, newMachineName: machineName })
    );
  }
}

function fixLocalizationButton(...labelParams) {
  return labelParams?.map((label) => [label, " "].join("")) ?? [];
}

function getTransition(dictionary = null) {
  const defaultDictionary = new Map([
    ["yes", "Да"],
    ["no", "Нет"],
    [
      "closeMessage",
      "Для закрытия окна программы выключите все запущенные виртуальные машины",
    ],
    [
      "noExistsMachineMessage",
      "Виртуальной машины $machineName больше не существует",
    ],
    ["addSuccessMachineTitle", "Добавление виртуальной машины"],
    [
      "addSuccessMachineMessage",
      "Виртуальная машина $machineName была успешно добавлена",
    ],
    ["removeConfirmMachineTitle", "Удалить виртуальную машину"],
    [
      "removeConfirmMachineMessage",
      "Вы действительно хотите удалить машину $machineName",
    ],
    ["removeSuccessMachineTitle", "Успешное удаление"],
    [
      "removeSuccessMachineMessage",
      "Виртуальная машина $machineName успешно удалена",
    ],
    ["removeErrorMachineTitle", "Ошибка удаления вирутальной машины"],
    [
      "removeErrorMachineMessage",
      "Не удалось удалить виртуальную машину $machineName",
    ],
    ["changeConfirmMachineTitle", "Изменить имя виртуальной машины"],
    [
      "changeConfirmMachineMessage",
      "Вы действительно хотите переименовать название машины $machineName на $newMachineName",
    ],
    ["changeSuccessMachineTitle", "Успешное переименование"],
    [
      "changeSuccessMachineMessage",
      "Виртуальная машина $machineName успешно переименована в $newMachineName",
    ],
    ["changeErrorMachineTitle", "Ошибка переименования виртуальной машины"],
    [
      "changeErrorMachineMessage",
      "Не удалось переименовать виртуальную машину $machineName",
    ],
    [
      "changeErrorExistMachineMessage",
      "Виртуальная машина $machineName уже существует. Придумайте новое название",
    ],
  ]);
  return (dictionaryKey, renderDict = (result) => result) => {
    if (dictionary)
      return (
        renderDict(
          new Map(Object.entries(JSON.parse(dictionary))).get(dictionaryKey) ||
            defaultDictionary.get(dictionaryKey) ||
            dictionaryKey
        ) || dictionaryKey
      );
    return renderDict(defaultDictionary.get(dictionaryKey)) || dictionaryKey;
  };
}

async function getConfigLanguage(_, lang) {
  dictionary = await promises.readFile(
    join(App.getAppPath(), `i18n/${lang}.json`),
    "utf-8"
  );

  return dictionary;
}

ipcMain.on("get-init", getHandleInit);

ipcMain.on("invoke-machine", handleInvokeMachine);

ipcMain.handle("create-machine", handleCreateMachine);

ipcMain.handle("get-config-language", getConfigLanguage);

ipcMain.handle("remove-machine", removeMachine);

ipcMain.handle("rename-machine", renameMachine);
