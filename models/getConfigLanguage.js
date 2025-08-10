import { app as App, Notification } from "electron";
import { promises } from "fs";
import { join } from "path";

import { ErrorType } from "../shared/index.js";
import { globalState } from "../shared/state.js";
import { redirectAsarUnpackedFiles } from "../shared/utils.js";
import getTransition from "./getTransition.js";
import getExistFolder from "./getExistFolder.js";

export default async function getConfigLanguage(e, { lang, isSelected }) {
  const languagePath = redirectAsarUnpackedFiles(
    join(App.getAppPath(), "i18n", `${lang}.json`)
  );

  const isExistLanguage = await getExistFolder(e, languagePath);

  if (!isExistLanguage && lang && lang !== globalState.language) {
    const getDictionary = getTransition(globalState.dictionary);
    new Notification({
      title: getDictionary("changeLanguageErrorTitle"),
      body: getDictionary("changeLanguageErrorMessage", (result) =>
        result.replace("$language", lang)
      ),
    }).show();
    throw new Error(ErrorType.IncorrectDictionary);
  }

  if (!isExistLanguage && lang === globalState.language) {
    return globalState.dictionary;
  }

  const localDictionary = await promises.readFile(
    join(languagePath),
    "utf-8"
  );

  try {
    const { language: languageName } = JSON.parse(localDictionary);
    globalState.languageName = languageName;
  } catch {
    const getDictionary = getTransition(globalState.dictionary);
    if (isSelected && globalState.language !== lang) {
      new Notification({
        title: getDictionary("changeLanguageCorruptFileTitle"),
        body: getDictionary("changeLanguageCorruptFileMessage", (result) =>
          result.replace("$language", lang)
        ),
      }).show();
    }
    throw new Error(ErrorType.IncorrectDictionary);
  }

  globalState.language = lang;

  return localDictionary;
}
