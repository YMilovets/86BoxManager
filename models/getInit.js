import { Notification } from "electron";
import { readdirSync } from "fs";

import { ErrorType } from "../shared/index.js";
import { globalState } from "../shared/state.js";

import getTransition from "./getTransition.js";

function updateConfiguration(preferences) {
  if (Object.values(preferences).some((valueConfig) => !valueConfig)) {
    throw new Error(ErrorType.MissingConfiguration);
  }
  globalState.configuration = preferences;
}

export default function getHandleInit(
  e,
  {
    preferences,
    dictionary,
    configuration,
    activeMachinesByFolder,
  }
) {
  globalState.configuration = configuration;
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
    const listConfigFolders = readdirSync(
      globalState.configuration.pathConfig,
      {
        withFileTypes: true,
      }
    )
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

  return globalState.configuration;
}