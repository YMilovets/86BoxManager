import clsx from "clsx";
import PropTypes from "prop-types";
import { forwardRef, useContext, useEffect, useRef, useState } from "react";

import { DictionaryContext } from "../../Components/App/context";
import Select from "../../Components/Select";

import { ErrorType } from "../../../shared";

import styles from "./LanguageContainer.module.css";

function LanguageContainer({ className }, ref) {
  const { language } = useContext(DictionaryContext);
  const [languageList, setLanguageList] = useState([]);
  const isActiveRef = useRef(false);

  const { electronAPI } = window;

  async function handleSelectClick(languageId, isSetList = true) {
    const languageAPIList = await electronAPI.getLanguageList();

    if (isSetList) {
      setLanguageList(languageAPIList);
    }

    const { language: currentLanguage } = {
      ...languageAPIList.find(
        ({ languageId: currentId }) => currentId === languageId
      ),
    };

    if (ref && ref.current && currentLanguage) {
      // Добавлена задержка отображения выбранного языка
      setTimeout(() => {
          ref.current.querySelector("selectedcontent").textContent =
            currentLanguage;
      }, 100);
    }

    return languageAPIList;
  }

  async function handleSelectChange(e, isSelected = false) {
    try {
      return await electronAPI?.changeLanguage({
        language: e.target.value,
        isSelected,
      });
    } catch {
      throw new Error(ErrorType.IncorrectDictionary);
    }
  }

  function handleSelectLanguage(isSelected = false) {
    return async (e) => {
      e.stopPropagation();
      isActiveRef.current = false;
      try {
        await handleSelectChange(e, isSelected);
        electronAPI?.setConfigLanguage();
        // Отключить обновление списка при скрытии селектора и выборе опции
        await handleSelectClick(e.target.value, false);
      } catch (error) {
        await handleSelectClick(language, false);
      }
    };
  }

  function handleClick() {
    return async (e) => {
      e.stopPropagation();

      if (e.target.dataset.action !== "select") return;

      isActiveRef.current = !isActiveRef.current;

      try {
        await handleSelectChange(e);
        electronAPI?.setConfigLanguage();
        await handleSelectClick(language);
      } catch (error) {
        await handleSelectClick(language);
      }
    };
  }

  useEffect(() => {
    handleSelectClick(language, true);
  }, []);

  useEffect(() => {
    const handleInnerClick = () => {
      isActiveRef.current = false;
      handleSelectClick(language, false);
    };
    
    document.addEventListener('click', handleInnerClick);

    return () => {
      document.removeEventListener('click', handleInnerClick);
    }
  }, [language])

  return (
    <div className={styles.language}>
      <Select
        className={clsx(className, styles.select)}
        ref={ref}
        data-action="select"
        onClick={handleClick()}
        onKeyDown={() => handleSelectClick(language)}
        selectedId={language}
        list={languageList.map(({ language, languageId }) => ({
          id: languageId,
          value: language,
          onMouseDown: handleSelectLanguage(true),
          className: styles.option,
        }))}
      />
    </div>
  );
}

LanguageContainer.propTypes = {
  className: PropTypes.string,
};

LanguageContainer.defaultProps = {
  className: undefined,
};

const LanguageRefContainer = forwardRef(LanguageContainer);

export default LanguageRefContainer;
