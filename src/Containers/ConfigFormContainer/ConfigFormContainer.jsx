import { memo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

import { useDictionary } from "../../Providers/LanguageProvider";
import { useMachineActions } from "../../Providers/MachineProvider";
import { getDictionary, useLocalStorage } from "../../Shared";
import ConfigFormStructContainer from "../ConfigFormStructContainer";

import styles from "./ConfigFormContainer.module.css";

function ConfigFormContainer({ className, children }) {
  const [errorMsg, setErrorMsg] = useState("");

  const { dictionary, language } = useDictionary();
  const { setIsEdit } = useMachineActions();
  const getLocalStorage = useLocalStorage(true);

  const navigate = useNavigate();
  const getTransition = getDictionary(dictionary);

  const handleCancel = () => {
    setIsEdit(false);
    navigate("/");
  };

  const handleChangeMachineName = () => {
    setErrorMsg("");
  };

  const { electronAPI } = window;

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
      const isExistFolder = await electronAPI?.existFolder(
        preferenceItems.configFolder,
      );
      if (!isExistFolder) {
        self.configFolder.focus();
        throw new Error(getTransition("noExistFolder"));
      }
      const { pathApp, pathConfig } = getLocalStorage();

      if (pathApp !== preferenceItems.destinationAppFolder) {
        electronAPI?.setRecordLog({
          message: getTransition("changeDestinationAppFolder")
            .replace("$prevDestinationAppFolder", pathApp)
            .replace(
              "$destinationAppFolder",
              preferenceItems.destinationAppFolder,
            ),
        });
      }
      
      if (pathConfig !== preferenceItems.configFolder) {
        electronAPI?.setRecordLog({
          message: getTransition("changeConfigAppFolder")
            .replace("$prevConfigFolder", pathConfig)
            .replace("$configFolder", preferenceItems.configFolder),
        });
      }

      localStorage.setItem("appPath", preferenceItems.destinationAppFolder);
      localStorage.setItem("rootDirMachines", preferenceItems.configFolder);
      localStorage.setItem("language", language);

      handleCancel();
    } catch ({ message }) {
      setErrorMsg(message);
    }
  };

  return (
    <form className={className} onSubmit={handleSubmit}>
      <ConfigFormStructContainer
        onChangeMachineName={handleChangeMachineName}
      />
      {children}
      {errorMsg && (
        <p className={styles.alert} role="alert">
          {errorMsg}
        </p>
      )}
    </form>
  );
}

ConfigFormContainer.propTypes = {
  className: PropTypes.string,
  children: PropTypes.element,
};

ConfigFormContainer.defaultProps = {
  className: undefined,
  children: null,
};

const ConfigFormContainerMemo = memo(ConfigFormContainer);

export default ConfigFormContainerMemo;
