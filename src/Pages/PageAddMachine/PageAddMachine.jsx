import Button from "../../Components/Button";
import InputText from "../../Components/InputText";
import AddFormContainer from "../../Containers/AddFormContainer";
import CancelContainer from "../../Containers/CancelContainer";
import { useDictionary } from "../../Providers/LanguageProvider";
import { getDictionary } from "../../Shared";

import styles from "./PageAddMachine.module.css";

function PageAddMachine() {
  const { dictionary } = useDictionary();

  const getTransition = getDictionary(dictionary);
  return (
    <AddFormContainer className={styles.form}>
      {(onClearError) => (
        <>
          <div className={styles.form_machine_name}>
            <label htmlFor="machineName">{getTransition("createForm")}</label>
            <InputText
              type="text"
              name="machineName"
              id="machineName"
              onChange={onClearError}
            />
          </div>
          <div className={styles.control}>
            <Button isPrimary disabled={!window.electronAPI} type="submit">
              {getTransition("save")}
            </Button>
            <CancelContainer />
          </div>
        </>
      )}
    </AddFormContainer>
  );
}

export default PageAddMachine;
