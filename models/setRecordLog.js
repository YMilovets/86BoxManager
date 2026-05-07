import log from "electron-log/main.js";

import { ErrorType } from "../shared/index.js";

export default function setRecordLog(_, { message, status = "info" }) {
  if (!log["functions"][status]) {
    throw ErrorType.NoExistFunction;
  }
  log[status](message);
}
