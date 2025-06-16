import { app as App, dialog } from "electron";
import { release, type } from "os";

import getTransition from "./getTransition.js";
import { AUTHOR_NAME, RELEASE_YEAR } from "../shared/index.js";
import { fixLocalizationButton } from "../shared/utils.js";

export default function getAppVersion({ dictionary, mainWindow }) {
  const getDictionary = getTransition(dictionary);

  const versionList = {
    version: App.getVersion(),
    Electron: globalThis.process.versions.electron,
    Chrome: globalThis.process.versions.chrome,
    Node: globalThis.process.versions.node,
    OS: `${type} ${release}`,
  };

  const description = `${getDictionary("description")}\n`;

  const versionText = Object.entries(versionList)
    .map(([name, version]) => `${getDictionary(name)}: ${version}`)
    .join("\n");

  const currentYear = new Date().getFullYear();

  const lastPeriodYear = currentYear > RELEASE_YEAR ? ` — ${currentYear}` : "";

  const copyright = [
    "",
    `${AUTHOR_NAME}, ${RELEASE_YEAR}${lastPeriodYear}`,
    getDictionary("copyright"),
  ].join("\n");

  const message = [description, versionText, copyright].join("\n");

  dialog.showMessageBox(mainWindow, {
    message,
    title: getDictionary("about"),
    buttons: fixLocalizationButton("OK"),
    type: "info",
  });
}
