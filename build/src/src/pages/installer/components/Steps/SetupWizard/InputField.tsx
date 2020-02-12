import React from "react";
import { SetupWizardField } from "types";
import Input from "components/Input";
import InputFieldSelect from "./InputFieldSelect";
import InputFieldFile from "./InputFieldFile";
import SelectMountpoint from "./SelectMountpoint";

export default function InputField({
  field,
  value,
  onValueChange
}: {
  field: SetupWizardField;
  value: string;
  onValueChange: (newValue: string) => void;
}) {
  if (
    !field.target ||
    field.target.type === "environment" ||
    field.target.type === "portMapping"
  ) {
    if (field.enum)
      return (
        <InputFieldSelect
          value={value}
          options={field.enum}
          onValueChange={onValueChange}
        />
      );
    else
      return (
        <Input
          value={value}
          onValueChange={onValueChange}
          type={field.secret ? "password" : "text"}
        />
      );
  } else if (field.target.type === "fileUpload") {
    return (
      <InputFieldFile accept={""} value={value} onValueChange={onValueChange} />
    );
  } else if (
    field.target.type === "namedVolumeMountpoint" ||
    field.target.type === "allNamedVolumesMountpoint"
  ) {
    return (
      <SelectMountpoint
        value={value}
        onValueChange={onValueChange}
      ></SelectMountpoint>
    );
  } else {
    return <div>Unknown target type</div>;
  }
}
