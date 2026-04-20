import { useContext } from "react";
import PropTypes from "prop-types";

import Button from "../../Components/Button";
import { DictionaryContext } from "../../Providers/LanguageProvider";
import { useMachines } from "../../Providers/MachineProvider";
import { getDictionary, useLocalStorage } from "../../Shared";

function EditBtnContainer({ className }) {
  const { dictionary } = useContext(DictionaryContext);
  const { isEdit, isExistFolder, listMachines, getExistFolder, setIsEdit } =
    useMachines();

  const getTransition = getDictionary(dictionary);

  const getLocalStorage = useLocalStorage();

  const { electronAPI } = window;

  async function handleChangeMode() {
    try {
      const localStorage = getLocalStorage();
      electronAPI?.getInit(localStorage);
      const isExistMachine = await getExistFolder();
      setIsEdit(!isEdit && isExistMachine);
      if (isEdit) electronAPI?.getInit(localStorage);
    } catch {
      /* empty */
    }
  }

  return (
    <Button
      onClick={handleChangeMode}
      disabled={listMachines.length === 0 || !isExistFolder}
      data-control
      className={className}
      title={!isEdit ? getTransition("edit") : getTransition("cancel")}
    >
      {!isEdit ? getTransition("edit") : getTransition("cancel")}
    </Button>
  );
}

EditBtnContainer.propTypes = {
  className: PropTypes.string,
};

EditBtnContainer.defaultProps = {
  className: undefined,
};

export default EditBtnContainer;
