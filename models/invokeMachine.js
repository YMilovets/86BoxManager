import { exec } from "child_process";
import { dialog } from "electron";
import { promisify } from "util";

import { globalState } from "../shared/state.js";
import { fixLocalizationButton, formatHexNumber } from "../shared/utils.js";
import {
  LINUX_ERROR_CODE_NOT_FOUND,
  LINUX_ERROR_CODE_SEGMENTATION,
  PlatformList,
  WINDOWS_ERROR_CODE_NOT_FOUND,
  WINDOWS_ERROR_CODE_SEGMENTATION,
} from "../src/Shared/Constants/index.js";

import getExistFolder from "./getExistFolder.js";
import getHandleInit from "./getInit.js";
import getOSPlatform from "./getOSPlatform.js";
import getTransition from "./getTransition.js";

const execAsync = promisify(exec);

function verifyErrorInvokeMachine(code, dictionary = {}) {
  const getDictionary = getTransition(dictionary);

  const isOSWindows = getOSPlatform() === PlatformList.Windows;
  const isOSLinux = getOSPlatform() === PlatformList.Linux;

  if (isOSWindows && code === WINDOWS_ERROR_CODE_NOT_FOUND) {
    throw new Error(
      getDictionary("failLaunchApp", (result) =>
        result.replace("$errorCode", code)
      )
    );
  }

  if (isOSWindows && code === WINDOWS_ERROR_CODE_SEGMENTATION) {
    throw new Error(
      getDictionary("failSegmentation", (result) =>
        result.replace("$errorCode", formatHexNumber(code))
      )
    );
  }

  if (isOSLinux && code === LINUX_ERROR_CODE_NOT_FOUND) {
    throw new Error(
      getDictionary("failLaunchApp", (result) =>
        result.replace("$errorCode", code)
      )
    );
  }

  if (isOSLinux && code === LINUX_ERROR_CODE_SEGMENTATION) {
    throw new Error(
      getDictionary("failSegmentation", (result) =>
        result.replace("$errorCode", code)
      )
    );
  }
}

export default async function handleInvokeMachine(
  e,
  { dictionary, machineId, configuration, mainWindow }
) {
  globalState.configuration = configuration;
  const processPathConfiguration = globalState.configuration.pathConfig;
  globalState.activeMachinesByFolder.set(
    processPathConfiguration,
    new Set([
      ...Array.from(
        globalState.activeMachinesByFolder.get(processPathConfiguration) ?? []
      ),
      machineId,
    ])
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
      `${globalState.configuration.pathConfig}/${machineId}`
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
        `${globalState.configuration.pathApp} -P "${globalState.configuration.pathConfig}/${machineId}"`
      );
    } catch (e) {
      verifyErrorInvokeMachine(e.code, dictionary);
    }
  } catch ({ message }) {
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
      new Set(changedActiveMachines)
    );

    const isExistFolder = await getExistFolder(
      e,
      `${globalState.configuration.pathConfig}/${machineId}`
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
    mainWindow?.show();
  }
}
