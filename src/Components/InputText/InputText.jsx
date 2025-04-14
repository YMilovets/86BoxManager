import PropTypes from "prop-types";
import styles from "./InputText.module.css";
import clsx from "clsx";

function InputText({ name, id, onChange, className, type = "text", ...props }) {
  return (
    <input
      className={clsx(className, styles.input)}
      type={type}
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
    type: "text",
}

InputText.propTypes = {
    name: PropTypes.string,
    id: PropTypes.string,
    onChange: PropTypes.func,
    className: PropTypes.string,
    type: PropTypes.string,
}

export default InputText;
