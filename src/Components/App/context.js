import { createContext } from "react";

export const DictionaryContext = createContext({
    dictionary: null,
    changeLanguage: () => {},
})

export const MachineContext = createContext({
    listMachines: null,
    setListMachines: () => {},
    setStartMachine: () => {},
    removeMachine: () => {},
    setNewMachineName: () => {},
})