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
import { promisify } from "util";

const execAsync = promisify(exec);

const ROOT_DIR = `${App.getPath("home")}//.86Box`;
const lockInstance = App.requestSingleInstanceLock();
if (!lockInstance) {
  App.quit();
}
let isMachineStarted = new Set();
let mainWindow = null;
let dictionary = null;
let isLockProcess = false;

let configuration = {
  pathConfig: ROOT_DIR,
  pathApp: "86Box",
};

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

function getHandleInit(e, preferences) {
  const getDictionary = getTransition(dictionary);

  if (Object.values(preferences).some((valueConfig) => !valueConfig)) {
    new Notification({
      title: getDictionary("firstLaunch"),
      body: getDictionary("firstLaunchMessage"),
    }).show();
    return;
  }
  configuration = preferences;

  try {
    const listConfigFolders = readdirSync(configuration.pathConfig, {
      withFileTypes: true,
    })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);
    e.reply("get-config-machines", listConfigFolders);
  } catch (error) {
    e.reply("get-config-machines", []);
  }
}

async function handleInvokeMachine(e, machineId) {
  isMachineStarted.add(machineId);
  mainWindow.minimize();

  const getDictionary = getTransition(dictionary);

  try {
    const isExistFolder = await getExistFolder(
      e,
      `${configuration.pathConfig}/${machineId}`
    );
    if (!isExistFolder) {
      throw new Error(
        getDictionary("noExistsMachineMessage", (result) =>
          result.replace("$machineName", machineId)
        )
      );
    }

    try {
      await execAsync(
        `${configuration.pathApp} -P "${configuration.pathConfig}/${machineId}"`
      );
    } catch {
      throw new Error(getDictionary("failLaunchApp"));
    }
  } catch ({ message }) {
    dialog.showMessageBox(mainWindow, {
      type: "error",
      buttons: fixLocalizationButton("OK"),
      message,
    });
  } finally {
    e.reply("unlocked-machine", machineId);
    isMachineStarted.delete(machineId);
    mainWindow?.show();
  }
}

async function handleCreateMachine(_, machineName) {
  const newPathMachine = join(configuration.pathConfig, machineName);
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
    if (isLockProcess) {
      return new Error('0x000');
    }
    isLockProcess = true;
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
      rmSync(join(configuration.pathConfig, machineName), {
        recursive: true,
        force: true,
      });
      new Notification({
        title: getDictionary("removeSuccessMachineTitle"),
        body: getDictionary("removeSuccessMachineMessage", (result) =>
          result.replace("$machineName", machineName)
        ),
      }).show();
      isLockProcess = false;
      return new Promise((resolve) => resolve({ machineName }));
    }
    isLockProcess = false;
    return new Promise((resolve) => resolve({ machineName: null }));
  } catch (error) {
    new Notification({
      title: getDictionary("removeErrorMachineTitle"),
      body: getDictionary("removeErrorMachineMessage", (result) =>
        result.replace("$machineName", machineName)
      ),
    }).show();
    isLockProcess = false;
    return new Promise((resolve) => resolve({ machineName: null }));
  }
}

async function renameMachine(
  _,
  machineName,
  newMachineName,
) {
  const getDictionary = getTransition(dictionary);
  try {
    if (isLockProcess) {
      return new Error('0x000');
    }
    isLockProcess = true;
    mainWindow.setIgnoreMouseEvents(true);
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
      if (existsSync(join(configuration.pathConfig, newMachineName))) {
        new Notification({
          title: getDictionary("changeErrorMachineTitle"),
          body: getDictionary("changeErrorExistMachineMessage", (result) =>
            result.replace("$machineName", newMachineName)
          ),
        }).show();

        isLockProcess = false;
        mainWindow.setIgnoreMouseEvents(false);
        return new Promise((resolve) =>
          resolve({ machineName, newMachineName: machineName })
        );
      }
      renameSync(
        join(configuration.pathConfig, machineName),
        join(configuration.pathConfig, newMachineName)
      );
      new Notification({
        title: getDictionary("changeSuccessMachineTitle"),
        body: getDictionary("changeSuccessMachineMessage", (result) =>
          result
            .replace("$machineName", machineName)
            .replace("$newMachineName", newMachineName)
        ),
      }).show();

      isLockProcess = false;
      mainWindow.setIgnoreMouseEvents(false);
      return new Promise((resolve) => resolve({ machineName, newMachineName }));
    }

    isLockProcess = false;
    mainWindow.setIgnoreMouseEvents(false);
    return new Promise((resolve) => resolve({ machineName: null }));
  } catch (error) {
    new Notification({
      title: getDictionary("changeErrorMachineTitle"),
      body: getDictionary("changeErrorMachineMessage", (result) =>
        result.replace("$machineName", machineName)
      ),
    }).show();

    isLockProcess = false;
    mainWindow.setIgnoreMouseEvents(false);
    
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

async function getExistFolder(_, checkedFolder) {
  return existsSync(checkedFolder);
}

async function openFileDialog(_, dialogType) {
  const dialogProps = {
    file: "openFile",
    folder: "openDirectory",
  };
  const {
    canceled,
    filePaths: [path],
  } = await dialog.showOpenDialog(mainWindow, {
    properties: [dialogProps[dialogType]],
  });
  if (canceled) throw canceled;
  return path;
}

ipcMain.on("get-init", getHandleInit);

ipcMain.on("invoke-machine", handleInvokeMachine);

ipcMain.handle("create-machine", handleCreateMachine);

ipcMain.handle("get-config-language", getConfigLanguage);

ipcMain.handle("remove-machine", removeMachine);

ipcMain.handle("rename-machine", renameMachine);

ipcMain.handle("exist-folder", getExistFolder);

ipcMain.handle("open-file-dialog", openFileDialog);
