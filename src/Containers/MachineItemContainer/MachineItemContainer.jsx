import { useContext } from "react";
import Button from "../../Components/Button";
import { MachineContext } from "../../Components/App/context";
import useLocalStorage from "../../Shared/Hooks/useLocalStorage";

import styles from "./MachineItemContainer.module.css";

function MachineItemContainer() {
  const { listMachines, setStartMachine, getExistFolder } =
    useContext(MachineContext);
  const getLocalStorage = useLocalStorage();
  const { electronAPI } = window;

  function handleStartMachine(startMachineId, isDisable) {
    return async () => {
      if (isDisable) return;

      try {
        const localStorage = getLocalStorage();
        const isExistMachine = await getExistFolder();
        electronAPI?.getInit(localStorage);
        
        electronAPI?.invokeMachine(startMachineId);
        if (!isExistMachine) return;
  
        setStartMachine(startMachineId);
      } catch { /* empty */ }
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