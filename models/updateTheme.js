const { nativeTheme } = require("electron");

const globalState = require("../shared/state.js");

const getOSPlatform = require("./getOSPlatform.js");

const PlatformList = {
  Windows: "win32",
  Linux: "linux",
};

let themeUpdateCount = 0;
function updateTheme() {
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

module.exports = updateTheme;

