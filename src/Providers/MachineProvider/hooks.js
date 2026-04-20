import { useContext } from "react";

import { MachineContext } from "./context";

export function useMachines() {
  return useContext(MachineContext);
}
