import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../Components/Button";
import { DictionaryContext, MachineContext } from "../../Components/App/context";

import getDictionary from "../../Shared/Utils/getTransition";
import useLocalStorage from "../../Shared/Hooks/useLocalStorage";

import styles from "./ControlContainer.module.css";

function ControlContainer() {
  const { dictionary, language, changeLanguage } =
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

  return (
    <div className={styles.control}>
      <Button
        disabled={!electronAPI || !isExistFolder}
        onClick={handleCreateClick}
        data-control
      >
        {getTransition("create")}
      </Button>
      <Button onClick={handleUpdateClick} data-control>
        {getTransition("update")}
      </Button>
      <Button
        onClick={handleChangeMode}
        disabled={listMachines.length === 0 || !isExistFolder}
        data-control
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
      >
        {getTransition("preference")}
      </Button>
      <div className={styles.language}>
        <Button
          className={styles.language_btn}
          onClick={() => changeLanguage("ru")}
          isPrimary={language === "ru"}
          disabled={!electronAPI}
          data-control
        >
          RU
        </Button>
        <Button
          className={styles.language_btn}
          onClick={() => changeLanguage("en")}
          isPrimary={language === "en"}
          disabled={!electronAPI}
          data-control
        >
          EN
        </Button>
      </div>
    </div>
  );
}

export default ControlContainer;