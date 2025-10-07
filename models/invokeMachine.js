import { exec } from "child_process";
import { dialog } from "electron";
import { promisify } from "util";

import { globalState } from "../shared/state.js";
import { fixLocalizationButton } from "../shared/utils.js";

import getExistFolder from "./getExistFolder.js";
import getHandleInit from "./getInit.js";
import getTransition from "./getTransition.js";

const execAsync = promisify(exec);

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
