import { useNavigate } from "react-router-dom";
import Button from "../../Components/Button";
import { useContext, useState } from "react";
import InputText from "../../Components/InputText";

import getDictionary from "../../Shared/Utils/getTransition";
import { DictionaryContext, MachineContext } from "../../Components/App/context";
import styles from "./PageAddMachine.module.css";

function PageAddMachine() {
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState("");
  const { dictionary } = useContext(DictionaryContext);
  const { listMachines, getExistFolder, setIsEdit } = useContext(MachineContext);
  const { electronAPI } = window;

  const getTransition = getDictionary(dictionary);

  const handleChangeMachineName = () => {
    setErrorMsg("");
  };
  const handleCancel = () => {
    setIsEdit(false);
    navigate("/");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const machineName = new FormData(e.currentTarget)
      .get("machineName")
      ?.trim();

    const self = e.currentTarget.elements.machineName;
    const isExistMachine = await getExistFolder();
    if (!isExistMachine) {
      handleCancel();
      return;
    }

    const isExistMachineFolder = await electronAPI?.existFolder(
      `${localStorage.getItem("rootDirMachines")}/${machineName}`
    );

    const isProcessMachine = !!listMachines.find(
      ({ machineId }) => machineId === machineName
    );

    if (!isExistMachineFolder && isProcessMachine) {
      setErrorMsg(getTransition("errorMachineProcessExists"));
      return;
    }

    try {
      if (machineName) {
        await electronAPI?.createMachine(machineName);
        handleCancel();
      } else {
        self.focus();
        setErrorMsg(getTransition("nameMachineField"));
      }
    } catch {
      setErrorMsg(getTransition("errorMachineExists"));
      self.focus();
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.form_machine_name}>
        <label htmlFor="machineName">{getTransition("createForm")}</label>
        <InputText
          type="text"
          name="machineName"
          id="machineName"
          onChange={handleChangeMachineName}
        />
      </div>
      <div className={styles.control}>
        <Button disabled={!window.electronAPI} type="submit">
          {getTransition("save")}
        </Button>
        <Button onClick={handleCancel} type="button">
          {getTransition("cancel")}
        </Button>
      </div>
      {errorMsg && <p role="alert">{errorMsg}</p>}
    </form>
  );
}

export default PageAddMachine;
