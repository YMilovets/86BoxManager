import PropTypes from "prop-types";

import Button from "../../Components/Button";
import { useDictionary } from "../../Providers/LanguageProvider";
import { getDictionary } from "../../Shared";

function AboutBtnContainer({ className }) {
  const { dictionary } = useDictionary();

  const getTransition = getDictionary(dictionary);

  const { electronAPI } = window;

  return (
    <Button
      onClick={() => electronAPI?.getVersion()}
      data-control
      className={className}
      title={getTransition("aboutBtn")}
    >
      {getTransition("aboutBtn")}
    </Button>
  );
}

AboutBtnContainer.propTypes = {
  className: PropTypes.string,
};

AboutBtnContainer.defaultProps = {
  className: undefined,
};

export default AboutBtnContainer