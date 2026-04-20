import { useContext, useRef } from "react";

import { ErrorType } from "../../../shared";
import { DictionaryContext } from "../../Providers/LanguageProvider";
import {
  useMachineActions,
  useMachines,
} from "../../Providers/MachineProvider";
import { getDictionary, useLocalStorage } from "../../Shared";

export default function useRenameMachine() {
  const { prevPathMachines } = useMachines();
  const { getExistFolder, setNewMachineName, setIsEdit } = useMachineActions();
  const { dictionary } = useContext(DictionaryContext);
  const getLocalStorage = useLocalStorage();

  const { electronAPI } = window;
  const getTransition = getDictionary(dictionary);

  const formRef = useRef(null);

  async function handleConfigurationChange() {
    const localStorage = getLocalStorage();

    await changeMachinePathConfiguration({
      title: getTransition("clearFormAfterRemoveMachineTitle"),
      text: getTransition("clearFormAfterRemoveMachineMessage")
        .replace("$prevPathMachines", prevPathMachines)
        .replace("$currentPathMachines", localStorage.pathConfig),
      localStorage,
      prevPathMachines,
    });
  }

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

  return {
    handleConfigurationChange,
    handleRenameMachine,
    formRef,
  };
}
