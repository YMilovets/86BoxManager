import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

import Button from "../../Components/Button";
import { DictionaryContext } from "../../Providers/LanguageProvider";
import { useMachines } from "../../Providers/MachineProvider";
import { getDictionary } from "../../Shared";

function ConfigBtnContainer({ className }) {
  const { dictionary } = useContext(DictionaryContext);
  const { isExistFolder, listMachines, isStartedMachines } = useMachines();

  const getTransition = getDictionary(dictionary);
  const navigate = useNavigate();

  return (
    <Button
      onClick={() => {
        navigate("/settings");
      }}
      disabled={isStartedMachines && isExistFolder && listMachines.length !== 0}
      data-control
      className={className}
      title={getTransition("preference")}
    >
      {getTransition("preference")}
    </Button>
  );
}

ConfigBtnContainer.propTypes = {
  className: PropTypes.string,
};

ConfigBtnContainer.propTypes = {
  className: undefined,
};

export default ConfigBtnContainer;
