import { nativeTheme } from "electron";

import { globalState } from "../shared/state.js";
import { PlatformList } from "../src/Shared/Constants/index.js";

import getOSPlatform from "./getOSPlatform.js";

let themeUpdateCount = 0;
export default function updateTheme() {
  const isOSLinux = getOSPlatform() === PlatformList.Linux;

  themeUpdateCount += 1;

  if (isOSLinux && themeUpdateCount > 2) {
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
