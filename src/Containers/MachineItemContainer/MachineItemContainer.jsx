import Button from "../../Components/Button";
import { useDictionary } from "../../Providers/LanguageProvider";
import {
  useMachineActions,
  useMachines,
} from "../../Providers/MachineProvider";
import { getDictionary, useLocalStorage } from "../../Shared";

import styles from "./MachineItemContainer.module.css";

function MachineItemContainer() {
  const { listMachines, prevPathMachines } = useMachines();
  const { setStartMachine, getExistFolder } = useMachineActions();
  const { dictionary } = useDictionary();

  const getLocalStorage = useLocalStorage();
  const getTransition = getDictionary(dictionary);

  const { electronAPI } = window;

  function handleStartMachine(startMachineId, isDisable) {
    return async () => {
      if (isDisable) return;

      const localStorage = getLocalStorage();
      const isExistMachine = await getExistFolder();
      if (!isExistMachine) return;

      try {
        await electronAPI?.compareSavedConfiguration(localStorage);
      } catch {
        const localStorage = getLocalStorage();
        electronAPI?.getInit(localStorage);
        if (!prevPathMachines) return;
        electronAPI?.getNotification({
          title: getTransition("preventLaunchMachineTitle"),
          text: getTransition("preventLaunchMachineMessage")
            .replace("$prevPathMachines", prevPathMachines)
            .replace("$currentPathMachines", localStorage.pathConfig),
        });

        return;
      }

      try {
        const localStorage = getLocalStorage();
        const isExistMachine = await getExistFolder();
        electronAPI?.getInit(localStorage);

        electronAPI?.invokeMachine(startMachineId);
        if (!isExistMachine) return;

        setStartMachine(startMachineId);
      } catch {
        /* empty */
      }
    };
  }

  return (
    <ul className={styles.list}>
      {listMachines?.map(({ machineId, isDisable }) => (
        <li className={styles.item} key={machineId}>
          <Button
            onClick={handleStartMachine(machineId, isDisable)}
            disabled={isDisable}
            className={styles.button}
          >
            {machineId}
          </Button>
        </li>
      ))}
    </ul>
  );
}

export default MachineItemContainer;
