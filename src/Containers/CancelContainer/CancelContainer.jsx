import { memo } from "react";
import { useNavigate } from "react-router-dom";

import Button from "../../Components/Button";
import { useDictionary } from "../../Providers/LanguageProvider";
import { useMachineActions } from "../../Providers/MachineProvider";
import { getDictionary } from "../../Shared";

function CancelContainer() {
  const navigate = useNavigate();
  const { setIsEdit } = useMachineActions();
  const { dictionary } = useDictionary();

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

const CancelContainerMemo = memo(CancelContainer);

export default CancelContainerMemo;
