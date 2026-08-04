import {
  useController,
  type FieldValues,
  type UseControllerProps,
} from "react-hook-form";
import { DateTimePicker, type DateTimePickerProps } from "@mui/x-date-pickers";

type Props<T extends FieldValues> = UseControllerProps<T> & DateTimePickerProps;

export default function DateTimeInput<T extends FieldValues>(props: Props<T>) {
  // Same as TextInput: keep the react-hook-form-only props off the picker.
  const {
    control,
    rules,
    defaultValue,
    shouldUnregister,
    name,
    ...pickerProps
  } = props;
  const { field, fieldState } = useController({
    control,
    rules,
    defaultValue,
    shouldUnregister,
    name,
  } as UseControllerProps<T>);

  return (
    <DateTimePicker
    {...pickerProps}
    value={field.value ? new Date(field.value): null}
    onChange={value => {field.onChange(value)}}
    sx={{width: '100%'}}
    slotProps={{
        textField: {
            onBlur: field.onBlur,
            error: !!fieldState.error,
            helperText: fieldState.error?.message
        }
    }}
    />
  );
}
