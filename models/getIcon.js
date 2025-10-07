const getOSPlatform = require("./getOSPlatform.js");

function getIcon() {
  const iconList = {
    linux: "linux/256.png",
    win32: "win/favicon.ico",
  };
  const typeOS = getOSPlatform();

  return iconList[typeOS] ?? iconList.win32;
}

module.exports = getIcon;