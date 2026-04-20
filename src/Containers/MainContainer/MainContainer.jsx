import { memo, useEffect } from "react";
import PropTypes from "prop-types";

import { useMachineActions } from "../../Providers/MachineProvider";
import { useLocalStorage } from "../../Shared";

function MainContainer({ children, className }) {
  const { unlockMachine, getExistFolder, setIsEdit } = useMachineActions();

  const { electronAPI } = window;

  const getLocalStorage = useLocalStorage();

  useEffect(() => {
    try {
      const localConfig = getLocalStorage();
      electronAPI?.getInit(localConfig);
      getExistFolder();

      electronAPI?.onUnlockedConfiguration(
        async ({
          machineId: closedMachine,
          isExistFolder,
          activeMachines,
          processPathConfiguration,
          prevPathConfiguration,
          message: { text, title },
        }) => {
          const localConfig = getLocalStorage();

          const isCurrentExistFolder = await getExistFolder();

          if (!isCurrentExistFolder) setIsEdit(isCurrentExistFolder);

          const isChangedPrevPathConfig =
            prevPathConfiguration !== localConfig.pathConfig;

          if (isCurrentExistFolder && isChangedPrevPathConfig) {
            electronAPI?.getNotification({
              title,
              text: text
                .replace("$prevPathMachines", prevPathConfiguration)
                .replace("$currentPathMachines", localConfig.pathConfig),
            });
          }

          if (isChangedPrevPathConfig) {
            electronAPI?.getInit(localConfig);
            return;
          }

          unlockMachine({
            isExistFolder,
            closedMachine,
            activeMachines,
            processPathConfiguration,
          });
        }
      );
    } catch {
      /* empty */
    }
  }, []);

  return <main className={className}>{children}</main>;
}

MainContainer.propTypes = {
  children: PropTypes.element,
  className: PropTypes.string,
};

MainContainer.defaultProps = {
  children: null,
  className: undefined,
};

const MainContainerMemo = memo(MainContainer);

export default MainContainerMemo;
