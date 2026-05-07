import { dialog, Notification } from "electron";
import log from "electron-log/main.js";
import { existsSync, renameSync } from "fs";
import { join } from "path";

import { ErrorType } from "../shared/index.js";
import { globalState } from "../shared/state.js";
import { fixLocalizationButton } from "../shared/utils.js";

import getExistFolder from "./getExistFolder.js";
import getTransition from "./getTransition.js";

export default async function renameMachine(
  e,
  { machineName, newMachineName, dictionary, configuration, mainWindow }
) {
  const getDictionary = getTransition(dictionary);

  function getExistMachineFolder() {
    return existsSync(join(configuration.pathConfig, machineName));
  }

  function getExistProcessMachineFolder() {
    return existsSync(join(configuration.pathConfig, newMachineName));
  }

  if (!getExistMachineFolder()) {
    new Notification({
      title: getDictionary("changeErrorNonExistMachineTitle", (result) =>
        result.replace("$machineName", machineName)
      ),
      body: getDictionary("changeErrorNonExistMachineMessage", (result) =>
        result.replace("$machineName", machineName)
      ),
    }).show();
    log.error(
      getDictionary("changeErrorNonExistMachineMessage", (result) =>
        result.replace("$machineName", machineName),
      ),
    );
    throw new Error(ErrorType.NoExistMachineFolder);
  }

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

  const isExistFolder = await getExistFolder(e, configuration.pathConfig);

  if (!exitCode && !getExistMachineFolder() && !isExistFolder) {
    mainWindow.setIgnoreMouseEvents(false);
    throw new Error(ErrorType.NoExistSpecificFolderAndMachine);
  }

  if (!exitCode && !getExistMachineFolder()) {
    mainWindow.setIgnoreMouseEvents(false);
    new Notification({
      title: getDictionary("updateListAfterCloseDialogTitle"),
      body: getDictionary("updateListAfterCloseDialogMessage", (result) =>
        result.replace("$machineName", machineName)
      ),
    }).show();
    log.info(
      getDictionary("updateListAfterCloseDialogMessage", (result) =>
        result.replace("$machineName", machineName)
      ),
    )
    throw new Error(ErrorType.NoExistMachineFolder);
  }

  if (!exitCode) {
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
    log.error(
      getDictionary("renameErrorPathMachineMessage", (result) =>
        result
          .replace("$machineName", machineName)
          .replace("$pathMachines", configuration.pathConfig),
      ),
    );
    mainWindow.setIgnoreMouseEvents(false);
    throw new Error(ErrorType.NoExistSpecificFolder);
  }

  const isExistProcessMachine = globalState.activeMachinesByFolder
    .get(configuration.pathConfig)
    ?.has(newMachineName);

  if (exitCode && !getExistProcessMachineFolder() && isExistProcessMachine) {
    new Notification({
      title: getDictionary("renameErrorProcessMachineTitle"),
      body: getDictionary("renameErrorProcessMachineMessage", (result) =>
        result.replace("$machineName", machineName)
      ),
    }).show();
    log.error(
      getDictionary("renameErrorProcessMachineMessage", (result) =>
        result.replace("$machineName", machineName)
      ),
    );
    mainWindow.setIgnoreMouseEvents(false);

    return new Promise((resolve) =>
      resolve({ machineName, newMachineName: machineName })
    );
  }

  try {
    if (existsSync(join(configuration.pathConfig, newMachineName))) {
      new Notification({
        title: getDictionary("changeErrorMachineTitle"),
        body: getDictionary("changeErrorExistMachineMessage", (result) =>
          result.replace("$machineName", newMachineName)
        ),
      }).show();
      log.error(
        getDictionary("changeErrorExistMachineMessage", (result) =>
          result.replace("$machineName", newMachineName),
        ),
      );

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
    log.info(
      getDictionary("changeSuccessMachineMessage", (result) =>
        result
          .replace("$machineName", machineName)
          .replace("$newMachineName", newMachineName)
      ),
    );

    mainWindow.setIgnoreMouseEvents(false);
    return new Promise((resolve) => resolve({ machineName, newMachineName }));
  } catch (error) {
    new Notification({
      title: getDictionary("changeErrorMachineTitle"),
      body: getDictionary("changeErrorMachineMessage", (result) =>
        result.replace("$machineName", machineName)
      ),
    }).show();
    log.error(
      getDictionary("changeErrorMachineMessage", (result) =>
        result.replace("$machineName", machineName),
      ),
    );

    mainWindow.setIgnoreMouseEvents(false);

    throw error;
  }
}
