import { useCallback, useEffect, useMemo, useReducer } from "react";
import PropTypes from "prop-types";

import { MachineActionsContext, MachineContext } from "./context";
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

  const setStatusStartedMachine = useCallback(
    (startMachineId) =>
      dispatch({ type: "startMachine", payload: startMachineId }),
    []
  );

  const removeMachine = useCallback(
    (removeMachineId) =>
      dispatch({ type: "removeMachine", payload: removeMachineId }),
    []
  );

  const renameMachine = useCallback(
    (machineName, newMachineName) =>
      dispatch({
        type: "renameMachine",
        payload: { machineName, newMachineName },
      }),
    []
  );

  const unlockMachine = useCallback(
    ({
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
    []
  );

  const getExistFolder = useCallback(async () => {
    const isExistPath = await electronAPI?.existFolder(
      localStorage.getItem("rootDirMachines")
    );
    dispatch({ type: "setIsExistFolder", payload: isExistPath });
    return isExistPath;
  }, []);

  const setIsEditStatus = useCallback(
    (isEditPayload) =>
      dispatch({ type: "changeStatus", payload: isEditPayload }),
    []
  );

  const value = useMemo(
    () => ({
      isEdit,
      isExistFolder,
      prevPathMachines,
      listMachines: listMachinesState,
      isStartedMachines,
    }),
    [
      isEdit,
      isExistFolder,
      prevPathMachines,
      listMachinesState,
      isStartedMachines,
    ]
  );

  const actions = useMemo(
    () => ({
      unlockMachine,
      removeMachine,
      getExistFolder,
      setStartMachine: setStatusStartedMachine,
      setNewMachineName: renameMachine,
      setIsEdit: setIsEditStatus,
    }),
    [
      unlockMachine,
      removeMachine,
      getExistFolder,
      setStatusStartedMachine,
      renameMachine,
      setIsEditStatus,
    ]
  );

  return (
    <MachineContext.Provider value={value}>
      <MachineActionsContext.Provider value={actions}>
        {children}
      </MachineActionsContext.Provider>
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
