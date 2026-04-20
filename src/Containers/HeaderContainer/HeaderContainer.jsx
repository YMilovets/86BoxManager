import { memo, useContext } from "react";

import { DictionaryContext } from "../../Providers/LanguageProvider";
import { useMachines } from "../../Providers/MachineProvider";
import { getDictionary } from "../../Shared";

import styles from "./HeaderContainer.module.css";

function HeaderContainer() {
  const { dictionary } = useContext(DictionaryContext);
  const getTransition = getDictionary(dictionary);
  const { isEdit } = useMachines();

  return (
    <h3 className={styles.label}>
      {getTransition("list")} {isEdit && getTransition("editMode")}
    </h3>
  );
}

const HeaderContainerMemo = memo(HeaderContainer);

export default HeaderContainerMemo;
