import { useContext } from "react";
import PropTypes from "prop-types";

import Button from "../../Components/Button";
import { DictionaryContext } from "../../Providers/LanguageProvider";
import {
  useMachineActions,
  useMachines,
} from "../../Providers/MachineProvider";
import { getDictionary, useLocalStorage } from "../../Shared";

function OpenFolderBtnContainer({ className }) {
  const { dictionary } = useContext(DictionaryContext);

  const getLocalStorage = useLocalStorage();
  const { isExistFolder, isEdit } = useMachines();
  const { getExistFolder, setIsEdit } = useMachineActions();

  const getTransition = getDictionary(dictionary);

  const { electronAPI } = window;

  async function handleOpenFolder() {
    const localStorage = getLocalStorage();
    electronAPI?.getInit(localStorage);

    const isExistMachine = await getExistFolder();
    setIsEdit(isEdit && isExistMachine);

    if (!isExistFolder) return;
    electronAPI?.openSpecificFolder();
  }

  return (
    <Button
      disabled={!isExistFolder}
      onClick={handleOpenFolder}
      data-control
      className={className}
      title={getTransition("open")}
    >
      {getTransition("open")}
    </Button>
  );
}

OpenFolderBtnContainer.propTypes = {
  className: PropTypes.string,
};

OpenFolderBtnContainer.defaultProps = {
  className: undefined,
};

export default OpenFolderBtnContainer;
