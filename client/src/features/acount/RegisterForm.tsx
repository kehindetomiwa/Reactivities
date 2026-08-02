import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { useAccount } from "../../lib/hooks/useAccount";
import {
  registerSchema,
  type RegisterSchema,
} from "../../lib/Schemas/registerSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { LockOpen } from "@mui/icons-material";
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  List,
  ListItem,
  Paper,
  Typography,
} from "@mui/material";
import TextInput from "../../app/shared/components/TextInput";

export default function RegisterForm() {
  const { registerUser } = useAccount();
  const navigate = useNavigate();
  const [serverErrors, setServerErrors] = useState<string[]>([]);
  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<RegisterSchema>({
    mode: "onTouched",
    resolver: zodResolver(registerSchema),
  });

  const OnSubmit = (data: RegisterSchema) => {
    setServerErrors([]);
    registerUser.mutate(data, {
      onSuccess: () => navigate("/login"),
      // Identity rejects duplicate emails / weak passwords with a 400 whose
      // ModelState the agent interceptor throws as a flat string array. Nothing
      // toasts that case, so render it on the form.
      onError: (error) =>
        setServerErrors(
          Array.isArray(error) ? error : ["Registration failed"]
        ),
    });
  };

  return (
    <Paper
      component="form"
      onSubmit={handleSubmit(OnSubmit)}
      sx={{
        display: "flex",
        flexDirection: "column",
        p: 3,
        gap: 3,
        borderRadius: 3,
        mx: "auto",
        maxWidth: "md",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 3,
          color: "secondary.main",
        }}
      >
        <LockOpen fontSize="large" />
        <Typography variant="h4">Register</Typography>
      </Box>
      <TextInput label="Display name" control={control} name="displayName" />
      <TextInput label="Email" control={control} name="email" />
      <TextInput
        label="Password"
        type="password"
        control={control}
        name="password"
      />
      {serverErrors.length > 0 && (
        <Alert severity="error">
          <AlertTitle>Registration failed</AlertTitle>
          <List sx={{ listStyleType: "disc", pl: 3, py: 0 }}>
            {serverErrors.map((err) => (
              <ListItem key={err} sx={{ display: "list-item", px: 0, py: 0 }}>
                {err}
              </ListItem>
            ))}
          </List>
        </Alert>
      )}
      <Button
        type="submit"
        disabled={!isValid || registerUser.isPending}
        variant="contained"
        size="large"
      >
        Register
      </Button>
    </Paper>
  );
}
