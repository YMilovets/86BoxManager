import Button from "../../Components/Button";
import CancelContainer from "../../Containers/CancelContainer";
import ConfigFormContainer from "../../Containers/ConfigFormContainer";
import LanguageContainer from "../../Containers/LanguageContainer";
import MessageContainer from "../../Containers/MessageContainer";
import ThemeBtnContainer from "../../Containers/ThemeBtnContainer";
import { useDictionary } from "../../Providers/LanguageProvider";
import { getDictionary } from "../../Shared";

import styles from "./PageConfig.module.css";

function PageConfig() {
  const { dictionary } = useDictionary();
  const { electronAPI } = window;

  const getTransition = getDictionary(dictionary);

  return (
    <div className={styles.container}>
      {!electronAPI && (
        <p className={styles.alert} role="alert">
          {getTransition("errorElectronAPI")}
        </p>
      )}
      <ConfigFormContainer className={styles.form}>
        <MessageContainer />
        <div className={styles.control}>
          <Button isPrimary disabled={!window.electronAPI} type="submit">
            {getTransition("save")}
          </Button>
          <CancelContainer />
        </div>
      </ConfigFormContainer>
      <div className={styles.control}>
        <div className={styles.language}>
          <p className={styles.label}>{getTransition("changeLanguage")}</p>
          <LanguageContainer className={styles.language_select} />
        </div>
        <div className={styles.language}>
          <p className={styles.label}>{getTransition("changeTheme")}</p>
          <ThemeBtnContainer />
        </div>
      </div>
    </div>
  );
}

export default PageConfig;
