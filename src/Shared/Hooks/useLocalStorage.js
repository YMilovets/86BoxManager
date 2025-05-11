import { useNavigate } from "react-router-dom";

export default function useLocalStorage() {
  const navigate = useNavigate();
  const { electronAPI } = window;
  return () => {
    const localConfig = {
      pathConfig: localStorage.getItem("rootDirMachines"),
      pathApp: localStorage.getItem("appPath"),
    };
    if (Object.values(localConfig).some((valueConfig) => !valueConfig)) {
      electronAPI?.getInit(localConfig);
      navigate("/settings");
      throw new Error('0x001');
    }
    return localConfig;
  };
}
