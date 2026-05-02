import { createContext } from "react";

import { Themes } from "../../Shared/Constants";

export const ThemeContext = createContext(Themes.Default);
export const ThemeActionsContext = createContext(() => {});