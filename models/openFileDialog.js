import { dialog } from "electron";

import { Info } from "../lib/Info.js";

export default function openFileDialog({ mainWindow }) {
  return async (_, dialogType) => {
    const dialogProps = {
      file: "openFile",
      folder: "openDirectory",
    };
    const {
      canceled,
      filePaths: [path],
    } = await dialog.showOpenDialog(mainWindow, {
      properties: [dialogProps[dialogType]],
    });

    if (canceled) throw new Info("closeEvent").toString();
    return path;
  };
}
