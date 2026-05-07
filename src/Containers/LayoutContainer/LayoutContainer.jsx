import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";

import { useDictionary } from "../../Providers/LanguageProvider";
import { getDictionary } from "../../Shared";

function LayoutContainer() {
  const [isExistDictionary, setIsExistDictionary] = useState(false);
  const { dictionary } = useDictionary();
  const getTranslation = getDictionary(dictionary);

  const { electronAPI } = window;

  useEffect(() => {
    if (isExistDictionary) {
      return;
    }

    setIsExistDictionary(!!dictionary);
    if (dictionary) {
      electronAPI?.setRecordLog({
        message: getTranslation("startApplication"),
      });
    }
  }, [dictionary, isExistDictionary]);

  return <Outlet />;
}

export default LayoutContainer;
