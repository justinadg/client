// client/src/forms/StaffForm.jsx
import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  Box,
  TextField,
  Button,
  Grid,
  Typography,
  Alert,
  AlertTitle,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  useUpdateUserMutation,
  useFetchUsersQuery,
} from "../services/api/usersApi";

const schema = yup.object().shape({
  title: yup.string().required("Title is required"),
  image: yup
    .string()
    .url("Invalid image URL")
    .required("Image URL is required"),
});

export default function StaffForm({ staffToEdit }) {
  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      selectedUserId: staffToEdit?.id || "",
      firstName: staffToEdit?.firstName || "",
      lastName: staffToEdit?.lastName || "",
      title: staffToEdit?.title || "",
      email: staffToEdit?.email || "",
      image: staffToEdit?.image || "",
    },
  });

  const navigate = useNavigate();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const {
    data: usersData,
    isLoading: isLoadingUsers,
    refetch,
  } = useFetchUsersQuery();
  const [alert, setAlert] = useState({ type: "", message: "" });

  const selectedUserId = watch("selectedUserId");
  const [showFields, setShowFields] = useState(!!staffToEdit);

  useEffect(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    if (staffToEdit) {
      setShowFields(true);
    } else if (selectedUserId && usersData?.results) {
      const selectedUser = usersData.results.find(
        (user) => user.id === selectedUserId
      );
      if (selectedUser) {
        setValue("firstName", selectedUser.firstName);
        setValue("lastName", selectedUser.lastName);
        setValue("email", selectedUser.email);
        setShowFields(true);
      } else {
        setShowFields(false);
      }
    }
  }, [selectedUserId, usersData, setValue, staffToEdit]);

  const onSubmit = async (data) => {
    try {
      const userData = {
        ...data,
        role: "staff",
      };

      await updateUser({ id: selectedUserId, ...userData }).unwrap();

      const message = staffToEdit
        ? "Staff updated successfully!"
        : "Staff assigned successfully!";
      navigate("/manage-staffs", {
        state: {
          alert: { severity: "success", message },
        },
      });
    } catch (error) {
      setAlert({ type: "error", message: `Error: ${error.message}` });
    }
  };

  const eligibleUsers =
    usersData?.results?.filter((user) =>
      staffToEdit
        ? user.id === staffToEdit.id || user.role === "user"
        : user.role === "user"
    ) || [];

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 3 }}>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12}>
          <Typography variant="h6">
            {staffToEdit ? "Edit Staff" : "Assign Staff"}
          </Typography>
        </Grid>
        {alert.message && (
          <Grid item xs={12}>
            <Alert severity={alert.type}>
              <AlertTitle>
                {alert.type === "success" ? "Success" : "Error"}
              </AlertTitle>
              {alert.message}
            </Alert>
          </Grid>
        )}
        {!isLoadingUsers && eligibleUsers.length === 0 && !staffToEdit ? (
          <Grid item xs={12}>
            <Alert severity="warning">
              <AlertTitle>No Available Users</AlertTitle>
              There are no users available to assign as a staff.
            </Alert>
            <Box mt={2}>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => navigate("/manage-staffs")}
              >
                Cancel
              </Button>
            </Box>
          </Grid>
        ) : (
          <>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Select User by Email</InputLabel>
                <Controller
                  name="selectedUserId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="Select User by Email"
                      disabled={isLoadingUsers || !!staffToEdit}
                      value={field.value}
                    >
                      {eligibleUsers.map((user) => (
                        <MenuItem key={user.id} value={user.id}>
                          {user.email}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
              </FormControl>
            </Grid>

            {showFields && (
              <>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="firstName"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="First Name"
                        disabled
                        fullWidth
                        InputProps={{ readOnly: true }}
                        required
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="lastName"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Last Name"
                        disabled
                        fullWidth
                        InputProps={{ readOnly: true }}
                        required
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Controller
                    name="title"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Title"
                        fullWidth
                        error={!!errors.title}
                        helperText={errors.title?.message}
                        required
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Controller
                    name="image"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Image URL"
                        fullWidth
                        error={!!errors.image}
                        helperText={errors.image?.message}
                        required
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box display="flex" gap={2}>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={isUpdating}
                    >
                      {staffToEdit ? "Update Staff" : "Assign Staff"}
                    </Button>
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={() => navigate("/manage-staffs")}
                    >
                      Cancel
                    </Button>
                  </Box>
                </Grid>
              </>
            )}
          </>
        )}
      </Grid>
    </Box>
  );
}

StaffForm.propTypes = {
  staffToEdit: PropTypes.object,
};