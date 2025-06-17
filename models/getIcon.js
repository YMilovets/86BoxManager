import getOSPlatform from "./getOSPlatform.js";

export default function getIcon() {
  const iconList = {
    linux: "linux/256.png",
    win32: "win/favicon.ico",
  };
  const typeOS = getOSPlatform();

  return iconList[typeOS] ?? iconList.win32;
}
