const log = require("electron-log/main.js");

const { ErrorType } = require("../shared/index.js");

function setRecordLog(_, { message, status = "info" }) {
  if (!log["functions"][status]) {
    throw ErrorType.NoExistFunction;
  }
  log[status](message);
}

module.exports = setRecordLog;