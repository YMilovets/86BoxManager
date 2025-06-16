import { shell } from "electron";

import { globalState } from "../shared/state.js";

export default function openSpecificFolder() {
  shell.openPath(globalState.configuration.pathConfig);
}