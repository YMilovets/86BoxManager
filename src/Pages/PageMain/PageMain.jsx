import { useContext, useEffect, useState } from "react";
import Button from "../../Components/Button";
import { useNavigate } from "react-router-dom";
import { Close } from "../../Components/Icon";
import InputText from "../../Components/InputText";
import getDictionary from "../../Shared/Utils/getTransition";
import {
  DictionaryContext,
  MachineContext,
} from "../../Components/App/context";
import clsx from "clsx";
import styles from "./PageMain.module.css";

function PageMain() {
  const [isEdit, setIsEdit] = useState(false);
  const [isExistFolder, setIsExistFolder] = useState(false);

  const { dictionary, language, changeLanguage } =
    useContext(DictionaryContext);
  const getTransition = getDictionary(dictionary);

  const { listMachines, setStartMachine, removeMachine, setNewMachineName } =
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
      } catch { /* empty */ }
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
            formMachine,
          );
  
          const { machineName, newMachineName } = result;
          if (machineName) {
            setNewMachineName(machineName, newMachineName);
            e.target.value = newMachineName;
          }
  
          return;
        } catch { /* empty */ }
      }
      if (!isExistFolder) {
        setIsEdit(false);
      }
    };
  }

  async function getExistFolder() {
    const isExistPath = await electronAPI?.existFolder(
      localStorage.getItem("rootDirMachines")
    );
    setIsExistFolder(isExistPath);
    return isExistPath;
  }

  async function handleCreateClick() {
    const isExistMachine = await getExistFolder();
    if (!isExistMachine) return;
    navigate("/add-machine");
  }

  function handleUpdateClick() {  
    const localConfig = {
      pathConfig: localStorage.getItem("rootDirMachines"),
      pathApp: localStorage.getItem("appPath"),
    };
    electronAPI?.getInit(localConfig);
    getExistFolder();
  }

  function handleChangeMode() {
    setIsEdit(!isEdit);
    const localConfig = {
      pathConfig: localStorage.getItem("rootDirMachines"),
      pathApp: localStorage.getItem("appPath"),
    };
    electronAPI?.getInit(localConfig);
    getExistFolder();
  }

  useEffect(() => {
    const localConfig = {
      pathConfig: localStorage.getItem("rootDirMachines"),
      pathApp: localStorage.getItem("appPath"),
    }
    if (Object.values(localConfig).some((valueConfig) => !valueConfig)) {
      navigate("/settings");
    }
    electronAPI?.getInit(localConfig);
    getExistFolder();
  }, []);

  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h3 className={styles.label}>
          {getTransition("list")} {isEdit && getTransition("editMode")}
        </h3>
      </header>

      <div className={styles.scroll}>
        {listMachines.length === 0 && isExistFolder && (
          <p role="alert" className={styles.alert}>
            {getTransition("emptyList")}
          </p>
        )}
        {!isExistFolder && (
          <p role="alert" className={styles.alert}>
            {getTransition("noExistFolder")}
          </p>
        )}
        <ul className={styles.list}>
          {listMachines?.map(({ machineId, isDisable }) => (
            <li className={styles.item} key={machineId}>
              {!isEdit ? (
                <Button
                  onClick={handleStartMachine(machineId, isDisable)}
                  disabled={isDisable}
                  className={styles.button}
                >
                  {machineId}
                </Button>
              ) : (
                <>
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
                </>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.control}>
        <Button
          disabled={!electronAPI || !isExistFolder}
          onClick={handleCreateClick}
          data-control
        >
          {getTransition("create")}
        </Button>
        <Button
          onClick={handleUpdateClick}
          data-control
        >
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
            if (!listMachines.some(({ isDisable }) => isDisable)) {
              navigate("/settings");
            }
          }}
          disabled={listMachines.some(({ isDisable }) => isDisable)}
          data-control
        >
          {getTransition("preference")}
        </Button>
        <div className={styles.language}>
          <Button
            className={styles.language_btn}
            onClick={() => changeLanguage("ru")}
            isPrimary={language === "ru"}
            data-control
          >
            RU
          </Button>
          <Button
            className={styles.language_btn}
            onClick={() => changeLanguage("en")}
            isPrimary={language === "en"}
            data-control
          >
            EN
          </Button>
        </div>
      </div>
    </div>
  );
}

export default PageMain;
