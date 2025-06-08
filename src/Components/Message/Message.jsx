import PropTypes from "prop-types";

import styles from "./Message.module.css";

function Message({ children }) {
  return (
    <div className={styles.message} role="alert">
      {children}
    </div>
  );
}

Message.defautProps = {
  children: undefined,
};

Message.propTypes = {
  children: PropTypes.string,
};

export default Message;
