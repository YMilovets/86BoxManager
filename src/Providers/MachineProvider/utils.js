export function mergeActiveWithResultMachines(
  resultIndexList,
  activeMachinesByFolder = new Set()
) {
  const machinesList = [
    ...resultIndexList
      .filter((machineId) => !activeMachinesByFolder?.has(machineId))
      .map((machineId) => ({ machineId })),
    ...Array.from(activeMachinesByFolder).map((machineId) => ({
      machineId,
      isDisable: activeMachinesByFolder.has(machineId),
    })),
  ];

  const processMachinesList = machinesList.sort(
    ({ machineId: prevMachineId }, { machineId: nextMachineId }) =>
      prevMachineId > nextMachineId ? 1 : -1
  );

  return processMachinesList;
}
