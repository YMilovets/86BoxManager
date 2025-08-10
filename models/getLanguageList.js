import { app as App } from "electron";
import { promises } from "fs";
import { join } from "path";

import { LanguageList } from "../src/Shared/Constants/index.js";
import { globalState } from "../shared/state.js";

const defaultLanguageNameList = {
  [LanguageList.RU]: "Русский",
  [LanguageList.EN]: "English",
};

export async function getLanguageFiles(dictionaryList = []) {
  const languageList = [{ language: "", languageId: "" }];

  for (const file of dictionaryList) {
    const dictionary = await promises.readFile(
      join(App.getAppPath(), "i18n", file)
    );
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

export default async function getLanguageList() {
  const dictionaryList = await promises.readdir(join(App.getAppPath(), "i18n"));

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
