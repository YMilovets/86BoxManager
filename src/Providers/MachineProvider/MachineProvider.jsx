import { useEffect, useReducer } from "react";
import PropTypes from "prop-types";

import { MachineContext } from "./context";
import { reducerListMachines } from "./reducers";

const INITIAL_STATE = {
  machineList: [],
  isEdit: false,
  isStartedMachines: false,
  isExistFolder: false,
};

function MachineProvider({ children }) {
  const [
    {
      machineList: listMachinesState,
      isEdit,
      prevPathMachines,
      isStartedMachines,
      isExistFolder,
    },
    dispatch,
  ] = useReducer(reducerListMachines, INITIAL_STATE);

  const { electronAPI } = window;

  async function getExistFolder() {
    const isExistPath = await electronAPI?.existFolder(
      localStorage.getItem("rootDirMachines")
    );
    dispatch({ type: "setIsExistFolder", payload: isExistPath });
    return isExistPath;
  }

  useEffect(() => {
    electronAPI?.onConfigMachines(
      ({ resultList, activeMachines = new Map() }) => {
        const rootDirMachines = localStorage.getItem("rootDirMachines");
        const activeMachinesByFolder =
          activeMachines.get(rootDirMachines) ?? new Set();

        dispatch({
          type: "writeMachines",
          payload: { resultList, activeMachinesByFolder, activeMachines },
        });
        dispatch({ type: "setPathMachines", payload: rootDirMachines });
      }
    );
  }, []);

  return (
    <MachineContext.Provider
      value={{
        isEdit,
        isExistFolder,
        prevPathMachines,
        listMachines: listMachinesState,
        isStartedMachines,
        setStartMachine: (startMachineId) =>
          dispatch({ type: "startMachine", payload: startMachineId }),
        removeMachine: (removeMachineId) =>
          dispatch({ type: "removeMachine", payload: removeMachineId }),
        setNewMachineName: (machineName, newMachineName) =>
          dispatch({
            type: "renameMachine",
            payload: { machineName, newMachineName },
          }),
        unlockMachine: ({
          isExistFolder,
          closedMachine,
          activeMachines,
          processPathConfiguration,
        }) =>
          dispatch({
            type: "unlockMachine",
            payload: {
              isExistFolder,
              closedMachine,
              activeMachines,
              processPathConfiguration,
            },
          }),
        getExistFolder,
        setIsEdit: (isEditPayload) =>
          dispatch({ type: "changeStatus", payload: isEditPayload }),
      }}
    >
      {children}
    </MachineContext.Provider>
  );
}

MachineProvider.propTypes = {
  children: PropTypes.element,
};

MachineProvider.defaultProps = {
  children: null,
};

export default MachineProvider;
