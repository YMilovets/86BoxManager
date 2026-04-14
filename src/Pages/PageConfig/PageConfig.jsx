import { useCallback, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  DictionaryContext,
  MachineContext,
} from "../../Components/App/context";
import Button from "../../Components/Button";
import InputBrowserFolder from "../../Components/InputBrowserFolder";
import LanguageContainer from "../../Containers/LanguageContainer";
import MessageContainer from "../../Containers/MessageContainer";
import { getDictionary } from "../../Shared";

import { getDefaultListFormInput } from "./utils";

import styles from "./PageConfig.module.css";

function PageConfig() {
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState("");

  const { dictionary, language } = useContext(DictionaryContext);
  const { setIsEdit } = useContext(MachineContext);
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
    const preferenceItems = Object.fromEntries(new FormData(e.currentTarget));

    const self = e.currentTarget.elements;
    try {
      if (!preferenceItems.destinationAppFolder.trim()) {
        self.destinationAppFolder.focus();
        throw new Error(getTransition("errorDestinationAppFolder"));
      }
      if (!preferenceItems.configFolder.trim()) {
        self.configFolder.focus();
        throw new Error(getTransition("errorConfigFolder"));
      }
      const isExistFolder = await window.electronAPI?.existFolder(
        preferenceItems.configFolder
      );
      if (!isExistFolder) {
        self.configFolder.focus();
        throw new Error(getTransition("noExistFolder"));
      }
      localStorage.setItem("appPath", preferenceItems.destinationAppFolder);
      localStorage.setItem("rootDirMachines", preferenceItems.configFolder);
      localStorage.setItem("language", language);

      handleCancel();
    } catch ({ message }) {
      setErrorMsg(message);
    }
  };

  const handleOpenFileDialog = useCallback(
    ({ dialogId, dialogType }) =>
      async () => {
        try {
          const path = await window.electronAPI?.openFileDialog(dialogType);
          setListFormInput((prevListForm) => ({
            ...prevListForm,
            [dialogId]: path,
          }));
          handleChangeMachineName();
        } catch {
          /* empty */
        }
      },
    []
  );

  const handleChangeInput = useCallback((e) => {
    setListFormInput((prevListForm) => ({
      ...prevListForm,
      [e.target.id]: e.target.value,
    }));
  }, []);

  const existPreference = {
    destinationAppFolder: localStorage.getItem("appPath"),
    configFolder: localStorage.getItem("rootDirMachines"),
  };

  const [listFormInput, setListFormInput] = useState(existPreference);

  return (
    <div className={styles.container}>
      {!electronAPI && (
        <p className={styles.alert} role="alert">
          {getTransition("errorElectronAPI")}
        </p>
      )}
      <form className={styles.form} onSubmit={handleSubmit}>
        {getDefaultListFormInput(handleChangeInput).map(
          ({ type, id, onChange, btnGroup }) => {
            const { type: dialogType } = btnGroup;
            return (
              <InputBrowserFolder
                btnGroup={{
                  type: dialogType,
                  label: getTransition("choose"),
                }}
                id={id}
                label={getTransition(id)}
                onChange={onChange}
                onClick={handleOpenFileDialog({ dialogId: id, dialogType })}
                type={type}
                value={listFormInput[id]}
                key={id}
              />
            );
          }
        )}
        <MessageContainer />
        <div className={styles.control}>
          <Button isPrimary disabled={!window.electronAPI} type="submit">
            {getTransition("save")}
          </Button>
          <Button onClick={handleCancel} type="button">
            {getTransition("cancel")}
          </Button>
        </div>
        {errorMsg && (
          <p className={styles.alert} role="alert">
            {errorMsg}
          </p>
        )}
      </form>
      <div className={styles.language}>
        <p className={styles.label}>{getTransition("changeLanguage")}</p>
        <LanguageContainer className={styles.language_select} />
      </div>
    </div>
  );
}

export default PageConfig;
