const { ErrorType } = require("../shared/index.js");

function compareSavedConfiguration({
  localConfiguration,
  configuration,
}) {
  const { pathConfig } = localConfiguration;
  const { pathConfig: currentPathConfig } = configuration;
  if (pathConfig !== currentPathConfig) {
    throw new Error(ErrorType.NoCompareConfiguration);
  }
}

module.exports = compareSavedConfiguration;