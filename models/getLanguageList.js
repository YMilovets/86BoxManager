const { app: App } = require("electron");
const { promises } = require("fs");
const { join } = require("path");

const globalState = require("../shared/state.js");
const { redirectAsarUnpackedFiles } = require("../shared/utils.js");

const LanguageList = {
  RU: "ru",
  EN: "en",
};

const defaultLanguageNameList = {
  [LanguageList.RU]: "Русский",
  [LanguageList.EN]: "English",
};

async function getLanguageFiles(dictionaryList = []) {
  const languageList = [{ language: "", languageId: "" }];

  for (const file of dictionaryList) {
    const filepath = redirectAsarUnpackedFiles(
      join(App.getAppPath(), "i18n", file)
    );

    const dictionary = await promises.readFile(filepath);
    const languageId = file.replace(".json", "");
    let language = languageId;

    try {
      language = JSON.parse(dictionary).language;

      if (languageId === globalState.language) {
        globalState.languageName = language;
      }
    } catch { continue }

    languageList.push({
      language: language || defaultLanguageNameList[languageId] || languageId,
      languageId,
    });
  }
  
  return languageList;
}

async function getLanguageList() {
  const directoryPath = redirectAsarUnpackedFiles(join(App.getAppPath(), "i18n"));

  const dictionaryList = await promises.readdir(directoryPath);

  const languageList = await getLanguageFiles(dictionaryList);
  
  const isNotExistLanguage = !languageList.some(
    ({ languageId }) => languageId === globalState.language
  );
  
  if (globalState.language && isNotExistLanguage) {
    languageList.push({
      language:
        globalState.languageName ||
        defaultLanguageNameList[globalState.language] ||
        globalState.language,
      languageId: globalState.language,
    });
  }

  if (languageList.length === 0) {
    languageList.push({
      language: defaultLanguageNameList[LanguageList.RU],
      languageId: LanguageList.RU,
    });
  }

  return languageList.sort(
    (
      { language: prevLanguage, languageId: prevLanguageId },
      { language: nextLanguage, languageId: nextLanguageId }
    ) => {
      if (prevLanguage < nextLanguage) return -1;
      if (prevLanguage > nextLanguage) return 1;

      if (prevLanguageId < nextLanguageId) return -1;
      if (prevLanguageId > nextLanguageId) return 1;
      return 0;
    }
  );
}

module.exports = getLanguageList;