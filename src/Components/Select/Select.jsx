import { forwardRef } from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import Button from '../Button';
import { Chevron } from "../Icon";

import styles from "./Select.module.css";

function Select(
  { className, list, selectedId, onChange, onClick, onBlur, onKeyDown, ...props },
  ref
) {
  return (
    <select
      onChange={onChange}
      onClick={onClick}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      className={clsx(styles.select, className)}
      value={selectedId}
      ref={ref}
      {...props}
    >
      <Button className={styles.select_content} type="button">
        <selectedcontent />
        <Chevron className={styles.select_chevron} />
      </Button>
      <optgroup className={styles.select_options}>
        {list.map(
          ({
            value,
            id,
            onClick: onClickItem = () => {},
            onBlur: onBlurItem = () => {},
            onMouseDown: onMouseDown = () => {},
            className,
          }) => (
            <option
              selected={id === selectedId}
              key={id}
              value={id}
              data-value={value}
              className={clsx(styles.option, className)}
              onClick={onClickItem}
              onBlur={onBlurItem}
              onMouseDown={onMouseDown}
            >
              {value}
            </option>
          )
        )}
      </optgroup>
    </select>
  );
}

Select.propTypes = {
  list: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      value: PropTypes.string,
      onClick: PropTypes.func,
      onBlur: PropTypes.func,
      onMouseDown: PropTypes.func,
      className: PropTypes.string,
    })
  ),
  className: PropTypes.string,
  selectedId: PropTypes.string,
  onChange: PropTypes.func,
  onClick: PropTypes.func,
  onBlur: PropTypes.func,
  onKeyDown: PropTypes.func,
};

Select.defaultProps = {
  list: [],
  className: PropTypes.string,
  selectedId: undefined,
  onChange: () => {},
  onClick: () => {},
  onBlur: () => {},
  onKeyDown: () => {},
};

const SelectContainer = forwardRef(Select);

export default SelectContainer;
