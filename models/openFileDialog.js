const { dialog } = require("electron");

function openFileDialog({ mainWindow }) {
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
    if (canceled) throw canceled;
    return path;
  };
}

module.exports = openFileDialog;