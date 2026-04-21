import PropTypes from "prop-types";

import Button from "../../Components/Button";
import { useDictionary } from "../../Providers/LanguageProvider";
import {
  useMachineActions,
  useMachines,
} from "../../Providers/MachineProvider";
import { getDictionary, useLocalStorage } from "../../Shared";
import LanguageContainer from "../LanguageContainer";

function UpdateBtnContainer({ className, selectRef }) {
  const getLocalStorage = useLocalStorage();
  const { prevPathMachines, isEdit } = useMachines();
  const { getExistFolder, setIsEdit } = useMachineActions();
  const { language, dictionary } = useDictionary();
  const getTransition = getDictionary(dictionary);

  const { electronAPI } = window;

  async function handleUpdateClick() {
    try {
      const localStorage = getLocalStorage();

      const languageList = await electronAPI.getLanguageList();
      const { language: selectedLanguageName } = {
        ...languageList.find(({ languageId }) => languageId === language),
      };
      selectRef.current.querySelector("selectedcontent").textContent =
        selectedLanguageName;

      try {
        await electronAPI?.compareSavedConfiguration(localStorage);
      } catch {
        const isExistMachine = await getExistFolder();
        if (isEdit && isExistMachine && prevPathMachines) {
          electronAPI?.getNotification({
            title: getTransition("clearFormAfterUpdateTitle"),
            text: getTransition("clearFormAfterUpdateMessage")
              .replace("$prevPathMachines", prevPathMachines)
              .replace("$currentPathMachines", localStorage.pathConfig),
          });
        }
        Array.prototype.forEach.call(document.forms, (form) => form.reset());
      }

      electronAPI?.getInit(localStorage);
      const isExistMachine = await getExistFolder();
      if (!isExistMachine) setIsEdit(false);
    } catch {
      /* empty */
    }
  }

  return (
    <Button
      onClick={handleUpdateClick}
      data-control
      className={className}
      title={getTransition("update")}
    >
      {getTransition("update")}
    </Button>
  );
}

UpdateBtnContainer.propTypes = {
  className: PropTypes.string,
  selectRef: PropTypes.shape({
    current: PropTypes.instanceOf(LanguageContainer),
  }),
};

UpdateBtnContainer.defaultProps = {
  className: undefined,
  selectRef: {
    current: null,
  },
};

export default UpdateBtnContainer;
