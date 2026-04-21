import { useRef } from "react";

import Button from "../../Components/Button";
import { useDictionary } from "../../Providers/LanguageProvider";
import { getDictionary } from "../../Shared";
import ConfigBtnContainer from "../ConfigBtnContainer";
import CreateBtnContainer from "../CreateBtnContainer";
import EditBtnContainer from "../EditBtnContainer";
import LanguageContainer from "../LanguageContainer";
import OpenFolderBtnContainer from "../OpenFolderBtnContainer";
import UpdateBtnContainer from "../UpdateBtnContainer";

import styles from "./ControlContainer.module.css";

function ControlContainer() {
  const { dictionary } = useDictionary();

  const getTransition = getDictionary(dictionary);

  const { electronAPI } = window;

  const selectRef = useRef(null);

  return (
    <div className={styles.control}>
      <CreateBtnContainer className={styles.control_btn} />
      <UpdateBtnContainer
        className={styles.control_btn}
        selectRef={selectRef}
      />
      <EditBtnContainer className={styles.control_btn} />
      <ConfigBtnContainer className={styles.control_btn} />
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
