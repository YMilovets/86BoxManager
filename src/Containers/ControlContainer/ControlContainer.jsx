import { useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";

import Button from "../../Components/Button";
import {
  DictionaryContext,
  MachineContext,
} from "../../Components/App/context";

import getDictionary from "../../Shared/Utils/getTransition";
import useLocalStorage from "../../Shared/Hooks/useLocalStorage";

import LanguageContainer from "../LanguageContainer";

import styles from "./ControlContainer.module.css";

function ControlContainer() {
  const { dictionary, language } =
    useContext(DictionaryContext);
  const {
    isExistFolder,
    listMachines,
    prevPathMachines,
    isStartedMachines,
    getExistFolder,
    isEdit,
    setIsEdit,
  } = useContext(MachineContext);

  const getTransition = getDictionary(dictionary);

  const { electronAPI } = window;

  const navigate = useNavigate();
  const getLocalStorage = useLocalStorage();
  const selectRef = useRef(null);

  async function handleCreateClick() {
    try {
      setIsEdit(false);
      getLocalStorage();
      const isExistMachine = await getExistFolder();
      if (!isExistMachine) return;
      navigate("/add-machine");
    } catch { /* empty */ }
  }

  async function handleUpdateClick() {
    try {
      const localStorage = getLocalStorage();

      const languageList = await electronAPI.getLanguageList();
      const { language: selectedLanguageName } = {
        ...languageList.find(({ languageId }) => languageId === language),
      };
      selectRef.current.querySelector("selectedcontent").textContent =
        selectedLanguageName;

      try {
        await electronAPI?.compareSavedConfiguration(localStorage);
      } catch {
        const isExistMachine = await getExistFolder();
        if (isEdit && isExistMachine && prevPathMachines) {
          electronAPI?.getNotification({
            title: getTransition("clearFormAfterUpdateTitle"),
            text: getTransition("clearFormAfterUpdateMessage")
              .replace("$prevPathMachines", prevPathMachines)
              .replace("$currentPathMachines", localStorage.pathConfig),
          });
        }
        Array.prototype.forEach.call(document.forms, (form) => form.reset());
      }

      electronAPI?.getInit(localStorage);
      const isExistMachine = await getExistFolder();
      if (!isExistMachine) setIsEdit(false);
    } catch {
      /* empty */
    }
  }

  async function handleChangeMode() {
    try {
      const localStorage = getLocalStorage();
      electronAPI?.getInit(localStorage);
      const isExistMachine = await getExistFolder();
      setIsEdit(!isEdit && isExistMachine);
      if (isEdit) electronAPI?.getInit(localStorage);
    } catch { /* empty */ }
  }

  async function handleOpenFolder() {
    const localStorage = getLocalStorage();
    electronAPI?.getInit(localStorage);

    const isExistMachine = await getExistFolder();
    setIsEdit(isEdit && isExistMachine);

    if (!isExistFolder) return;
    electronAPI?.openSpecificFolder();
  }

  return (
    <div className={styles.control}>
      <Button
        disabled={!electronAPI || !isExistFolder}
        onClick={handleCreateClick}
        data-control
        className={styles.control_btn}
        title={getTransition("create")}
      >
        {getTransition("create")}
      </Button>
      <Button
        onClick={handleUpdateClick}
        data-control
        className={styles.control_btn}
        title={getTransition("update")}
      >
        {getTransition("update")}
      </Button>
      <Button
        onClick={handleChangeMode}
        disabled={listMachines.length === 0 || !isExistFolder}
        data-control
        className={styles.control_btn}
        title={!isEdit ? getTransition("edit") : getTransition("cancel")}
      >
        {!isEdit ? getTransition("edit") : getTransition("cancel")}
      </Button>
      <Button
        onClick={() => {
          navigate("/settings");
        }}
        disabled={
          isStartedMachines && isExistFolder && listMachines.length !== 0
        }
        data-control
        className={styles.control_btn}
        title={getTransition("preference")}
      >
        {getTransition("preference")}
      </Button>
      <Button
        disabled={!isExistFolder}
        onClick={handleOpenFolder}
        data-control
        className={styles.control_btn}
        title={getTransition("open")}
      >
        {getTransition("open")}
      </Button>
      <Button
        onClick={() => electronAPI?.getVersion()}
        data-control
        className={styles.control_btn}
        title={getTransition("aboutBtn")}
      >
        {getTransition("aboutBtn")}
      </Button>
      <LanguageContainer className={styles.language_select} ref={selectRef} />
    </div>
  );
}

export default ControlContainer;