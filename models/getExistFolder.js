const { existsSync } = require("fs");

async function getExistFolder(_, checkedFolder) {
  return existsSync(checkedFolder);
}

module.exports = getExistFolder;
