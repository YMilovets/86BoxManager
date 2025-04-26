import { useContext } from "react";
import Button from "../../Components/Button";
import { DictionaryContext, MachineContext } from "../../Components/App/context";

import { Close } from "../../Components/Icon";
import InputText from "../../Components/InputText";
import getDictionary from "../../Shared/Utils/getTransition";
import clsx from "clsx";

import styles from "./MachineItemEditContainer.module.css";

function MachineItemEditContainer() {
  const {
    listMachines,
    removeMachine,
    getExistFolder,
    setNewMachineName,
    setIsEdit,
  } = useContext(MachineContext);
  const { dictionary } = useContext(DictionaryContext);
  const { electronAPI } = window;
  const getTransition = getDictionary(dictionary);

  function handleRemoveMachine(removeMachineId) {
    return async () => {
      const isExistMachine = await getExistFolder();
      if (!isExistMachine) {
        setIsEdit(false);
        return;
      }

      try {
        const result = await electronAPI?.removeMachine(removeMachineId);
        const { machineName } = result;
        if (machineName) {
          removeMachine(machineName);
        }
      } catch {
        /* empty */
      }
    };
  }

  function handleRenameMachine(machineId, isDisable) {
    return async function (e) {
      if (e.relatedTarget && e.relatedTarget.dataset?.control) return;
      if (isDisable) return;

      const formMachine = e.currentTarget.value;

      const isExistMachine = await getExistFolder();
      if (machineId !== formMachine && isExistMachine) {
        try {
          const result = await electronAPI?.renameMachine(
            machineId,
            formMachine
          );

          const { machineName, newMachineName } = result;
          if (machineName) {
            setNewMachineName(machineName, newMachineName);
            e.target.value = newMachineName;
          }

          return;
        } catch {
          /* empty */
        }
      }
      if (!isExistMachine) {
        setIsEdit(false);
      }
    };
  }

  return (
    <ul className={styles.list}>
      {listMachines?.map(({ machineId, isDisable }) => (
        <li className={styles.item} key={machineId}>
          <InputText
            className={clsx(styles.input, {
              [styles.input__disabled]: isDisable,
            })}
            defaultValue={machineId}
            onBlur={handleRenameMachine(machineId, isDisable)}
            disabled={isDisable}
          />
          <Button
            className={styles.remove_btn}
            disabled={!electronAPI || isDisable}
            onClick={handleRemoveMachine(machineId)}
            title={`${getTransition("remove")} ${machineId}`}
          >
            <Close
              className={clsx(styles.remove_icon, {
                [styles.remove_icon__disabled]: isDisable,
              })}
            />
          </Button>
        </li>
      ))}
    </ul>
  );
}

export default MachineItemEditContainer;