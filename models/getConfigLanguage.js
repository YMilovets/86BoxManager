import { app as App } from "electron";
import { promises } from "fs";
import { join } from "path";

export default async function getConfigLanguage(lang) {
  const localDictionary = await promises.readFile(
    join(App.getAppPath(), `i18n/${lang}.json`),
    "utf-8"
  );

  return localDictionary;
}
