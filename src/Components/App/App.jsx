import { HashRouter, Route, Routes } from "react-router-dom";
import PageMain from "../../Pages/PageMain";
import PageAddMachine from "../../Pages/PageAddMachine";
import getDictionary from "../../Shared/Utils/getTransition";
import { useContext, useEffect, useReducer, useState } from "react";
import { DictionaryContext, MachineContext } from "./context";
import { reducerListMachines } from "./reducers";
import styles from "./App.module.css";

function App() {
  const [configLang, setConfigLang] = useState();
  const [listMachinesState, dispatch] = useReducer(reducerListMachines, []);

  const { dictionary } = useContext(DictionaryContext);
  const getTransition = getDictionary(dictionary);

  const [lang, setLang] = useState();

  const { electronAPI } = window;

  useEffect(() => {
    electronAPI.changeLanguage(lang ?? "ru").then((langConfig) => {
      setConfigLang(langConfig);
    });
  }, [lang]);

  useEffect(() => {
    electronAPI?.onConfigMachines((resultList) => {
      dispatch({ type: "writeMachines", payload: resultList });
    });

    electronAPI?.onUnlockedConfiguration((unlockedMachineId) =>
      dispatch({ type: "unlockMachine", payload: unlockedMachineId })
    );
  }, []);

  return (
    <MachineContext.Provider
      value={{
        listMachines: listMachinesState,
        setStartMachine: (startMachineId) =>
          dispatch({ type: "startMachine", payload: startMachineId }),
        removeMachine: (removeMachineId) =>
          dispatch({ type: "removeMachine", payload: removeMachineId }),
        setNewMachineName: (machineName, newMachineName) =>
          dispatch({
            type: "renameMachine",
            payload: { machineName, newMachineName },
          }),
      }}
    >
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
    </MachineContext.Provider>
  );
}

export default App;
