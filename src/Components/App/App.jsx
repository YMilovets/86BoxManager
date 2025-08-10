import { useEffect, useReducer, useState } from "react";
import { HashRouter, Route, Routes } from "react-router-dom";

import PageMain from "../../Pages/PageMain";
import PageConfig from "../../Pages/PageConfig";
import PageAddMachine from "../../Pages/PageAddMachine";

import { DictionaryContext, MachineContext } from "./context";
import { reducerListMachines } from "./reducers";
import { LanguageList } from "../../Shared/Constants";

import styles from "./App.module.css";

function App() {
  const [lang, setLang] = useState();
  const [configLang, setConfigLang] = useState();
  const [isExistFolder, setIsExistFolder] = useState(false);
  
  const [
    {
      machineList: listMachinesState,
      isEdit,
      prevPathMachines,
      isStartedMachines,
    },
    dispatch,
  ] = useReducer(reducerListMachines, {
    machineList: [],
    isEdit: false,
    isStartedMachines: false,
  });

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

    electronAPI?.onConfigMachines(
      ({ resultList, activeMachines = new Map() }) => {
        const rootDirMachines = localStorage.getItem("rootDirMachines");
        const activeMachinesByFolder =
          activeMachines.get(rootDirMachines) ?? new Set();

        dispatch({
          type: "writeMachines",
          payload: { resultList, activeMachinesByFolder, activeMachines },
        });
        dispatch({ type: "setPathMachines", payload: rootDirMachines });
      }
    );
  }, []);


  async function getExistFolder() {
    const isExistPath = await electronAPI?.existFolder(
      localStorage.getItem("rootDirMachines")
    );
    setIsExistFolder(isExistPath);
    return isExistPath;
  }

  return (
    <MachineContext.Provider
      value={{
        isEdit,
        isExistFolder,
        prevPathMachines,
        listMachines: listMachinesState,
        isStartedMachines,
        setStartMachine: (startMachineId) =>
          dispatch({ type: "startMachine", payload: startMachineId }),
        removeMachine: (removeMachineId) =>
          dispatch({ type: "removeMachine", payload: removeMachineId }),
        setNewMachineName: (machineName, newMachineName) =>
          dispatch({
            type: "renameMachine",
            payload: { machineName, newMachineName },
          }),
        unlockMachine: ({
          isExistFolder,
          closedMachine,
          activeMachines,
          processPathConfiguration,
        }) =>
          dispatch({
            type: "unlockMachine",
            payload: {
              isExistFolder,
              closedMachine,
              activeMachines,
              processPathConfiguration,
            },
          }),
        getExistFolder,
        setIsEdit: (isEditPayload) =>
          dispatch({ type: "changeStatus", payload: isEditPayload }),
      }}
    >
      <DictionaryContext.Provider
        value={{
          dictionary: configLang,
          language: lang,
        }}
      >
        <section className={styles.page}>
          <HashRouter>
            <Routes>
              <Route path="/" element={<PageMain />} />
              <Route path="/add-machine" element={<PageAddMachine />} />
              <Route path="/settings" element={<PageConfig />} />
            </Routes>
          </HashRouter>
        </section>
      </DictionaryContext.Provider>
    </MachineContext.Provider>
  );
}

export default App;
