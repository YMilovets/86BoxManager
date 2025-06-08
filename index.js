import { ipcMain, app as App, dialog, Notification, shell } from "electron";
import { join } from "path";
import { release, type, platform } from "os";

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
const RELEASE_YEAR = 2025;
const lockInstance = App.requestSingleInstanceLock();
if (!lockInstance) {
  App.quit();
}
let activeMachinesByFolder = new Map();
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
    const isExistActiveMachines = Array.from(
      activeMachinesByFolder,
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
}

App.on("ready", main);

App.on("second-instance", () => {
  return false;
});

function updateConfiguration(preferences) {
  if (Object.values(preferences).some((valueConfig) => !valueConfig)) {
    throw new Error("0x000");
  }
  configuration = preferences;
}

function compareSavedConfiguration(_, localConfiguration) {
  const { pathConfig } = localConfiguration;
  const { pathConfig: currentPathConfig } =
    configuration;
  if (pathConfig !== currentPathConfig) {    
    throw new Error("0x003");
  }
}

function getHandleInit(e, preferences) {
  const getDictionary = getTransition(dictionary);
  try {
    updateConfiguration(preferences); 
  } catch (error) {
    new Notification({
      title: getDictionary("firstLaunch"),
      body: getDictionary("firstLaunchMessage"),
    }).show();
  }

  try {
    const listConfigFolders = readdirSync(configuration.pathConfig, {
      withFileTypes: true,
    })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);      
    e.reply("get-config-machines", {
      resultList: listConfigFolders,
      activeMachines: activeMachinesByFolder,
    });
  } catch (error) {
    e.reply("get-config-machines", {
      resultList: [],
      activeMachines: activeMachinesByFolder,
    });
  }
}

async function handleInvokeMachine(e, machineId) {
  const processPathConfiguration = configuration.pathConfig;
  activeMachinesByFolder.set(
    processPathConfiguration,
    new Set([
      ...Array.from(activeMachinesByFolder.get(processPathConfiguration) ?? []),
      machineId,
    ])
  );
  mainWindow.minimize();

  const getDictionary = getTransition(dictionary);
  getHandleInit(e, configuration);

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
    const changedActiveMachines =
      activeMachinesByFolder.get(processPathConfiguration) ?? new Set();
    changedActiveMachines.delete(machineId);

    activeMachinesByFolder.set(
      processPathConfiguration,
      new Set(changedActiveMachines)
    );

    const isExistFolder = await getExistFolder(
      e,
      `${configuration.pathConfig}/${machineId}`
    );

    e.reply("unlocked-machine", {
      machineId,
      isExistFolder,
      processPathConfiguration,
      activeMachines: activeMachinesByFolder,
      prevPathConfiguration: configuration.pathConfig,
      message: {
        title: getDictionary("updateMachinesAfterCloseProcessTitle"),
        text: getDictionary("updateMachinesAfterCloseProcessMessage"),
      },
    });
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
  if (isLockProcess) {
    return new Error("0x000");
  }

  isLockProcess = true;
  if (!existsSync(join(configuration.pathConfig, machineName))) {
    new Notification({
      title: getDictionary("removeErrorNonExistMachineTitle", (result) =>
        result.replace("$machineName", machineName)
      ),
      body: getDictionary("removeErrorNonExistMachineMessage", (result) =>
        result.replace("$machineName", machineName)
      ),
    }).show();
    isLockProcess = false;
    throw new Error("0x001");
  }

  const { response: exitCode } = await dialog.showMessageBox(mainWindow, {
    type: "question",
    title: getDictionary("removeConfirmMachineTitle"),
    message: getDictionary("removeConfirmMachineMessage", (result) =>
      result.replace("$machineName", machineName)
    ),
    buttons: fixLocalizationButton(getDictionary("no"), getDictionary("yes")),
    isModal: true,
  });

  const isExistFolder = await getExistFolder(_, configuration.pathConfig);

  if (
    !exitCode &&
    !existsSync(join(configuration.pathConfig, machineName)) &&
    !isExistFolder
  ) {
    isLockProcess = false;
    throw new Error("0x001");
  }

  if (!exitCode && !existsSync(join(configuration.pathConfig, machineName))) {
    new Notification({
      title: getDictionary("updateListAfterCloseDialogTitle"),
      body: getDictionary("updateListAfterCloseDialogMessage", (result) =>
        result.replace("$machineName", machineName)
      ),
    }).show();
    isLockProcess = false;
    throw new Error("0x001");
  }

  if (exitCode && !isExistFolder) {
    new Notification({
      title: getDictionary("removeErrorPathMachineTitle"),
      body: getDictionary("removeErrorPathMachineMessage", (result) =>
        result
          .replace("$machineName", machineName)
          .replace("$pathMachines", configuration.pathConfig)
      ),
    }).show();
    isLockProcess = false;
    throw new Error("0x001");
  }

  try {
    if (exitCode && !existsSync(join(configuration.pathConfig, machineName))) {
      throw new Error("0x001");
    }
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

    throw error;
  }
}

