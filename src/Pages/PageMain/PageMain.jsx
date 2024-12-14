import { useEffect, useState } from "react";
import Button from "../../Components/Button";
import styles from "./PageMain.module.css";
import { useNavigate } from "react-router-dom";

function PageMain() {
  const [listMachines, setListMachines] = useState(null);

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
      window.electronAPI?.invokeMachine(startMachineId);

      setListMachines((listMachineStorage) =>
        listMachineStorage.map(({ machineId: id, isDisable }) => {
          if (id === startMachineId) return { machineId: id, isDisable: true };
          return { machineId: id, isDisable };
        })
      );
    };
  }

  useEffect(() => {
    window.electronAPI?.getInit();

    window.electronAPI?.onConfigMachines((resultList) => {
      setListMachines(
        resultList.map((machineId) => ({
          machineId,
          isDisable: false,
        }))
      );
    });

    window.electronAPI?.onUnlockedConfiguration(handleUnlock);
  }, []);

  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h3 className={styles.label}>Список виртуальных машин 86Box</h3>
      </header>

      <div className={styles.scroll}>
        <ul className={styles.list}>
          {(!listMachines ?? listMachines.length === 0) && (
            <p>В выбранном каталоге отсутствуют дирректории</p>
          )}
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
      </div>

      <div className={styles.control}>
        <Button
          disabled={!window.electronAPI}
          onClick={() => navigate("/add-machine")}
        >
          Создать
        </Button>
        <Button onClick={() => window.electronAPI?.getInit()}>Обновить</Button>
        <Button disabled>Редактировать</Button>
      </div>
    </div>
  );
}

export default PageMain;
