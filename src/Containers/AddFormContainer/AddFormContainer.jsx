import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

import { DictionaryContext } from "../../Providers/LanguageProvider";
import { useMachines } from "../../Providers/MachineProvider";
import { getDictionary } from "../../Shared";

function AddFormContainer({ className, children }) {
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState("");
  const { dictionary } = useContext(DictionaryContext);
  const { listMachines, getExistFolder, setIsEdit } =
    useMachines();
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
    <form className={className} onSubmit={handleSubmit}>
      {children(handleChangeMachineName)}
      {errorMsg && <p role="alert">{errorMsg}</p>}
    </form>
  );
}

AddFormContainer.propTypes = {
  className: PropTypes.string,
  children: PropTypes.func,
};

AddFormContainer.propTypes = {
  className: undefined,
  children: () => null,
};

export default AddFormContainer;
