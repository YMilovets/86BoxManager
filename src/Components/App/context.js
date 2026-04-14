import { createContext } from "react";

import { LanguageList } from "../../Shared";

export const DictionaryContext = createContext({
  dictionary: null,
  language: LanguageList.RU,
});

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