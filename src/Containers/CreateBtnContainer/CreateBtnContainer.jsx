import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

import Button from "../../Components/Button";
import { DictionaryContext } from "../../Providers/LanguageProvider";
import { MachineContext } from "../../Providers/MachineProvider";
import { getDictionary, useLocalStorage } from "../../Shared";

function CreateBtnContainer({ className }) {
  const { electronAPI } = window;

  const { dictionary } = useContext(DictionaryContext);

  const getTransition = getDictionary(dictionary);

  const navigate = useNavigate();

  const { isExistFolder, setIsEdit, getExistFolder } =
    useContext(MachineContext);

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
