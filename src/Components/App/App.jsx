import { HashRouter, Route, Routes } from "react-router-dom";
import PageMain from "../../Pages/PageMain";
import PageAddMachine from "../../Pages/PageAddMachine";
import getTransition from "../../Shared/Utils/getTransition";
import styles from "./App.module.css";
import { useEffect, useState } from "react";
import { DictionaryContext } from "./context";

function App() {
  const [configLang, setConfigLang] = useState();
  const [lang, setLang] = useState();

  const { electronAPI } = window;

  useEffect(() => {
    electronAPI.changeLanguage(lang ?? "ru").then((langConfig) => {
      setConfigLang(langConfig);
    });
  }, [lang]);

  return (
    <DictionaryContext.Provider
      value={{ dictionary: configLang, changeLanguage: setLang }}
    >
      <section className={styles.page}>
        {!electronAPI && (
          <p role="alert">{getTransition("errorElectronAPI")}</p>
        )}
        <HashRouter>
          <Routes>
            <Route path="/" element={<PageMain />} />
            <Route path="/add-machine" element={<PageAddMachine />} />
          </Routes>
        </HashRouter>
      </section>
    </DictionaryContext.Provider>
  );
}

export default App;
