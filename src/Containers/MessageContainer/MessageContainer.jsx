import { useContext, useEffect, useState } from "react";
import Message from "../../Components/Message";
import { DictionaryContext } from "../../Components/App/context";
import getDictionary from "../../Shared/Utils/getTransition";
import { DOWNLOAD_URL, INSTRUCTION_URL, PlatformList } from "../../Shared/Constants";

function MessageContainer() {
  const { dictionary } = useContext(DictionaryContext);
  const [platform, setPlatform] = useState(PlatformList.Windows);
  const { electronAPI } = window;

  useEffect(() => {
    async function getPlatform() {
      const platform = await electronAPI?.getOSPlatform();
      setPlatform(platform);
    }
    getPlatform();
  }, []);

  const getTransition = getDictionary(dictionary);

  const infoChunkWindowsComponents = getTransition(
    "destinationWindowsMessage"
  ).split("$downloadURL");

  const infoChunkLinuxComponents = getTransition(
    "destinationLinuxMessage"
  ).split("$instructionURL");

  const messagePlatformList = {
    [PlatformList.Windows]: [
      infoChunkWindowsComponents[0],
      <a
        key={PlatformList.Windows}
        onClick={(e) => {
          e.preventDefault();
          electronAPI?.openURL(DOWNLOAD_URL);
        }}
        href={DOWNLOAD_URL}
      >
        {DOWNLOAD_URL}
      </a>,
      infoChunkWindowsComponents[1],
    ],
    [PlatformList.Linux]: [
      infoChunkLinuxComponents[0],
      <a
        key={PlatformList.Linux}
        onClick={(e) => {
          e.preventDefault();
          electronAPI?.openURL(INSTRUCTION_URL);
        }}
        href={INSTRUCTION_URL}
      >
        {INSTRUCTION_URL}
      </a>,
      infoChunkLinuxComponents[1],
    ],
  };

  const messageList = messagePlatformList[platform];

  if (!messageList || messageList?.length === 0) return null;

  return <Message>{messageList}</Message>;
}

export default MessageContainer;
