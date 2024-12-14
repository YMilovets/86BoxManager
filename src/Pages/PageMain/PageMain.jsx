import { useEffect, useState } from "react";
import Button from "../../Components/Button";
import { useNavigate } from "react-router-dom";
import InputText from "../../Components/InputText";
import styles from "./PageMain.module.css";

function PageMain() {
  const [listMachines, setListMachines] = useState(null);
  const [isEdit, setIsEdit] = useState(false);

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
  function handleRenameMachine(machineId) {
    return (e) => {
      if (machineId !== e.currentTarget.value) {
        electronAPI?.renameMachine(machineId, e.currentTarget.value);
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
      <header className={styles.header}>
        <h3 className={styles.label}>
          Список виртуальных машин 86Box {isEdit && "для редактирования"}
        </h3>
      </header>

      <div className={styles.scroll}>
        <ul className={styles.list}>
          {(!listMachines ?? listMachines.length === 0) && (
            <p>В выбранном каталоге отсутствуют дирректории</p>
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
                  <InputText
                    className={styles.input}
                    defaultValue={machineId}
                    onBlur={handleRenameMachine(machineId)}
                  />
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
          Создать
        </Button>
        <Button onClick={() => electronAPI?.getInit()}>Обновить</Button>
        <Button
          onClick={() => {
            setIsEdit(!isEdit);
          }}
        >
          {!isEdit ? "Редактировать" : "Отменить"}
        </Button>
      </div>
    </div>
  );
}

export default PageMain;
