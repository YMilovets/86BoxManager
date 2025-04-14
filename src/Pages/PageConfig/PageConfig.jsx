import clsx from "clsx";
import { useNavigate } from "react-router-dom";
import { useContext, useState, useCallback } from "react";

import getDictionary from "../../Shared/Utils/getTransition";
import { DictionaryContext } from "../../Components/App/context";

import { getDefaultListFormInput } from "./utils";
import InputBrowserFolder from "../../Components/InputBrowserFolder";
import Button from "../../Components/Button";

import styles from "./PageConfig.module.css";

function PageConfig() {
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState("");
  const { dictionary, changeLanguage, language } =
    useContext(DictionaryContext);

  const getTransition = getDictionary(dictionary);

  const handleChangeMachineName = () => {
    setErrorMsg("");
  };

  const handleCancel = () => {
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
  const handleChangeLanguage = useCallback(
    (lang) => () => {
      handleChangeMachineName();
      changeLanguage(lang);
    },
    []
  );

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
      <form className={styles.form} onSubmit={handleSubmit}>
        {getDefaultListFormInput(handleChangeInput).map(
          ({ type, id, onChange, btnGroup }) => {
            const { type: dialogType } = btnGroup;
            return (
              <InputBrowserFolder
                btnGroup={{ type: dialogType, label: getTransition("choose") }}
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
      <div>
        <p className={styles.label}>{getTransition("changeLanguage")}</p>
        <div className={styles.language}>
          <Button
            className={clsx(styles.language_btn, {
              [styles.language_btn__selected]: language === "ru",
            })}
            onClick={handleChangeLanguage("ru")}
            type="button"
          >
            Русский
          </Button>
          <Button
            className={clsx(styles.language_btn, {
              [styles.language_btn__selected]: language === "en",
            })}
            onClick={handleChangeLanguage("en")}
            type="button"
          >
            English
          </Button>
        </div>
      </div>
    </div>
  );
}

export default PageConfig;
