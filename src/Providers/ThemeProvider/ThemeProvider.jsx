import { useCallback, useLayoutEffect, useRef, useState } from "react";
import PropTypes from "prop-types";

import { PlatformList, Themes } from "../../Shared/Constants";

import { ThemeList } from "./constants";
import { ThemeActionsContext, ThemeContext } from "./context";

function ThemeProvider({ children }) {
  const themeLocalStorage = localStorage.getItem("theme");
  const [mode, setMode] = useState(() => themeLocalStorage ?? Themes.Default);
  const isStarted = useRef(true);

  const { electronAPI } = window;

  const changeTheme = (currentTheme) => {
    localStorage.setItem("theme", currentTheme);

    ThemeList.forEach((themeItem) => {
      document.documentElement.classList.toggle(
        themeItem,
        currentTheme === themeItem,
      );
    });
  };

  const handleTheme = useCallback(() => {
    setMode((themeState) => {
      const currentIndex = ThemeList.indexOf(themeState);
      const currentTheme =
        currentIndex < ThemeList.length - 1
          ? ThemeList[currentIndex + 1]
          : ThemeList[0];

      changeTheme(currentTheme);
      return currentTheme;
    });
  }, []);

  const getSystemDarkStatus = async () => {
    const isDarkTheme = await electronAPI?.getSystemDarkStatus();
    document.documentElement.classList.toggle("default_dark", isDarkTheme);
  };

  const handleChangeTheme = async () => {
    const platform = await electronAPI?.getOSPlatform();

    if (isStarted.current && platform === PlatformList.Linux) {
      isStarted.current = false;
      return;
    }

    getSystemDarkStatus();
  };

  useLayoutEffect(() => {
    const theme = localStorage.getItem("theme") ?? Themes.Default;
    document.documentElement.classList.add(theme);

    getSystemDarkStatus();

    electronAPI?.onChangeTheme(handleChangeTheme);
  }, []);

  return (
    <ThemeContext.Provider value={mode}>
      <ThemeActionsContext.Provider value={handleTheme}>
        {children}
      </ThemeActionsContext.Provider>
    </ThemeContext.Provider>
  );
}

ThemeProvider.propTypes = {
  children: PropTypes.element,
};

ThemeProvider.defaultProps = {
  children: null,
};

export default ThemeProvider;
