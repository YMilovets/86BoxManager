import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../Components/Button";
import { DictionaryContext, MachineContext } from "../../Components/App/context";

import getDictionary from "../../Shared/Utils/getTransition";

import styles from "./ControlContainer.module.css";

function ControlContainer() {
  const { dictionary, language, changeLanguage } =
    useContext(DictionaryContext);
  const { isExistFolder, listMachines, getExistFolder, isEdit, setIsEdit } =
    useContext(MachineContext);

  const getTransition = getDictionary(dictionary);

  const { electronAPI } = window;

  const navigate = useNavigate();

  function getLocalStorage() {
    const localConfig = {
      pathConfig: localStorage.getItem("rootDirMachines"),
      pathApp: localStorage.getItem("appPath"),
    };
    return localConfig;
  }

  async function handleCreateClick() {
    const isExistMachine = await getExistFolder();
    if (!isExistMachine) return;
    navigate("/add-machine");
  }

  function handleUpdateClick() {
    electronAPI?.getInit(getLocalStorage());
    getExistFolder();
  }

  function handleChangeMode() {
    setIsEdit(!isEdit);
    electronAPI?.getInit(getLocalStorage());
    getExistFolder();
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
  );
}

export default ControlContainer;