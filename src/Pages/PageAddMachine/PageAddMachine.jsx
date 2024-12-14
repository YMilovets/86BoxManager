import { useNavigate } from "react-router-dom";
import Button from "../../Components/Button";
import { useState } from "react";
import InputText from "../../Components/InputText";

import styles from "./PageAddMachine.module.css";

function PageAddMachine() {
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState("");
  const handleChangeMachineName = () => {
    setErrorMsg("");
  };
  const handleCancel = () => {
    navigate("/");
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    const machineName = new FormData(e.currentTarget)
      .get("machineName")
      ?.trim();

    const self = e.currentTarget.elements.machineName;
    try {
      if (machineName) {
        await window.electronAPI?.createMachine(machineName);
        handleCancel();
      } else {
        self.focus();
        setErrorMsg("Введите имя виртуальной машины");
      }
    } catch {
      setErrorMsg(
        "Указанная виртуальная машина уже существует. Введите новое имя"
      );
      self.focus();
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.form_machine_name}>
        <label htmlFor="machineName">Укажите имя виртуальной машины:</label>
        <InputText
          type="text"
          name="machineName"
          id="machineName"
          onChange={handleChangeMachineName}
        />
      </div>
      <div className={styles.control}>
        <Button disabled={!window.electronAPI} type="submit">
          Сохранить
        </Button>
        <Button onClick={handleCancel} type="button">
          Отменить
        </Button>
      </div>
      {errorMsg && <p role="alert">{errorMsg}</p>}
    </form>
  );
}

export default PageAddMachine;
