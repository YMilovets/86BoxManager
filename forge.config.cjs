const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');
const fs = require("fs");
const { platform } = require('os');
const path = require("path");

const iconList = {
  linux: "linux/256.png",
  win32: "win/favicon.ico",
};
const typeOS = platform();

module.exports = {
  packagerConfig: {
    asar: {
      unpack: "**/i18n/**",
    },
    icon: path.join(
      __dirname,
      "assets/icon",
      iconList[typeOS] ?? iconList.win32
    ),
  },
  rebuildConfig: {},
  makers: [
    {
      name: "@electron-forge/maker-squirrel",
      config: {},
    },
    {
      name: "@electron-forge/maker-zip",
      platforms: ["darwin"],
    },
    {
      name: "@electron-forge/maker-deb",
      config: {},
    },
    {
      name: "@electron-forge/maker-rpm",
      config: {},
    },
  ],
  plugins: [
    {
      name: "@electron-forge/plugin-auto-unpack-natives",
      config: {},
    },
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
  hooks: {
    postPackage: async (_, { outputPaths: [currentPath] }) => {
      const localesPath = path.join(currentPath, "locales");

      const usedLocales = ["en-US.pak", "ru.pak"];

      if (!fs.existsSync(localesPath)) return;

      fs.readdirSync(localesPath).forEach((file) => {
        if (!usedLocales.includes(file)) {
          fs.unlinkSync(path.join(localesPath, file));
        }
      });
    },
  },
};
