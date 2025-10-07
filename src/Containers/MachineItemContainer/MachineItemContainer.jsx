import { useContext } from "react";

import { DictionaryContext, MachineContext } from "../../Components/App/context";
import Button from "../../Components/Button";
import useLocalStorage from "../../Shared/Hooks/useLocalStorage";
import getDictionary from "../../Shared/Utils/getTransition";

import styles from "./MachineItemContainer.module.css";

function MachineItemContainer() {
  const { listMachines, prevPathMachines, setStartMachine, getExistFolder } =
    useContext(MachineContext);
  const { dictionary } = useContext(DictionaryContext);

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