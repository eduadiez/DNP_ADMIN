import React, { useState, useEffect, useCallback } from "react";
import { mapValues, memoize } from "lodash";
import deepmerge from "deepmerge";
// Components
import Card from "components/Card";
import Alert from "react-bootstrap/Alert";
import { UserSettingsAllDnps, SetupWizardAllDnps } from "types";
import { shortNameCapitalized } from "utils/format";
import OldEditor from "./OldEditor";
import {
  formDataToUserSettings,
  userSettingsToFormData,
  setupWizardToSetupTarget,
  filterByActiveSetupWizardFields
} from "pages/installer/parsers/formDataParser";
import Button from "components/Button";
import InputField from "./InputField";
import { parseSetupWizardErrors } from "pages/installer/parsers/formDataErrors";
import "./setupWizard.scss";
import { SetupWizardFormDataReturn } from "pages/installer/types";

function NewEditor({
  setupWizard,
  formData,
  onNewFormData
}: {
  setupWizard: SetupWizardAllDnps;
  formData: SetupWizardFormDataReturn;
  onNewFormData: (newFormData: SetupWizardFormDataReturn) => void;
}) {
  return (
    <>
      <div className="dnps-section">
        {Object.entries(setupWizard).map(([dnpName, fields]) => (
          <div className="dnp-section" key={dnpName}>
            <div className="dnp-name">{shortNameCapitalized(dnpName)}</div>
            {fields.map(field => (
              <div key={field.id} className="field">
                <div className="title">{field.title}</div>
                <div className="description">{field.description}</div>
                <InputField
                  field={field}
                  value={
                    (formData[dnpName] ? formData[dnpName][field.id] : "") || ""
                  }
                  onValueChange={newValue =>
                    onNewFormData({ [dnpName]: { [field.id]: newValue } })
                  }
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}

function SetupWizard({
  setupWizard,
  userSettings: initialUserSettings,
  wizardAvailable,
  onSubmit,
  goBack
}: {
  setupWizard: SetupWizardAllDnps;
  userSettings: UserSettingsAllDnps;
  wizardAvailable: boolean;
  onSubmit: (newUserSettings: UserSettingsAllDnps) => void;
  goBack: () => void;
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [userSettings, setUserSettings] = useState(initialUserSettings);

  useEffect(() => {
    setUserSettings(initialUserSettings);
  }, [initialUserSettings]);

  // New editor data
  const setupTarget = setupWizardToSetupTarget(setupWizard);
  const formData = userSettingsToFormData(userSettings, setupTarget);
  const setupWizardOnlyActive = filterByActiveSetupWizardFields(
    setupWizard,
    formData
  );
  const dataErrors = parseSetupWizardErrors(setupWizardOnlyActive, formData);
  const visibleDataErrors = dataErrors.filter(
    error => submitting || error.type !== "empty"
  );

  /**
   * Merge instead of setting a new value to:
   * - Preserve the info about all available fields, NewEditor may ignore fields
   * - Allows to memo this function, which improves performance for expensive
   *   components (SelectMountpoint)
   *   NOTE: Didn't fix the problem, but the slow down is not that bad
   * @param newUserSettings Will be partial newUserSettings
   */
  function onNewUserSettings(newUserSettings: UserSettingsAllDnps) {
    setSubmitting(false);
    setUserSettings(prevUserSettings =>
      deepmerge(prevUserSettings, newUserSettings)
    );
  }

  /**
   * Convert the Editor's formData object to a userSettings given a setupTarget
   */
  function onNewFormData(newFormData: SetupWizardFormDataReturn) {
    const newUserSettings = formDataToUserSettings(newFormData, setupTarget);
    onNewUserSettings(newUserSettings);
  }

  /**
   * On submit show the "empty" type errors if any by switching to `submitting` mode
   * Otherwise, submit the current userSettings
   */
  function handleSubmit() {
    if (dataErrors.length) setSubmitting(true);
    else onSubmit(userSettings);
  }

  return (
    <Card spacing noscroll className="setup-wizard">
      {showAdvanced || !wizardAvailable ? (
        <OldEditor userSettings={userSettings} onChange={onNewUserSettings} />
      ) : (
        <NewEditor
          formData={formData}
          setupWizard={setupWizardOnlyActive}
          onNewFormData={onNewFormData}
        />
      )}

      {visibleDataErrors.length > 0 && (
        <Alert variant="danger">
          {visibleDataErrors.map(({ dnpName, id, title, type, message }) => (
            <div key={dnpName + id + type}>
              {shortNameCapitalized(dnpName)} - {title} - {message}
            </div>
          ))}
        </Alert>
      )}

      <div className="bottom-buttons">
        <div>
          <Button onClick={goBack}>Cancel</Button>
          <Button onClick={handleSubmit} variant="dappnode">
            Submit
          </Button>
        </div>
        <div className="subtle-header" onClick={() => setShowAdvanced(x => !x)}>
          {showAdvanced ? "Hide" : "Show"} advanced editor
        </div>
      </div>
    </Card>
  );
}

export default SetupWizard;