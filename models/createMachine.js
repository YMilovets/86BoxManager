const { Notification } = require("electron");
const log = require("electron-log/main.js");

const { existsSync, mkdir } = require("fs");
const { join } = require("path");

const { ErrorType } = require("../shared/index.js");

const getTransition = require("./getTransition.js");

async function handleCreateMachine({
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
    log.info(
      getDictionary("addSuccessMachineMessage", (result) =>
        result.replace("$machineName", machineName),
      ),
    );
    new Notification({
      title: getDictionary("addSuccessMachineTitle"),
      body: getDictionary("addSuccessMachineMessage", (result) =>
        result.replace("$machineName", machineName)
      ),
    }).show();
  });
}

module.exports = handleCreateMachine;