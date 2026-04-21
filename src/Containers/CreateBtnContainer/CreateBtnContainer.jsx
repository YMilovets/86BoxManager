import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

import Button from "../../Components/Button";
import { useDictionary } from "../../Providers/LanguageProvider";
import {
  useMachineActions,
  useMachines,
} from "../../Providers/MachineProvider";
import { getDictionary, useLocalStorage } from "../../Shared";

function CreateBtnContainer({ className }) {
  const { electronAPI } = window;

  const { dictionary } = useDictionary();

  const getTransition = getDictionary(dictionary);

  const navigate = useNavigate();

  const { isExistFolder } = useMachines();
  const { setIsEdit, getExistFolder } = useMachineActions();

  const getLocalStorage = useLocalStorage();

  async function handleCreateClick() {
    try {
      setIsEdit(false);
      getLocalStorage();
      const isExistMachine = await getExistFolder();
      if (!isExistMachine) return;
      navigate("/add-machine");
    } catch {
      /* empty */
    }
  }

  return (
    <Button
      disabled={!electronAPI || !isExistFolder}
      onClick={handleCreateClick}
      data-control
      className={className}
      title={getTransition("create")}
    >
      {getTransition("create")}
    </Button>
  );
}

CreateBtnContainer.propTypes = {
  className: PropTypes.string,
};

CreateBtnContainer.defaultProps = {
  className: undefined,
};

export default CreateBtnContainer;
