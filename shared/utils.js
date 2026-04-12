import { app as App } from "electron";

export function fixLocalizationButton(...labelParams) {
  return labelParams?.map((label) => [label, " "].join("")) ?? [];
}

export function redirectAsarUnpackedFiles(path) {
  if (App.isPackaged) {
    return path.replace("app.asar", "app.asar.unpacked");
  }

  return path;
}

export function formatHexNumber(number) {
  return `0x${number.toString(16).toUpperCase()}`;
}