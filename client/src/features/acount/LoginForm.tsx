import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router";
import { useAccount } from "../../lib/hooks/useAccount";
import { loginSchema, type LoginSchema } from "../../lib/Schemas/loginSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { LockOpen } from "@mui/icons-material";
import { Box, Button, Paper, Typography } from "@mui/material";
import TextInput from "../../app/shared/components/TextInput";

export default function LoginForm() {
  const { loginUser } = useAccount();
  const navigate = useNavigate();
  const location = useLocation() 
  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<LoginSchema>({
    mode: "onTouched",
    resolver: zodResolver(loginSchema),
  });

  // `mutate` rather than `mutateAsync`: a rejected mutateAsync escapes
  // handleSubmit as an unhandled rejection. The agent interceptor already
  // toasts the failure.
  const OnSubmit = async (data: LoginSchema) => {
    await loginUser.mutate(data, {
      onSuccess: () => {
        navigate(location.state?.from?.pathname || "/activities");
      }
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
        <Typography variant="h4">Sign in</Typography>
      </Box>
      <TextInput label="Email" control={control} name="email" />
      <TextInput label="Password" type="password" control={control} name="password" />
      <Button
        type="submit"
        disabled={!isValid || loginUser.isPending}
        variant="contained"
        size="large"
      >
        Log in
      </Button>
      <Typography variant="body2" color="text.secondary">
        Don't have an account? <Button onClick={() => navigate("/register")}>Register</Button>
      </Typography>
    </Paper>
  );
}
