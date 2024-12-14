import { createContext } from "react";

export const DictionaryContext = createContext({
    dictionary: null,
    changeLanguage: () => {},
})