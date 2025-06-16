import { ErrorType } from "../shared/index.js";

export default function compareSavedConfiguration({
  localConfiguration,
  configuration,
}) {
  const { pathConfig } = localConfiguration;
  const { pathConfig: currentPathConfig } = configuration;
  if (pathConfig !== currentPathConfig) {
    throw new Error(ErrorType.NoCompareConfiguration);
  }
}
