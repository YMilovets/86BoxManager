import { Notification } from "electron";
import { existsSync, mkdir } from "fs";
import { join } from "path";

import { ErrorType } from "../shared/index.js";

import getTransition from "./getTransition.js";

export default async function handleCreateMachine({
  configuration,
  machineName,
  dictionary,
}) {
  const newPathMachine = join(configuration.pathConfig, machineName);
  const getDictionary = getTransition(dictionary);

  if (existsSync(newPathMachine)) {
    throw new Error(ErrorType.IsExistMachine);
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
