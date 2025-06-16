import { platform } from "os";

export default function getOSPlatform() {
  return platform();
}
