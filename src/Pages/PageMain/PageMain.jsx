import { useContext, useEffect, useState } from "react";
import Button from "../../Components/Button";
import { useNavigate } from "react-router-dom";
import { Close } from "../../Components/Icon";
import InputText from "../../Components/InputText";
import getTransition from "../../Shared/Utils/getTransition";
import { DictionaryContext } from "../../Components/App/context";
import Portal from "../../Components/Portal";
import clsx from "clsx";
import styles from "./PageMain.module.css";

function PageMain() {
  const [listMachines, setListMachines] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [isConfirm, setIsConfirm] = useState(false);

  const { changeLanguage } = useContext(DictionaryContext);

  const { electronAPI } = window;

  function handleUnlock(unlockedMachineId) {
    setListMachines((listMachineStorage) =>
      listMachineStorage.map(({ machineId: id, isDisable }) => {
        if (id === unlockedMachineId)
          return { machineId: id, isDisable: false };
        return { machineId: id, isDisable };
      })
    );
  }

  function handleStartMachine(startMachineId, isDisable) {
    return () => {
      if (isDisable) return;
      electronAPI?.invokeMachine(startMachineId);

      setListMachines((listMachineStorage) =>
        listMachineStorage.map(({ machineId: id, isDisable }) => {
          if (id === startMachineId) return { machineId: id, isDisable: true };
          return { machineId: id, isDisable };
        })
      );
    };
  }

  function handleRemoveMachine(removeMachineId) {
    return async () => {
      const result = await electronAPI?.removeMachine(removeMachineId);
      const { machineName } = result;
      if (machineName) {
        setListMachines((listMachineStorage) =>
          listMachineStorage.filter(({ machineId: id }) => id !== machineName)
        );
      }
    };
  }

  function handleRenameMachine(machineId, isDisable) {
    return async (e) => {
      if (isDisable) return;
      if (machineId !== e.currentTarget.value) {
        setIsConfirm(true);
        const result = await electronAPI?.renameMachine(
          machineId,
          e.currentTarget.value
        );
        const { machineName, newMachineName } = result;
        if (machineName) {
          setListMachines((listMachineStorage) =>
            listMachineStorage.map(({ machineId: id, isDisable }) => {
              if (id === machineName)
                return { machineId: newMachineName, isDisable };
              return { machineId: id, isDisable };
            })
          );
        }
        setIsConfirm(false);
      }
    };
  }

  useEffect(() => {
    electronAPI?.getInit();

    electronAPI?.onConfigMachines((resultList) => {
      setListMachines(
        resultList.map((machineId) => ({
          machineId,
          isDisable: false,
        }))
      );
    });

    electronAPI?.onUnlockedConfiguration(handleUnlock);
  }, []);

  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      {isConfirm && (
        <Portal>
          <div className={styles.portal} />
        </Portal>
      )}
      <header className={styles.header}>
        <h3 className={styles.label}>
          {getTransition("list")} {isEdit && getTransition("editMode")}
        </h3>
      </header>

      <div className={styles.scroll}>
        <ul className={styles.list}>
          {(!listMachines ?? listMachines.length === 0) && (
            <p>{getTransition("emptyList")}</p>
          )}
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
          disabled={!electronAPI}
          onClick={() => navigate("/add-machine")}
        >
          {getTransition("create")}
        </Button>
        <Button onClick={() => electronAPI?.getInit()}>
          {getTransition("update")}
        </Button>
        <Button
          onClick={() => {
            setIsEdit(!isEdit);
          }}
        >
          {!isEdit ? getTransition("edit") : getTransition("cancel")}
        </Button>
        <div className={styles.language}>
          <Button
            className={styles.language_btn}
            onClick={() => changeLanguage("ru")}
          >
            RU
          </Button>
          <Button
            className={styles.language_btn}
            onClick={() => changeLanguage("en")}
          >
            EN
          </Button>
        </div>
      </div>
    </div>
  );
}

export default PageMain;
