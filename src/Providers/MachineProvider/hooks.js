import { useContext } from "react";

import { ErrorType } from "../../../shared";

import { MachineActionsContext, MachineContext } from "./context";

export function useMachines() {
  const machineContext = useContext(MachineContext);

  if (!machineContext) throw new Error(ErrorType.ContextIsOutOfProvider);

  return machineContext;
}

export function useMachineActions() {
  const machineActions = useContext(MachineActionsContext);

  if (!machineActions) throw new Error(ErrorType.ContextIsOutOfProvider);

  return machineActions;
}
