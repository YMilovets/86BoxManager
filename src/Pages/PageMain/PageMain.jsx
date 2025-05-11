import { useContext, useEffect } from "react";
import getDictionary from "../../Shared/Utils/getTransition";
import useLocalStorage from "../../Shared/Hooks/useLocalStorage";
import {
  DictionaryContext,
  MachineContext,
} from "../../Components/App/context";
import MachineItemContainer from "../../Containers/MachineItemContainer";
import MachineItemEditContainer from "../../Containers/MachineItemEditContainer";
import ControlContainer from "../../Containers/ControlContainer";

import styles from "./PageMain.module.css";

function PageMain() {
  const { dictionary } = useContext(DictionaryContext);
  const getTransition = getDictionary(dictionary);

  const { isEdit, isExistFolder, listMachines, getExistFolder } =
    useContext(MachineContext);

  const { electronAPI } = window;

  const getLocalStorage = useLocalStorage();

  useEffect(() => {
    try {
      const localStorage = getLocalStorage();
      electronAPI?.getInit(localStorage);
      getExistFolder();
    } catch { /* empty */ }
  }, []);

  const MainMachineItemContainer = !isEdit
    ? MachineItemContainer
    : MachineItemEditContainer;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h3 className={styles.label}>
          {getTransition("list")} {isEdit && getTransition("editMode")}
        </h3>
      </header>

      <div className={styles.scroll}>
        {listMachines.length === 0 && isExistFolder && (
          <p role="alert" className={styles.alert}>
            {getTransition("emptyList")}
          </p>
        )}
        {!isExistFolder && (
          <p role="alert" className={styles.alert}>
            {getTransition("noExistFolder")}
          </p>
        )}
        {listMachines.length > 0 && isExistFolder && (
          <MainMachineItemContainer />
        )}
      </div>

      <ControlContainer />
    </div>
  );
}

export default PageMain;
