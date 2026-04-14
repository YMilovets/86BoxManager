import { useContext, useEffect, useRef } from "react";
import clsx from "clsx";

import { ErrorType } from "../../../shared";
import {
  DictionaryContext,
  MachineContext,
} from "../../Components/App/context";
import Button from "../../Components/Button";
import { Close } from "../../Components/Icon";
import InputText from "../../Components/InputText";
import { getDictionary, useLocalStorage } from "../../Shared";

import styles from "./MachineItemEditContainer.module.css";

function MachineItemEditContainer() {
  const {
    listMachines,
    prevPathMachines,
    removeMachine,
    getExistFolder,
    setNewMachineName,
    setIsEdit,
  } = useContext(MachineContext);
  const { dictionary } = useContext(DictionaryContext);
  const { electronAPI } = window;
  const getTransition = getDictionary(dictionary);
  const getLocalStorage = useLocalStorage();

  const formRef = useRef(null);

  async function changeMachinePathConfiguration({
    title = "",
    text = "",
    localStorage,
    prevPathMachines,
  }) {
    try {
      await electronAPI?.compareSavedConfiguration(localStorage);
    } catch {
      electronAPI?.getInit(localStorage);
      if (formRef.current) formRef.current.reset();

      if (prevPathMachines) {
        electronAPI?.getNotification({
          title,
          text,
        });
      }

      throw new Error(ErrorType.NoCompareConfiguration);
    }
  }

  function handleRemoveMachine(removeMachineId) {
    return async () => {
      const localStorage = getLocalStorage();
      const isExistMachine = await getExistFolder();
      if (!isExistMachine) {
        setIsEdit(false);
        return;
      }

      try {
        await changeMachinePathConfiguration({
          title: getTransition("clearFormAfterRemoveMachineTitle"),
          text: getTransition("clearFormAfterRemoveMachineMessage")
            .replace("$prevPathMachines", prevPathMachines)
            .replace("$currentPathMachines", localStorage.pathConfig),
          localStorage,
          prevPathMachines,
        });
      } catch {
        electronAPI.getInit(localStorage);
        return;
      }

      try {
        const result = await electronAPI?.removeMachine(removeMachineId);
        const { machineName } = result;
        if (machineName) {
          removeMachine(machineName);
        }
      } catch {
        const isExistMachine = await getExistFolder();
        if (!isExistMachine) {
          setIsEdit(false);
          return;
        }
        electronAPI.getInit(localStorage);
      }
    };
  }

  function handleRenameMachine(machineId, isDisable) {
    return async function (e) {
      if (e.relatedTarget && e.relatedTarget.dataset?.control) return;
      if (isDisable) return;

      const formMachine = e.currentTarget.value;

      const isExistMachine = await getExistFolder();
      const localStorage = getLocalStorage();

      try {
        if (machineId === formMachine || !isExistMachine) {
          throw new Error(ErrorType.NoExistSpecificFolder);
        }

        await changeMachinePathConfiguration({
          title: getTransition("clearFormAfterRenameMachineTitle"),
          text: getTransition("clearFormAfterRenameMachineMessage")
            .replace("$prevPathMachines", prevPathMachines)
            .replace("$currentPathMachines", localStorage.pathConfig),
          localStorage,
          prevPathMachines,
        });

        try {
          const result = await electronAPI?.renameMachine(
            machineId,
            formMachine
          );

          const isExistRenameMachine = await getExistFolder();
          if (!isExistRenameMachine) {
            setIsEdit(false);
          }

          const { machineName, newMachineName } = result;

          if (machineName) {
            setNewMachineName(machineName, newMachineName);
            e.target.value = newMachineName;
          }
        } catch {
          const isExistFolder = await getExistFolder();
          setIsEdit(isExistFolder);
          electronAPI.getInit(localStorage);
        }

        return;
      } catch {
        /* empty */
      }

      if (!isExistMachine) {
        setIsEdit(false);
      }
    };
  }

  function handleChange(machineId) {
    return (e) => {
      const currentTarget = e.currentTarget;

      if (currentTarget.value !== machineId) {
        currentTarget.classList.add(styles.input__changed);
        currentTarget.title = getTransition("fieldIsChanged");
      }
      if (currentTarget.value === machineId) {
        currentTarget.classList.remove(styles.input__changed);
        currentTarget.removeAttribute("title");
      }
    };
  }

  function handleKeyDown(e) {
    const currentTarget = e.currentTarget;
    if (e.key === "Enter") {
      currentTarget.blur();
    }
  }

  useEffect(() => {
    Array.from(formRef.current.elements).forEach((formItem) => {
      const { name, value } = formItem;
      if (value !== name) {
        formItem.title = getTransition("fieldIsChanged");
      }
    });
  }, [dictionary]);

  return (
    <form ref={formRef}>
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
              onChange={handleChange(machineId)}
              onKeyDown={handleKeyDown}
              name={machineId}
            />
            <Button
              className={styles.remove_btn}
              disabled={!electronAPI || isDisable}
              onClick={handleRemoveMachine(machineId)}
              title={`${getTransition("remove")} ${machineId}`}
              type="button"
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
    </form>
  );
}

export default MachineItemEditContainer;
