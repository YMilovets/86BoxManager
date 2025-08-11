export default function getChromeVersion() {
  const listBrowsers = navigator.userAgent.split(" ");
  const chromeInfo =
    listBrowsers.find((browserInfo) => browserInfo.includes("Chrome")) ?? "";
  const [_, chromeVersion = ""] = [...chromeInfo.split("/")];

  const [majorChromeVersion] = [...chromeVersion.split('.')];

  if (majorChromeVersion) return +majorChromeVersion;
  return null;
}