import { createContext } from "react";

import { LanguageList } from "../../Shared";

export const DictionaryContext = createContext({
  dictionary: null,
  language: LanguageList.RU,
});
