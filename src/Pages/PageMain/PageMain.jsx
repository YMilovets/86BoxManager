import { useContext, useEffect } from "react";

import {
  DictionaryContext,
  MachineContext,
} from "../../Components/App/context";
import ControlContainer from "../../Containers/ControlContainer";
import MachineItemContainer from "../../Containers/MachineItemContainer";
import MachineItemEditContainer from "../../Containers/MachineItemEditContainer";
import useLocalStorage from "../../Shared/Hooks/useLocalStorage";
import getDictionary from "../../Shared/Utils/getTransition";

import styles from "./PageMain.module.css";

function PageMain() {
  const { dictionary } = useContext(DictionaryContext);
  const getTransition = getDictionary(dictionary);

  const {
    isEdit,
    isExistFolder,
    listMachines,
    unlockMachine,
    getExistFolder,
    setIsEdit,
  } = useContext(MachineContext);

  const { electronAPI } = window;

  const getLocalStorage = useLocalStorage();

  useEffect(() => {
    try {
      const localConfig = getLocalStorage();
      electronAPI?.getInit(localConfig);
      getExistFolder();

      electronAPI?.onUnlockedConfiguration(
        async ({
          machineId: closedMachine,
          isExistFolder,
          activeMachines,
          processPathConfiguration,
          prevPathConfiguration,
          message: { text, title },
        }) => {
          const localConfig = getLocalStorage();

          const isCurrentExistFolder = await getExistFolder();

          if (!isCurrentExistFolder) setIsEdit(isCurrentExistFolder);

          const isChangedPrevPathConfig =
            prevPathConfiguration !== localConfig.pathConfig;

          if (isCurrentExistFolder && isChangedPrevPathConfig) {
            electronAPI?.getNotification({
              title,
              text: text
                .replace("$prevPathMachines", prevPathConfiguration)
                .replace("$currentPathMachines", localConfig.pathConfig),
            });
          }

          if (isChangedPrevPathConfig) {
            electronAPI?.getInit(localConfig);
            return;
          }

          unlockMachine({
            isExistFolder,
            closedMachine,
            activeMachines,
            processPathConfiguration,
          });
        }
      );
    } catch { /* empty */ }
  }, []);

  const MainMachineItemContainer = !isEdit
    ? MachineItemContainer
    : MachineItemEditContainer;

  function getPathConfig() {
    return localStorage.getItem("rootDirMachines");
  }

  return (
    <main className={styles.root}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h3 className={styles.label}>
            {getTransition("list")} {isEdit && getTransition("editMode")}
          </h3>
        </header>

        <div className={styles.scroll}>
          {electronAPI && listMachines.length === 0 && isExistFolder && (
            <p role="alert" className={styles.alert}>
              {getTransition("emptyList")}
            </p>
          )}
          {electronAPI && !isExistFolder && (
            <p role="alert" className={styles.alert}>
              {getTransition("noExistFolder")}
            </p>
          )}
          {electronAPI && listMachines.length > 0 && isExistFolder && (
            <MainMachineItemContainer />
          )}
          {!electronAPI && (
            <p className={styles.alert} role="alert">
              {getTransition("errorElectronAPI")}
            </p>
          )}
        </div>

        <ControlContainer />
      </div>
      <footer className={styles.footer}>
        <strong className={styles.legend}>
          {getTransition("selectedFolder")}
        </strong>
        : {getPathConfig()}
      </footer>
    </main>
  );
}

export default PageMain;
