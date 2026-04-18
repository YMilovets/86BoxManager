import { useContext } from "react";
import PropTypes from "prop-types";

import {
  DictionaryContext,
  MachineContext,
} from "../../Components/App/context";
import Button from "../../Components/Button";
import { getDictionary, useLocalStorage } from "../../Shared";

function OpenFolderBtnContainer({ className }) {
  const { dictionary } = useContext(DictionaryContext);

  const getLocalStorage = useLocalStorage();
  const { isExistFolder, getExistFolder, isEdit, setIsEdit } =
    useContext(MachineContext);

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
