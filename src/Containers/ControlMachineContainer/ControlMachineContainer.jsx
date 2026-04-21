import { useDictionary } from "../../Providers/LanguageProvider";
import { useMachines } from "../../Providers/MachineProvider";
import { getDictionary } from "../../Shared";
import MachineItemContainer from "../MachineItemContainer";
import MachineItemEditContainer from "../MachineItemEditContainer";

import styles from "./ControlMachineContainer.module.css";

function ControlMachineContainer() {
  const { isEdit, isExistFolder, listMachines } = useMachines();
  const { dictionary } = useDictionary();

  const getTransition = getDictionary(dictionary);

  const { electronAPI } = window;

  const isDisplay = electronAPI && listMachines.length > 0 && isExistFolder;

  const MainMachineItemContainer = !isEdit
    ? MachineItemContainer
    : MachineItemEditContainer;

  return (
    <>
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
      {isDisplay && <MainMachineItemContainer />}
    </>
  );
}

export default ControlMachineContainer;
