import { TextField, type TextFieldProps } from "@mui/material";
import {
  useController,
  type FieldValues,
  type UseControllerProps,
} from "react-hook-form";

type Props<T extends FieldValues> = UseControllerProps<T> & TextFieldProps;

export default function TextInput<T extends FieldValues>(props: Props<T>) {
  // Split the controller-only props off: they are not valid TextField props, so
  // spreading them reaches the DOM and React warns about unknown attributes.
  const { control, rules, defaultValue, shouldUnregister, ...textFieldProps } =
    props;
  const { field, fieldState } = useController({
    control,
    rules,
    defaultValue,
    shouldUnregister,
    name: props.name,
  } as UseControllerProps<T>);

  return (
    <TextField
      {...textFieldProps}
      {...field}
      value={field.value ?? ""}
      fullWidth
      variant="outlined"
      error={!!fieldState.error}
      helperText={fieldState.error?.message}
    />
  );
}
