import { useRef } from "react";

import AboutBtnContainer from "../AboutBtnContainer";
import ConfigBtnContainer from "../ConfigBtnContainer";
import CreateBtnContainer from "../CreateBtnContainer";
import EditBtnContainer from "../EditBtnContainer";
import LanguageContainer from "../LanguageContainer";
import OpenFolderBtnContainer from "../OpenFolderBtnContainer";
import UpdateBtnContainer from "../UpdateBtnContainer";

import styles from "./ControlContainer.module.css";

function ControlContainer() {
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
      <AboutBtnContainer className={styles.control_btn} />
      <LanguageContainer className={styles.language_select} ref={selectRef} />
    </div>
  );
}

export default ControlContainer;
