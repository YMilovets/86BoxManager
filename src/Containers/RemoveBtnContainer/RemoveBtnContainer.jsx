import { useContext } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";

import {
  DictionaryContext,
  MachineContext,
} from "../../Components/App/context";
import Button from "../../Components/Button";
import { Close } from "../../Components/Icon";
import { getDictionary, useLocalStorage } from "../../Shared";

import styles from "./RemoveBtnContainer.module.css";

function RemoveBtnContainer({ machineId, isDisable, onChange }) {
  const { removeMachine, getExistFolder, setIsEdit } =
    useContext(MachineContext);
  const { dictionary } = useContext(DictionaryContext);
  const getLocalStorage = useLocalStorage();

  const getTransition = getDictionary(dictionary);

  function handleRemoveMachine(removeMachineId) {
    return async () => {
      const localStorage = getLocalStorage();
      const isExistMachine = await getExistFolder();
      if (!isExistMachine) {
        setIsEdit(false);
        return;
      }

      try {
        await onChange?.();
      } catch {
        electronAPI.getInit(localStorage);
        return;
      }

      try {
        const result = await electronAPI?.removeMachine(removeMachineId);
        const { machineName } = result;
        if (machineName) {
          removeMachine(machineName);
        }
      } catch {
        const isExistMachine = await getExistFolder();
        if (!isExistMachine) {
          setIsEdit(false);
          return;
        }
        electronAPI.getInit(localStorage);
      }
    };
  }

  const { electronAPI } = window;

  return (
    <Button
      className={styles.remove_btn}
      disabled={!electronAPI || isDisable}
      onClick={handleRemoveMachine(machineId)}
      title={`${getTransition("remove")} ${machineId}`}
      type="button"
    >
      <Close
        className={clsx(styles.remove_icon, {
          [styles.remove_icon__disabled]: isDisable,
        })}
      />
    </Button>
  );
}

RemoveBtnContainer.propTypes = {
  machineId: PropTypes.string,
  isDisable: PropTypes.bool,
  onChange: PropTypes.func,
};

RemoveBtnContainer.defaultProps = {
  machineId: undefined,
  isDisable: false,
  onChange: () => {},
};

export default RemoveBtnContainer;
