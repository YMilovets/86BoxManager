import { useContext, useState } from "react";

import InputBrowserFolder from "../../Components/InputBrowserFolder";
import { DictionaryContext } from "../../Providers/LanguageProvider";
import { getDictionary } from "../../Shared";

import { getDefaultListFormInput } from "./utils";

function ConfigFormStructContainer({ onChangeMachineName }) {
  const { dictionary } = useContext(DictionaryContext);

  const handleOpenFileDialog =
    ({ dialogId, dialogType }) =>
    async () => {
      try {
        const path = await window.electronAPI?.openFileDialog(dialogType);
        setListFormInput((prevListForm) => ({
          ...prevListForm,
          [dialogId]: path,
        }));
        onChangeMachineName?.();
      } catch {
        /* empty */
      }
    };

  const handleChangeInput = (e) => {
    setListFormInput((prevListForm) => ({
      ...prevListForm,
      [e.target.id]: e.target.value,
    }));
  };

  const existPreference = {
    destinationAppFolder: localStorage.getItem("appPath"),
    configFolder: localStorage.getItem("rootDirMachines"),
  };

  const [listFormInput, setListFormInput] = useState(existPreference);

  const getTransition = getDictionary(dictionary);

  return getDefaultListFormInput(handleChangeInput).map(
    ({ type, id, onChange, btnGroup }) => {
      const { type: dialogType } = btnGroup;
      return (
        <InputBrowserFolder
          btnGroup={{
            type: dialogType,
            label: getTransition("choose"),
          }}
          id={id}
          label={getTransition(id)}
          onChange={onChange}
          onClick={handleOpenFileDialog({
            dialogId: id,
            dialogType,
          })}
          type={type}
          value={listFormInput[id]}
          key={id}
        />
      );
    }
  );
}

export default ConfigFormStructContainer;
