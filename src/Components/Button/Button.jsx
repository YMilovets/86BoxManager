import PropTypes from "prop-types";
import styles from "./Button.module.css";
import clsx from "clsx";

function Button({ children, onClick, className, ...props }) {
  return (
    <button
      className={clsx(styles.button, className)}
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
  onClick: () => {},
};

Button.propTypes = {
  children: PropTypes.element,
  className: PropTypes.string,
  onClick: PropTypes.func,
};

export default Button;
