import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useRegisterUserMutation } from "../../services/api/authApi";
import { useLazyFetchUserByIdQuery } from "../../services/api/usersApi";
import useRedirectByRole from "../../utils/redirectByRole";
import { useNavigate } from "react-router-dom";
import {
  Avatar,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  Grid,
  Box,
  Typography,
  Container,
  Alert,
  AlertTitle,
  CircularProgress,
  InputAdornment,
  IconButton,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Copyright from "../../components/Copyright/Copyright";
import { StyledAuthLink } from "./SignIn.styles";

const schema = yup.object().shape({
  firstName: yup.string().required("First name is required"),
  lastName: yup.string().required("Last name is required"),
  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required"),
  password: yup.string().required("Password is required"),
  confirmPassword: yup
    .string()
    .required("Confirm password is required")
    .oneOf([yup.ref("password")], "Passwords do not match"),
  contactNumber: yup
    .string()
    .trim()
    .matches(
      /^0\d{10}$/,
      "Enter a valid phone number starting with 0 and containing 11 digits"
    )
    .required("Contact number is required"),
  isAdmin: yup.boolean(),
});

export default function SignUp() {
  const [registerUser, { isLoading }] = useRegisterUserMutation();
  const redirectByRole = useRedirectByRole();
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const [fetchUserById, { data: updatedUser }] = useLazyFetchUserByIdQuery();

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (formData) => {
    const role = formData.isAdmin ? "admin" : "user";
    const { isAdmin, confirmPassword, ...userData } = formData;

    try {
      const result = await registerUser({ ...userData, role }).unwrap();

      if (result) {
        const { tokens, user } = result;
        localStorage.setItem("token", tokens.access.token);
        localStorage.setItem("refreshToken", tokens.refresh.token);
        localStorage.setItem("user", JSON.stringify(user));
        fetchUserById(user.id);
      }
    } catch (error) {
      setAlert({
        type: "error",
        message: `Registration failed: ${error.data?.message || error.message}`,
      });
    }
  };

  useEffect(() => {
    if (updatedUser) {
      setAlert({ 
        type: "success", 
        message: "Verification link has been sent! Check your spam",
      });
      setTimeout(() => {
        navigate("/login");
      }, 2500);
    }
  }, [updatedUser, navigate]);

  const password = watch("password");

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign up
        </Typography>
        <Box
          component="form"
          noValidate
          onSubmit={handleSubmit(onSubmit)}
          sx={{ mt: 3 }}
        >
          {alert.message && (
            <Alert severity={alert.type} sx={{ mb: 3 }}>
              <AlertTitle>
                {alert.type === "success" ? "Success" : "Error"}
              </AlertTitle>
              {alert.message}
            </Alert>
          )}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Controller
                name="firstName"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="First Name"
                    fullWidth
                    autoComplete="given-name"
                    error={!!errors.firstName}
                    helperText={errors.firstName?.message}
                    required
                    autoFocus
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="lastName"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Last Name"
                    fullWidth
                    autoComplete="family-name"
                    error={!!errors.lastName}
                    helperText={errors.lastName?.message}
                    required
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="email"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Email Address"
                    fullWidth
                    autoComplete="email"
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    required
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="contactNumber"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Contact Number"
                    fullWidth
                    error={!!errors.contactNumber}
                    helperText={errors.contactNumber?.message}
                    required
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="password"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    fullWidth
                    autoComplete="new-password"
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    required
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleClickShowPassword}
                            onMouseDown={handleMouseDownPassword}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="caption" display="block" gutterBottom>
                Should be alphanumeric and minimum of 8 characters
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="confirmPassword"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Confirm Password"
                    type={showConfirmPassword ? "text" : "password"}
                    fullWidth
                    required
                    onChange={(e) => {
                      field.onChange(e);
                      setConfirmPasswordTouched(true);
                    }}
                    error={
                      (confirmPasswordTouched && field.value !== password) ||
                      !!errors.confirmPassword
                    }
                    helperText={
                      confirmPasswordTouched && field.value !== password
                        ? "Passwords do not match"
                        : "" || errors.confirmPassword?.message
                    }
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle confirm password visibility"
                            onClick={handleClickShowConfirmPassword}
                            onMouseDown={handleMouseDownPassword}
                            edge="end"
                          >
                            {showConfirmPassword ? (
                              <VisibilityOff />
                            ) : (
                              <Visibility />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </Grid>
           
          </Grid>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={
              isLoading ||
              (confirmPasswordTouched && watch("confirmPassword") !== password)
            }
          >
            {isLoading ? (
              <CircularProgress size="1.5rem" color="inherit" />
            ) : (
              "Sign Up"
            )}
          </Button>
          <StyledAuthLink to="/login">
            Already have an account? Sign in
          </StyledAuthLink>
        </Box>
      </Box>
      <Copyright sx={{ mt: 5 }} />
    </Container>
  );
}