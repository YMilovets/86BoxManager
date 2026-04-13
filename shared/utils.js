const { app: App } = require("electron");

function fixLocalizationButton(...labelParams) {
  return labelParams?.map((label) => [label, " "].join("")) ?? [];
}

function redirectAsarUnpackedFiles(path) {
  if (App.isPackaged) {
    return path.replace("app.asar", "app.asar.unpacked");
  }

  return path;
}

function formatHexNumber(number) {
  return `0x${number.toString(16).toUpperCase()}`;
}

module.exports = {
  fixLocalizationButton,
  formatHexNumber,
  redirectAsarUnpackedFiles,
};