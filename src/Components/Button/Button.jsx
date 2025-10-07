import clsx from "clsx";
import PropTypes from "prop-types";

import styles from "./Button.module.css";

function Button({ children, onClick, className, isPrimary, ...props }) {
  return (
    <button
      className={clsx(styles.button, className, {
        [styles.button__primary]: isPrimary,
      })}
      {...props}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

Button.defaultProps = {
  children: null,
  className: undefined,
  isPrimary: false,
  onClick: () => {},
};

Button.propTypes = {
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
  className: PropTypes.string,
  isPrimary: PropTypes.bool,
  onClick: PropTypes.func,
};

export default Button;
