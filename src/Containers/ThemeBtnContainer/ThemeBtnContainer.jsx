import Button from "../../Components/Button";
import { DarkLight, Moon, Sun } from "../../Components/Icon";
import { useDictionary } from "../../Providers/LanguageProvider";
import { getDictionary } from "../../Shared";
import { Themes } from "../../Shared/Constants";

import styles from "./ThemeBtnContainer.module.css";

function ThemeBtnContainer() {
  const { dictionary } = useDictionary();
  const getTransition = getDictionary(dictionary);

  const theme = Themes.Default;
  const handleClick = () => {};

  const ThemeTranslation = {
    [Themes.Default]: {
      title: getTransition("default"),
      component: <DarkLight className={styles.icon} />,
    },
    [Themes.Dark]: {
      title: getTransition("dark"),
      component: <Moon className={styles.icon} />,
    },
    [Themes.Light]: {
      title: getTransition("light"),
      component: <Sun className={styles.icon} />,
    },
  };

  return (
    <Button className={styles.root} onClick={handleClick}>
      <span className={styles.label}>{ThemeTranslation[theme].title}</span>
      {ThemeTranslation[theme].component}
    </Button>
  );
}

export default ThemeBtnContainer;
