import { createContext } from "react";

export const MachineContext = createContext({
  isEdit: false,
  isExistFolder: false,
  listMachines: null,
  isStartedMachines: false,
  prevPathMachines: undefined,
});

export const MachineActionsContext = createContext({
  setListMachines: () => {},
  setStartMachine: () => {},
  removeMachine: () => {},
  setNewMachineName: () => {},
  getExistFolder: async () => {},
  setIsEdit: () => {},
});