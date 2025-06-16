import { useNavigate } from "react-router-dom";

import { ErrorType } from "../../../shared";

export default function useLocalStorage() {
  const navigate = useNavigate();
  const { electronAPI } = window;
  return () => {
    const localConfig = {
      pathConfig: localStorage.getItem("rootDirMachines"),
      pathApp: localStorage.getItem("appPath"),
    };
    if (
      electronAPI &&
      Object.values(localConfig).some((valueConfig) => !valueConfig)
    ) {
      electronAPI?.getInit(localConfig);
      navigate("/settings");
      throw new Error(ErrorType.MissingConfiguration);
    }
    return localConfig;
  };
}
