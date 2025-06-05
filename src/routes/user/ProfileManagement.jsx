import { useEffect, useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { useSelector } from "react-redux";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  useUpdateUserMutation,
  useChangePasswordMutation,
  useFetchUsersQuery,
} from "../../services/api/usersApi";
import DashboardLayout from "../../layouts/DashboardLayout";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

const profileSchema = yup.object().shape({
  firstName: yup.string().required("First Name is required"),
  lastName: yup.string().required("Last Name is required"),
  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required"),
  contactNumber: yup
    .string()
    .matches(/^[0-9]+$/, "Must be only digits")
    .min(11, "Must be exactly 11 digits")
    .max(11, "Must be exactly 11 digits")
    .required("Contact number is required"),
});

const passwordSchema = yup.object().shape({
  currentPassword: yup.string().required("Current Password is required"),
  newPassword: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .required("New Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("newPassword")], "Passwords do not match")
    .required("Confirm Password is required"),
});

const ProfileManagement = () => {
  const user = useSelector((state) => state.auth.user);
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [changePassword, { isLoading: isChangingPassword, error: passwordError }] =
    useChangePasswordMutation();
  const {
    data: users,
    refetch,
    isLoading: isUsersLoading,
  } = useFetchUsersQuery();
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      contactNumber: user?.contactNumber || "",
    },
  });

  const {
    control: controlPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm({
    resolver: yupResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    if (profileSuccess) {
      setTimeout(() => setProfileSuccess(false), 3000);
    }
  }, [profileSuccess]);

  useEffect(() => {
    if (passwordSuccess) {
      setTimeout(() => setPasswordSuccess(false), 3000);
    }
  }, [passwordSuccess]);

  useEffect(() => {
    if (passwordError) {
      setAlert({
        type: "error",
        message: passwordError.data?.message || "Failed to change password",
      });
    }
  }, [passwordError]);

  const onSubmitProfile = async (data) => {
    try {
      await updateUser({ id: user.id, ...data }).unwrap();
      setProfileSuccess(true);
      refetch();
      reset(data);
    } catch (error) {
      setAlert({ type: "error", message: `Error: ${error.message}` });
    }
  };

  const onSubmitPassword = async (data) => {
    try {
      await changePassword({
        id: user.id,
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      }).unwrap();
      setPasswordSuccess(true);
      resetPassword();
      setAlert({ type: "", message: "" });
    } catch (error) {
      setAlert({
        type: "error",
        message: error.data?.message || "Failed to change password",
      });
    }
  };

  const handleClickShowCurrentPassword = () => {
    setShowCurrentPassword(!showCurrentPassword);
  };

  const handleClickShowNewPassword = () => {
    setShowNewPassword(!showNewPassword);
  };

  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  if (isUsersLoading) {
    return <CircularProgress />;
  }

  return (
    <DashboardLayout>
      <Typography variant="h4" gutterBottom>
        My Profile
      </Typography>

      {alert.message && (
        <Alert severity={alert.type} sx={{ mb: 3 }}>
          {alert.message}
        </Alert>
      )}

      {/* Profile Information Form */}
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmitProfile)}
        sx={{ mt: 2, maxWidth: 600 }}
      >
        <Typography variant="h6" gutterBottom>
          Update Profile Information
        </Typography>
        <Controller
          name="firstName"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="First Name"
              fullWidth
              margin="normal"
              error={!!errors.firstName}
              helperText={errors.firstName?.message}
              required
            />
          )}
        />
        <Controller
          name="lastName"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Last Name"
              fullWidth
              margin="normal"
              error={!!errors.lastName}
              helperText={errors.lastName?.message}
              required
            />
          )}
        />
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Email"
              type="email"
              fullWidth
              margin="normal"
              error={!!errors.email}
              helperText={errors.email?.message}
              required
            />
          )}
        />
        <Controller
          name="contactNumber"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Contact Number"
              fullWidth
              margin="normal"
              error={!!errors.contactNumber}
              helperText={errors.contactNumber?.message}
              required
            />
          )}
        />
        {profileSuccess && (
          <Alert severity="success" sx={{ mt: 2 }}>
            Profile updated successfully!
          </Alert>
        )}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          sx={{ mt: 3 }}
          disabled={isUpdating}
        >
          {isUpdating ? (
            <CircularProgress size="1.5rem" color="inherit" />
          ) : (
            "Update Profile"
          )}
        </Button>
      </Box>

      {/* Password Change Form */}
      <Box
        component="form"
        onSubmit={handleSubmitPassword(onSubmitPassword)}
        sx={{ mt: 4, maxWidth: 600 }}
      >
        <Typography variant="h6" gutterBottom>
          Change Password
        </Typography>
        <Controller
          name="currentPassword"
          control={controlPassword}
          render={({ field }) => (
            <TextField
              {...field}
              label="Current Password"
              type={showCurrentPassword ? "text" : "password"}
              fullWidth
              margin="normal"
              error={!!passwordErrors.currentPassword}
              helperText={passwordErrors.currentPassword?.message}
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowCurrentPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                    >
                      {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          )}
        />
        <Controller
          name="newPassword"
          control={controlPassword}
          render={({ field }) => (
            <TextField
              {...field}
              label="New Password"
              type={showNewPassword ? "text" : "password"}
              fullWidth
              margin="normal"
              error={!!passwordErrors.newPassword}
              helperText={passwordErrors.newPassword?.message}
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowNewPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                    >
                      {showNewPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          )}
        />
        <Controller
          name="confirmPassword"
          control={controlPassword}
          render={({ field }) => (
            <TextField
              {...field}
              label="Confirm New Password"
              type={showConfirmPassword ? "text" : "password"}
              fullWidth
              margin="normal"
              error={!!passwordErrors.confirmPassword}
              helperText={passwordErrors.confirmPassword?.message}
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowConfirmPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          )}
        />
        {passwordSuccess && (
          <Alert severity="success" sx={{ mt: 2 }}>
            Password changed successfully!
          </Alert>
        )}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          sx={{ mt: 3 }}
          disabled={isChangingPassword}
        >
          {isChangingPassword ? (
            <CircularProgress size="1.5rem" color="inherit" />
          ) : (
            "Change Password"
          )}
        </Button>
      </Box>
    </DashboardLayout>
  );
};

export default ProfileManagement;