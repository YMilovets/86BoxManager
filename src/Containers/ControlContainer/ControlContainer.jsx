import { useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";

import {
  DictionaryContext,
  MachineContext,
} from "../../Components/App/context";
import Button from "../../Components/Button";
import { getDictionary } from "../../Shared";
import CreateBtnContainer from "../CreateBtnContainer";
import EditBtnContainer from "../EditBtnContainer";
import LanguageContainer from "../LanguageContainer";
import OpenFolderBtnContainer from "../OpenFolderBtnContainer";
import UpdateBtnContainer from "../UpdateBtnContainer";

import styles from "./ControlContainer.module.css";

function ControlContainer() {
  const { dictionary } = useContext(DictionaryContext);
  const { isExistFolder, listMachines, isStartedMachines } =
    useContext(MachineContext);

  const getTransition = getDictionary(dictionary);

  const { electronAPI } = window;

  const navigate = useNavigate();
  const selectRef = useRef(null);

  return (
    <div className={styles.control}>
      <CreateBtnContainer className={styles.control_btn} />
      <UpdateBtnContainer
        className={styles.control_btn}
        selectRef={selectRef}
      />
      <EditBtnContainer className={styles.control_btn} />
      <Button
        onClick={() => {
          navigate("/settings");
        }}
        disabled={
          isStartedMachines && isExistFolder && listMachines.length !== 0
        }
        data-control
        className={styles.control_btn}
        title={getTransition("preference")}
      >
        {getTransition("preference")}
      </Button>
      <OpenFolderBtnContainer className={styles.control_btn} />
      <Button
        onClick={() => electronAPI?.getVersion()}
        data-control
        className={styles.control_btn}
        title={getTransition("aboutBtn")}
      >
        {getTransition("aboutBtn")}
      </Button>
      <LanguageContainer className={styles.language_select} ref={selectRef} />
    </div>
  );
}

export default ControlContainer;
