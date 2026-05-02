import { useContext } from "react";

import { ErrorType } from "../../../shared";

import { ThemeActionsContext, ThemeContext } from "./context";

export function useTheme() {
  const themeContext = useContext(ThemeContext);

  if (!themeContext) throw new Error(ErrorType.ContextIsOutOfProvider);

  return themeContext;
}

export function useThemeActions() {
  const themeContext = useContext(ThemeActionsContext);

  if (!themeContext) throw new Error(ErrorType.ContextIsOutOfProvider);

  return themeContext;
}
