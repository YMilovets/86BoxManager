const { exec } = require("child_process");
const log = require("electron-log/main.js");
const { dialog } = require("electron");
const { promisify } = require("util");

const globalState = require("../shared/state.js");
const {
  fixLocalizationButton,
  formatHexNumber,
} = require("../shared/utils.js");

const getExistFolder = require("./getExistFolder.js");
const getHandleInit = require("./getInit.js");
const getTransition = require("./getTransition.js");
const getOSPlatform = require("./getOSPlatform.js");

const execAsync = promisify(exec);

const WINDOWS_ERROR_CODE_NOT_FOUND = 1;
const WINDOWS_ERROR_CODE_SEGMENTATION = 0xc0000005;

const LINUX_ERROR_CODE_NOT_FOUND = 127;
const LINUX_ERROR_CODE_SEGMENTATION = 139;

const PlatformList = {
  Windows: "win32",
  Linux: "linux",
};

function verifyErrorInvokeMachine(code, dictionary = {}) {
  const getDictionary = getTransition(dictionary);

  const isOSWindows = getOSPlatform() === PlatformList.Windows;
  const isOSLinux = getOSPlatform() === PlatformList.Linux;

  if (isOSWindows && code === WINDOWS_ERROR_CODE_NOT_FOUND) {
    throw new Error(
      getDictionary("failLaunchApp", (result) =>
        result.replace("$errorCode", code),
      ),
    );
  }

  if (isOSWindows && code === WINDOWS_ERROR_CODE_SEGMENTATION) {
    throw new Error(
      getDictionary("failSegmentation", (result) =>
        result.replace("$errorCode", formatHexNumber(code)),
      ),
    );
  }

  if (isOSLinux && code === LINUX_ERROR_CODE_NOT_FOUND) {
    throw new Error(
      getDictionary("failLaunchApp", (result) =>
        result.replace("$errorCode", code),
      ),
    );
  }

  if (isOSLinux && code === LINUX_ERROR_CODE_SEGMENTATION) {
    throw new Error(
      getDictionary("failSegmentation", (result) =>
        result.replace("$errorCode", code),
      ),
    );
  }
}

async function handleInvokeMachine(
  e,
  { dictionary, machineId, configuration, mainWindow },
) {
  globalState.configuration = configuration;
  const processPathConfiguration = globalState.configuration.pathConfig;
  globalState.activeMachinesByFolder.set(
    processPathConfiguration,
    new Set([
      ...Array.from(
        globalState.activeMachinesByFolder.get(processPathConfiguration) ?? [],
      ),
      machineId,
    ]),
  );
  mainWindow.minimize();

  const getDictionary = getTransition(dictionary);
  getHandleInit(e, {
    configuration: globalState.configuration,
    preferences: globalState.configuration,
    activeMachinesByFolder: globalState.activeMachinesByFolder,
    dictionary,
  });

  try {
    const isExistFolder = await getExistFolder(
      e,
      `${globalState.configuration.pathConfig}/${machineId}`,
    );
    if (!isExistFolder) {
      throw new Error(
        getDictionary("noExistsMachineMessage", (result) =>
          result.replace("$machineName", machineId),
        ),
      );
    }

    try {
      log.info(
        getDictionary("startVirtualMachine", (result) =>
          result.replace("$machineName", machineId),
        ),
      );
      await execAsync(
        `${globalState.configuration.pathApp} -P "${globalState.configuration.pathConfig}/${machineId}"`,
      );
    } catch (e) {
      verifyErrorInvokeMachine(e.code, dictionary);
    }
  } catch ({ message }) {
    log.error(message);
    dialog.showMessageBox(mainWindow, {
      type: "error",
      buttons: fixLocalizationButton("OK"),
      message,
    });
  } finally {
    const changedActiveMachines =
      globalState.activeMachinesByFolder.get(processPathConfiguration) ??
      new Set();
    changedActiveMachines.delete(machineId);

    globalState.activeMachinesByFolder.set(
      processPathConfiguration,
      new Set(changedActiveMachines),
    );

    const isExistFolder = await getExistFolder(
      e,
      `${globalState.configuration.pathConfig}/${machineId}`,
    );

    e.reply("unlocked-machine", {
      machineId,
      isExistFolder,
      processPathConfiguration,
      activeMachines: globalState.activeMachinesByFolder,
      prevPathConfiguration: globalState.configuration.pathConfig,
      message: {
        title: getDictionary("updateMachinesAfterCloseProcessTitle"),
        text: getDictionary("updateMachinesAfterCloseProcessMessage"),
      },
    });
    log.info(
      getDictionary("finishVirtualMachine", (result) =>
        result.replace("$machineName", machineId),
      ),
    );
    mainWindow?.show();
  }
}

module.exports = handleInvokeMachine;
