import { shell } from "electron";

export default function openURL(_, url) {
  shell.openExternal(url);
}
