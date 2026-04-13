const RELEASE_YEAR = 2025;
const TAB_KEY = "Tab";
const AUTHOR_NAME = "YMilovets";
const DEFAULT_FOLDER = ".86Box";

const WINDOWS_ERROR_CODE_NOT_FOUND = 1;
const WINDOWS_ERROR_CODE_SEGMENTATION = 0xC0000005;

const LINUX_ERROR_CODE_NOT_FOUND = 127;
const LINUX_ERROR_CODE_SEGMENTATION = 139;

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
  WINDOWS_ERROR_CODE_NOT_FOUND,
  WINDOWS_ERROR_CODE_SEGMENTATION,
  LINUX_ERROR_CODE_NOT_FOUND,
  LINUX_ERROR_CODE_SEGMENTATION
};