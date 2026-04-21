import { useEffect } from "react";
import clsx from "clsx";

import InputText from "../../Components/InputText";
import { useDictionary } from "../../Providers/LanguageProvider";
import { useMachines } from "../../Providers/MachineProvider";
import { getDictionary } from "../../Shared";
import RemoveBtnContainer from "../RemoveBtnContainer";

import useRenameMachine from "./useRenameMachine";

import styles from "./MachineItemEditContainer.module.css";

function MachineItemEditContainer() {
  const { listMachines } = useMachines();
  const { dictionary } = useDictionary();
  const { handleConfigurationChange, handleRenameMachine, formRef } =
    useRenameMachine();

  const getTransition = getDictionary(dictionary);

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
            <RemoveBtnContainer
              machineId={machineId}
              isDisable={isDisable}
              onChange={handleConfigurationChange}
            />
          </li>
        ))}
      </ul>
    </form>
  );
}

export default MachineItemEditContainer;
