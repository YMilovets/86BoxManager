import { useContext } from "react";
import Button from "../../Components/Button";
import { MachineContext } from "../../Components/App/context";

import styles from "./MachineItemContainer.module.css";

function MachineItemContainer() {
  const { listMachines, setStartMachine, getExistFolder } =
    useContext(MachineContext);
  const { electronAPI } = window;

  function handleStartMachine(startMachineId, isDisable) {
    return async () => {
      if (isDisable) return;

      const isExistMachine = await getExistFolder();
      if (!isExistMachine) return;

      electronAPI?.invokeMachine(startMachineId);

      setStartMachine(startMachineId);
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