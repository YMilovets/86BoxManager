import { nativeTheme } from "electron";

import { globalState } from "../shared/state.js";
import {
  PlatformList,
} from "../src/Shared/Constants/index.js";

import getOSPlatform from "./getOSPlatform.js";

export default function updateTheme() {
  const isOSLinux = getOSPlatform() === PlatformList.Linux;

  globalState.themeUpdateCount += 1;

  if (isOSLinux && globalState.themeUpdateCount > 2) {
    globalState.mainWindow.webContents.send(
      "watch-theme",
      nativeTheme.shouldUseDarkColors,
    );
  }

  if (!isOSLinux) {
    globalState.mainWindow.webContents.send(
      "watch-theme",
      nativeTheme.shouldUseDarkColors,
    );
  }
}
