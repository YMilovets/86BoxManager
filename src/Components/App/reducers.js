export function reducerListMachines(state, { type, payload }) {
    const reducers = {
      unlockMachine: (state, payload) =>
        state?.map(({ machineId: id, isDisable }) => {
          if (id === payload) return { machineId: id, isDisable: false };
          return { machineId: id, isDisable };
        }) ?? state,
      startMachine: (state, payload) =>
        state?.map(({ machineId: id, isDisable }) => {
          if (id === payload) return { machineId: id, isDisable: true };
          return { machineId: id, isDisable };
        }) ?? state,
      renameMachine: (state, payload) =>
        state?.map(({ machineId: id, isDisable }) => {
          if (id === payload.machineName)
            return { machineId: payload.newMachineName, isDisable };
          return { machineId: id, isDisable };
        }) ?? state,
      removeMachine: (state, payload) =>
        state?.filter(({ machineId: id }) => id !== payload) ?? state,
      writeMachines: (state, payload) =>
        payload?.map((machineId) => {
          const filterListMachines =
            state?.find(({ machineId: id }) => machineId === id) ?? [];
          const { isDisable } = filterListMachines;
          return {
            machineId,
            isDisable: isDisable ?? false,
          };
        }) ?? state,
    };
    return reducers[type](state, payload) ?? state;
  }