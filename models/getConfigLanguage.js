const { app: App, Notification } = require("electron");
const { promises } = require("fs");
const { join } = require("path");

const { ErrorType } = require("../shared/index.js");
const globalState = require("../shared/state.js");
const { redirectAsarUnpackedFiles } = require("../shared/utils.js");

const getExistFolder = require("./getExistFolder.js");
const getTransition = require("./getTransition.js");

async function getConfigLanguage(e, { lang, isSelected }) {
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

module.exports = getConfigLanguage;