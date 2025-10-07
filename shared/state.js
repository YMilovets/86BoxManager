import { app as App } from "electron";
import { join } from "path";

import { LanguageList } from "../src/Shared/Constants/index.js";

import { DEFAULT_FOLDER } from "./index.js";

export const globalState = {
  activeMachinesByFolder: new Map(),
  mainWindow: null,
  dictionary: null,
  isLockProcess: null,
  configuration: {
    pathConfig: join(App.getPath("home"), DEFAULT_FOLDER),
    pathApp: "86Box",
  },
  languageName: null,
  language: LanguageList.RU,
};
