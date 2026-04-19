import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

import { DictionaryContext } from "../../Providers/LanguageProvider";
import { MachineContext } from "../../Providers/MachineProvider";
import { getDictionary } from "../../Shared";
import ConfigFormStructContainer from "../ConfigFormStructContainer";

import styles from "./ConfigFormContainer.module.css";

function ConfigFormContainer({ className, children }) {
  const [errorMsg, setErrorMsg] = useState("");

  const { dictionary, language } = useContext(DictionaryContext);
  const { setIsEdit } = useContext(MachineContext);

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

export default ConfigFormContainer;
