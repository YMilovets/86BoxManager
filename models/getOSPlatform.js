const { platform } = require("os");

function getOSPlatform() {
  return platform();
}

module.exports = getOSPlatform;