async function renameMachine(
  _,
  machineName,
  newMachineName,
) {
  const getDictionary = getTransition(dictionary);
  if (isLockProcess) {
    return new Error("0x000");
  }

  if (!existsSync(join(configuration.pathConfig, machineName))) {
    new Notification({
      title: getDictionary("changeErrorNonExistMachineTitle", (result) =>
        result.replace("$machineName", machineName)
      ),
      body: getDictionary("changeErrorNonExistMachineMessage", (result) =>
        result.replace("$machineName", machineName)
      ),
    }).show();
    throw new Error("0x001");
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

  const isExistFolder = await getExistFolder(_, configuration.pathConfig);

  if (
    !exitCode &&
    !existsSync(join(configuration.pathConfig, machineName)) &&
    !isExistFolder
  ) {
    isLockProcess = false;
    mainWindow.setIgnoreMouseEvents(false);
    throw new Error("0x001");
  }

  if (!exitCode && !existsSync(join(configuration.pathConfig, machineName))) {
    isLockProcess = false;
    mainWindow.setIgnoreMouseEvents(false);
    new Notification({
      title: getDictionary("updateListAfterCloseDialogTitle"),
      body: getDictionary("updateListAfterCloseDialogMessage", (result) =>
        result.replace("$machineName", machineName)
      ),
    }).show();
    throw new Error("0x001");
  }

  if (!exitCode) {
    isLockProcess = false;
    mainWindow.setIgnoreMouseEvents(false);
    return new Promise((resolve) => resolve({ machineName: null }));
  }

  if (exitCode && !isExistFolder) {
    new Notification({
      title: getDictionary("renameErrorPathMachineTitle"),
      body: getDictionary("renameErrorPathMachineMessage", (result) =>
        result
          .replace("$machineName", machineName)
          .replace("$pathMachines", configuration.pathConfig)
      ),
    }).show();
    isLockProcess = false;
    mainWindow.setIgnoreMouseEvents(false);
    throw new Error("0x001");
  }

  try {
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
  } catch (error) {
    new Notification({
      title: getDictionary("changeErrorMachineTitle"),
      body: getDictionary("changeErrorMachineMessage", (result) =>
        result.replace("$machineName", machineName)
      ),
    }).show();

    isLockProcess = false;
    mainWindow.setIgnoreMouseEvents(false);

    throw error;
  }
}

function fixLocalizationButton(...labelParams) {
  return labelParams?.map((label) => [label, " "].join("")) ?? [];
}

function getTransition(dictionary = null) {
  const defaultDictionary = new Map([
    ["yes", "Да"],
    ["no", "Нет"],
    ["version", "Версия программы"],
    ["about", "О приложении 86BoxManager"],
    [
      "description",
      "86BoxManager - приложение для создания и управления настройками виртуальных машин 86Box.",
    ],
    ["copyright", "Все права защищены"],
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
    [
      "changeErrorNonExistMachineTitle",
      "Не удалось переименовать виртуальную машину $machineName",
    ],
    [
      "changeErrorNonExistMachineMessage",
      "Виртуальной машины $machineName больше не существует. Переименование машины было прервано, список машин будет обновлен",
    ],
    ["firstLaunch", "Ошибка параметров приложения"],
    [
      "firstLaunchMessage",
      "Произведен первый запуск программы 86BoxManager, или настройки были сброшены. Пожалуйста, настройте каталог размещения виртуальных машин и расположение программы 86Box",
    ],
    [
      "failLaunchApp",
      "Указанный в настройках путь к приложению 86Box не существует. Измените настройки приложения",
    ],
    [
      "removeErrorNonExistMachineTitle",
      "Не удалось удалить виртуальную машину $machineName",
    ],
    [
      "removeErrorNonExistMachineMessage",
      "Виртуальной машины $machineName больше не существует. Удаление машины было прервано, список машин будет обновлен",
    ],
    [
      "updateListAfterCloseDialogTitle",
      "Виртуальной машины больше не существует",
    ],
    [
      "updateListAfterCloseDialogMessage",
      "Виртуальной машины $machineName больше не существует, список машин будет обновлен",
    ],
    ["removeErrorPathMachineTitle", "Ошибка удаления вирутальной машины"],
    [
      "removeErrorPathMachineMessage",
      "Не удалось удалить виртуальную машину $machineName, поскольку не существует директории виртуальных машин $pathMachines",
    ],
    ["renameErrorPathMachineTitle", "Ошибка переименования виртуальной машины"],
    [
      "renameErrorPathMachineMessage",
      "Не удалось переименовать виртуальную машину $machineName, поскольку не существует директории виртуальных машин $pathMachines",
    ],
    [
      "updateMachinesAfterCloseProcessTitle",
      "Список виртуальных машин был обновлен",
    ],
    [
      "updateMachinesAfterCloseProcessMessage",
      "Поскольку папка виртуальных машин $prevPathMachines была заменена на $currentPathMachines, список виртуальных машин был обновлен",
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

function getNotification(_, { title, text }) {
  new Notification({
    title,
    body: text,
  }).show();
}

async function getAppVersion() {
  const getDictionary = getTransition(dictionary);

  const versionList = {
    version: App.getVersion(),
    Electron: globalThis.process.versions.electron,
    Chrome: globalThis.process.versions.chrome,
    Node: globalThis.process.versions.node,
    OS: `${type} ${release}`,
  };

  const description = `${getDictionary("description")}\n`;

  const versionText = Object.entries(versionList)
    .map(([name, version]) => `${getDictionary(name)}: ${version}`)
    .join("\n");

  const currentYear = new Date().getFullYear();

  const copyright = `\nNEXU, 2025${`${
    currentYear !== RELEASE_YEAR ? ` — ${currentYear}` : ""
  }`}.\n${getDictionary("copyright")}`;

  const message = [description, versionText, copyright].join("\n");

  dialog.showMessageBox(mainWindow, {
    message,
    title: getDictionary("about"),
    buttons: fixLocalizationButton("OK"),
    type: "info",
  });
}

function openURL(_, url) {
  shell.openExternal(url);
}

function getOSPlatform() {
  return platform();
}

ipcMain.on("get-init", getHandleInit);

ipcMain.on("invoke-machine", handleInvokeMachine);

ipcMain.on("get-notification", getNotification);

ipcMain.on("get-version", getAppVersion);

ipcMain.on("open-url", openURL);

ipcMain.handle("compare-configuration", compareSavedConfiguration);

ipcMain.handle("create-machine", handleCreateMachine);

ipcMain.handle("get-config-language", getConfigLanguage);

ipcMain.handle("remove-machine", removeMachine);

ipcMain.handle("rename-machine", renameMachine);

ipcMain.handle("exist-folder", getExistFolder);

ipcMain.handle("open-file-dialog", openFileDialog);

ipcMain.handle("get-platform", getOSPlatform);