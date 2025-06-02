import { useEffect, useReducer, useState } from "react";
import { HashRouter, Route, Routes } from "react-router-dom";
import PageMain from "../../Pages/PageMain";
import PageConfig from "../../Pages/PageConfig";
import PageAddMachine from "../../Pages/PageAddMachine";
import { DictionaryContext, MachineContext } from "./context";
import { reducerListMachines } from "./reducers";
import styles from "./App.module.css";

function App() {
  const [configLang, setConfigLang] = useState();
  const [isExistFolder, setIsExistFolder] = useState(false);
  
  const [
    {
      machineList: listMachinesState,
      isEdit,
      isStartedMachines,
    },
    dispatch,
  ] = useReducer(reducerListMachines, {
    machineList: [],
    isEdit: false,
    isStartedMachines: false,
  });

  const [lang, setLang] = useState(localStorage.getItem("language") ?? "ru");

  const { electronAPI } = window;

  useEffect(() => {
    electronAPI.changeLanguage(lang ?? "ru").then((langConfig) => {
      localStorage.setItem("language", lang);
      setConfigLang(langConfig);
    });
  }, [lang]);

  useEffect(() => {
    electronAPI?.onConfigMachines(
      ({ resultList, activeMachines = new Map() }) => {
        const rootDirMachines = localStorage.getItem("rootDirMachines");
        const activeMachinesByFolder =
          activeMachines.get(rootDirMachines) ?? new Set();

        dispatch({
          type: "writeMachines",
          payload: { resultList, activeMachinesByFolder, activeMachines },
        });
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
          changeLanguage: setLang,
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
