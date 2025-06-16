import { existsSync } from "fs";

export default async function getExistFolder(_, checkedFolder) {
  return existsSync(checkedFolder);
}
