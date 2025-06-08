import { useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";
import InputText from "../InputText";
import Button from "../Button";

import styles from "./InputBrowserFolder.module.css";

function InputBrowserFolder({
  label,
  id,
  onChange,
  type,
  value,
  onClick,
  onInputClick,
  btnGroup,
}) {
  const { label: btnLabel } = btnGroup;

  const [inputValue, setInputValue] = useState(value);

  const handleChange = useCallback(
    (e) => {
      setInputValue(e.currentTarget.value);
      onChange(e);
    },
    [onChange]
  );

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  return (
    <div className={styles.unit}>
      <label htmlFor={id}>{label}</label>
      <div className={styles.group}>
        <InputText
          type={type}
          name={id}
          id={id}
          onChange={handleChange}
          value={inputValue}
          onClick={onInputClick}
          className={styles.input}
        />
        {!!btnGroup && (
          <Button onClick={onClick} title={btnLabel} type="button">
            {btnLabel}
          </Button>
        )}
      </div>
    </div>
  );
}

InputBrowserFolder.propTypes = {
  label: PropTypes.string,
  id: PropTypes.string,
  onChange: PropTypes.func,
  name: PropTypes.string,
  className: PropTypes.string,
  type: PropTypes.string,
  value: PropTypes.string,
  onClick: PropTypes.func,
  onInputClick: PropTypes.func,
  btnGroup: PropTypes.shape({
    label: PropTypes.string,
  }),
}

InputBrowserFolder.defaultProps = {
  label: undefined,
  id: undefined,
  onChange: () => {},
  name: undefined,
  className: undefined,
  type: 'text',
  value: undefined,
  onClick: () => {},
  onInputClick: () => {},
  btnGroup: {
    label: undefined,
  },
}

export default InputBrowserFolder;
