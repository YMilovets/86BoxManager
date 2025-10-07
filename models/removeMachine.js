import { dialog, Notification } from "electron";
import { existsSync, rmSync } from "fs";
import { join } from "path";

import { ErrorType } from "../shared/index.js";
import { fixLocalizationButton } from "../shared/utils.js";

import getExistFolder from "./getExistFolder.js";
import getTransition from "./getTransition.js";

export default async function removeMachine(
  e,
  { machineName, dictionary, configuration, mainWindow }
) {
  const getDictionary = getTransition(dictionary);

  function getExistMachineFolder() {
    return existsSync(join(configuration.pathConfig, machineName));
  }

  if (!getExistMachineFolder()) {
    new Notification({
      title: getDictionary("removeErrorNonExistMachineTitle", (result) =>
        result.replace("$machineName", machineName)
      ),
      body: getDictionary("removeErrorNonExistMachineMessage", (result) =>
        result.replace("$machineName", machineName)
      ),
    }).show();
    throw new Error(ErrorType.NoExistMachineFolder);
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

  const isExistFolder = await getExistFolder(e, configuration.pathConfig);

  if (!exitCode && !getExistMachineFolder() && !isExistFolder) {
    throw new Error(ErrorType.NoExistSpecificFolderAndMachine);
  }

  if (!exitCode && !getExistMachineFolder()) {
    new Notification({
      title: getDictionary("updateListAfterCloseDialogTitle"),
      body: getDictionary("updateListAfterCloseDialogMessage", (result) =>
        result.replace("$machineName", machineName)
      ),
    }).show();
    throw new Error(ErrorType.NoExistMachineFolder);
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
    throw new Error(ErrorType.NoExistSpecificFolder);
  }

  try {
    if (exitCode && !getExistMachineFolder()) {
      throw new Error(ErrorType.NoExistMachineFolder);
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

    throw error;
  }
}