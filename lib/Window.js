import { BrowserWindow } from "electron";

const defaultSettings = {
  width: 500,
  height: 500,
  show: true,
  webPreferences: {
    nodeIntegration: true,
    contextIsolation: true,
  },
};

export class Window extends BrowserWindow {
  constructor({ file, ...settings }) {
    super({ ...defaultSettings, ...settings });
    this.loadURL(file);
  }
}
