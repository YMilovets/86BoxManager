import { useEffect, useState } from "react";
import PropTypes from "prop-types";

import { LanguageList } from "../../Shared";

import { DictionaryContext } from "./context";

function LanguageProvider({ children }) {
  const [lang, setLang] = useState();
  const [configLang, setConfigLang] = useState();

  const { electronAPI } = window;

  async function initLanguage() {
    const localLanguage = localStorage.getItem("language");

    try {
      await electronAPI?.changeLanguage({
        language: localLanguage,
        isSelected: true,
      });
    } catch {
      localStorage.setItem("language", LanguageList.RU);
    }
    await electronAPI?.setConfigLanguage();
  }

  useEffect(() => {
    initLanguage();

    electronAPI?.onSetLanguage(({ language, dictionary }) => {
      setLang('');
      setTimeout(() => setLang(language), 0);
      setConfigLang(dictionary);
      localStorage.setItem("language", language);
    });
  }, []);

  return (
    <DictionaryContext.Provider
      value={{
        dictionary: configLang,
        language: lang,
      }}
    >
      {children}
    </DictionaryContext.Provider>
  );
}

LanguageProvider.propTypes = {
  children: PropTypes.element,
};

LanguageProvider.defaultProps = {
  children: null,
};

export default LanguageProvider;
