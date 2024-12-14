import PropTypes from "prop-types";
import styles from "./InputText.module.css";
import clsx from "clsx";

function InputText({ name, id, onChange, className, ...props }) {
  return (
    <input
      className={clsx(className, styles.input)}
      type="text"
      name={name}
      id={id}
      onChange={onChange}
      {...props}
    />
  );
}

InputText.defaultProps = {
    name: undefined,
    id: undefined,
    onChange: () => {},
    className: undefined,
}

InputText.propTypes = {
    name: PropTypes.string,
    id: PropTypes.string,
    onChange: PropTypes.func,
    className: PropTypes.string,
}

export default InputText;
