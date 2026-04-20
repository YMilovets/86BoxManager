import { useContext } from "react";

import ControlContainer from "../../Containers/ControlContainer";
import ControlMachineContainer from "../../Containers/ControlMachineContainer";
import HeaderContainer from "../../Containers/HeaderContainer";
import MainContainer from "../../Containers/MainContainer";
import { DictionaryContext } from "../../Providers/LanguageProvider";
import { getDictionary } from "../../Shared";

import styles from "./PageMain.module.css";

function PageMain() {
  const { dictionary } = useContext(DictionaryContext);
  const getTransition = getDictionary(dictionary);

  const { electronAPI } = window;

  function getPathConfig() {
    return localStorage.getItem("rootDirMachines");
  }

  return (
    <MainContainer className={styles.root}>
      <div className={styles.container}>
        <header className={styles.header}>
          <HeaderContainer />
        </header>

        <div className={styles.scroll}>
          <ControlMachineContainer />
          {!electronAPI && (
            <p className={styles.alert} role="alert">
              {getTransition("errorElectronAPI")}
            </p>
          )}
        </div>

        <ControlContainer />
      </div>
      <footer className={styles.footer}>
        <strong className={styles.legend}>
          {getTransition("selectedFolder")}
        </strong>
        : {getPathConfig()}
      </footer>
    </MainContainer>
  );
}

export default PageMain;
