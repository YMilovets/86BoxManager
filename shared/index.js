const RELEASE_YEAR = 2025;
const TAB_KEY = "Tab";
const AUTHOR_NAME = "YMilovets";
const DEFAULT_FOLDER = ".86Box";

const ErrorType = {
  IsExistMachine: "0x000",
  MissingConfiguration: "0x001",
  NoExistMachineFolder: "0x002",
  NoExistSpecificFolderAndMachine: "0x003",
  NoExistSpecificFolder: "0x004",
  NoCompareConfiguration: "0x005",
  IsBlockProcess: "0x006",
  IncorrectDictionary: "0x007",
};

module.exports = {
  RELEASE_YEAR,
  TAB_KEY,
  AUTHOR_NAME,
  DEFAULT_FOLDER,
  ErrorType,
};