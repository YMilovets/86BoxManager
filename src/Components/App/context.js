import { createContext } from "react";

export const DictionaryContext = createContext({
    dictionary: null,
    language: "ru",
    changeLanguage: () => {},
})

export const MachineContext = createContext({
  isEdit: false,
  isExistFolder: false,
  listMachines: null,
  isStartedMachines: false,
  prevPathMachines: undefined,
  setListMachines: () => {},
  setStartMachine: () => {},
  removeMachine: () => {},
  setNewMachineName: () => {},
  getExistFolder: async () => {},
  setIsEdit: () => {},
});