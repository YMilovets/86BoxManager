import { useContext } from "react";
import { useNavigate } from "react-router-dom";

import Button from "../../Components/Button";
import { DictionaryContext } from "../../Providers/LanguageProvider";
import { MachineContext } from "../../Providers/MachineProvider";
import { getDictionary } from "../../Shared";

function CancelContainer() {
  const navigate = useNavigate();
  const { setIsEdit } = useContext(MachineContext);
  const { dictionary } = useContext(DictionaryContext);

  const getTransition = getDictionary(dictionary);

  const handleCancel = () => {
    setIsEdit(false);
    navigate("/");
  };
  
  return (
    <Button onClick={handleCancel} type="button">
      {getTransition("cancel")}
    </Button>
  );
}

export default CancelContainer;
