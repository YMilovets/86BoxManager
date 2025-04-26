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
  setListMachines: () => {},
  setStartMachine: () => {},
  removeMachine: () => {},
  setNewMachineName: () => {},
  getExistFolder: async () => {},
  setIsEdit: () => {},
});