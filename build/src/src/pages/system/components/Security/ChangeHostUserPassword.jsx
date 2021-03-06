import React, { useState } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import * as a from "../../actions";
// Components
import Card from "components/Card";
import Input from "components/Input";
import Button from "components/Button";
import Switch from "components/Switch";
// Style
import "./changeHostUserPassword.scss";

function ChangeHostUserPassword({ passwordChange }) {
  const [input, setInput] = useState("");
  const [confirmInput, setConfirmInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const errors = [];
  if (input && input.length < 8)
    errors.push("Password must be at least 8 characters long");
  if (input.includes("'")) errors.push("Password MUST not include the quotes");
  if (!/^([\x20-\x7F])*$/.test(input))
    errors.push("Password must include only simple ASCII characters");

  const errorsConfirm = [];
  if (confirmInput && confirmInput !== input)
    errorsConfirm.push("Passwords do not match");

  const invalid =
    !input || !confirmInput || errors.length || errorsConfirm.length;

  const update = () => {
    if (!invalid) passwordChange(input);
  };

  return (
    <Card spacing>
      <div>
        Please change the host user password. The current password is the
        factory insecure default. Changing it to a strong password will protect
        your DAppNode from external attackers.
      </div>

      <div className="change-password-form">
        <span>New password</span>
        <div>
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="password..."
            value={input}
            onValueChange={setInput}
            onEnterPress={update}
            className={errors.length ? "is-invalid" : ""}
          />
          <div className="feedback-error">
            {errors.map((line, i) => (
              <span key={i}>
                {line}
                <br />
              </span>
            ))}
          </div>
        </div>

        <span>Confirm</span>
        <div>
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="password..."
            value={confirmInput}
            onValueChange={setConfirmInput}
            onEnterPress={update}
            className={errorsConfirm.length ? "is-invalid" : ""}
          />
          <div className="feedback-error">
            {errorsConfirm.map((line, i) => (
              <span key={i}>
                {line}
                <br />
              </span>
            ))}
          </div>
        </div>

        <span className="separator" />
        <div className="toggle">
          <Switch
            checked={showPassword}
            onToggle={() => setShowPassword(_show => !_show)}
            label={"Show my password"}
            id={"switch-password-visibility"}
          />
        </div>

        <span className="separator" />
        <div className="submit-buttons">
          <Button variant="dappnode" disabled={invalid} onClick={update}>
            Change
          </Button>
        </div>
      </div>
    </Card>
  );
}

ChangeHostUserPassword.propTypes = {
  passwordChange: PropTypes.func.isRequired
};

// Container

const mapStateToProps = null;

const mapDispatchToProps = {
  passwordChange: a.passwordChange
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ChangeHostUserPassword);
