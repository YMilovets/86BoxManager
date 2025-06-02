import { mergeActiveWithResultMachines } from "./utils";

export function reducerListMachines(state, { type, payload }) {
    const reducers = {
    startMachine: (state, payload) => {
      const { machineList: machineListState } = state;
      return {
        ...state,
        machineList:
          machineListState?.map(({ machineId: id, isDisable }) => {
          if (id === payload) return { machineId: id, isDisable: true };
          return { machineId: id, isDisable };
          }) ?? machineListState,
      };
    },
    renameMachine: (state, payload) => {
      const { machineList: machineListState } = state;
      return {
        ...state,
        machineList:
          machineListState?.map(({ machineId: id, isDisable }) => {
          if (id === payload.machineName)
            return { machineId: payload.newMachineName, isDisable };
          return { machineId: id, isDisable };
          }) ?? machineListState,
      };
    },
    removeMachine: (state, payload) => {
      const { machineList: machineListState } = state;
      return {
        ...state,
        machineList:
          machineListState?.filter(({ machineId: id }) => id !== payload) ??
          machineListState,
      };
    },
    writeMachines: (state, payload) => {
      const { resultList, activeMachinesByFolder, activeMachines } = payload;
      const { machineList: machineListState } = state;

      const isStartedMachines =
        activeMachines &&
        Array.from(activeMachines, ([, machineValues]) => machineValues).some(
          (machineList) => machineList.size !== 0
        );

      return {
        ...state,
        isStartedMachines,
        machineList:
          mergeActiveWithResultMachines(resultList, activeMachinesByFolder) ??
          machineListState,
      };
    },
    unlockMachine: (
      state,
      { closedMachine, isExistFolder, activeMachines, processPathConfiguration }
    ) => {
      const isStartedMachines =
        activeMachines &&
        Array.from(activeMachines, ([, machineValues]) => machineValues).some(
          (machineList) => machineList.size !== 0
        );

      const processActiveMachine = activeMachines.get(processPathConfiguration);
      const currentMachinePath = localStorage.getItem("rootDirMachines");
      const isClosedMachineFromCurrentDirectory =
        processActiveMachine?.has(closedMachine) ||
        processPathConfiguration !== currentMachinePath;

          return {
        ...state,
        isStartedMachines,
        machineList: state.machineList.reduce(
          (currentMachineState, machineItem) => {
            const { machineId: currentMachineId } = machineItem;

            if (currentMachineId === closedMachine && !isExistFolder) {
              return currentMachineState;
            }
            if (currentMachineId === closedMachine) {
              return [
                ...currentMachineState,
                {
                  machineId: currentMachineId,
                  isDisable: isClosedMachineFromCurrentDirectory,
                },
              ];
            }
            return [...currentMachineState, machineItem];
          },
          []
        ),
      };
    },
    changeStatus: (state, payload) => {
      return { ...state, isEdit: payload };
    },
    };
    return reducers[type](state, payload) ?? state;
  }