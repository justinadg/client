import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { useFetchAppointmentsByUserQuery } from "../services/api/appointmentsApi";
import {
  useFetchReviewsQuery,
  useCreateReviewMutation,
  useUpdateReviewMutation,
} from "../services/api/reviewsApi";
import { useFetchServiceByIdQuery, useFetchServicesQuery } from "../services/api/servicesApi";
import {
  Box,
  TextField,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
  Typography,
  CircularProgress,
  Alert,
  AlertTitle,
} from "@mui/material";
import Rating from "@mui/material/Rating";
import dayjs from "dayjs";

const ReviewForm = ({ reviewToEdit }) => {
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedAppointment } = location.state || {};

  const [selectedAppointmentId, setSelectedAppointmentId] = useState(
    reviewToEdit?.appointmentId || selectedAppointment || ""
  );
  const [appointmentData, setAppointmentData] = useState(null);
  const [alert, setAlert] = useState({ type: "", message: "" });

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      rating: reviewToEdit?.rating || 0,
      title: reviewToEdit?.title || "",
      text: reviewToEdit?.text || "",
    },
  });

  const { data: reviewsData = { results: [] } } = useFetchReviewsQuery();
  const { 
    data: completedAppointments = { results: [] }, 
    isLoading: isLoadingAppointments 
  } = useFetchAppointmentsByUserQuery({ 
    userId: user?.id, 
    status: "Completed",
    page: 1,
    limit: 1000
  });

  const [createReview, { isLoading: isCreating }] = useCreateReviewMutation();
  const [updateReview, { isLoading: isUpdating }] = useUpdateReviewMutation();

  const reviews = reviewsData.results || [];
  const appointments = completedAppointments.results || [];

  // Filter out already reviewed appointments
  const reviewedAppointmentIds = reviews.map(review => 
    review.appointmentId?.id || review.appointmentId
  );
  const availableAppointments = appointments.filter(appointment => 
    !reviewedAppointmentIds.includes(appointment.id)
  );

  const { data: allServices = { results: [] } } = useFetchServicesQuery();

  useEffect(() => {
    if (reviewToEdit) {
      const appointmentId = reviewToEdit.appointmentId?.id || reviewToEdit.appointmentId;
      const selectedAppt = appointments.find(a => a.id === appointmentId);
      
      if (selectedAppt) {
        setAppointmentData(selectedAppt);
        setSelectedAppointmentId(appointmentId);
        setValue("rating", reviewToEdit.rating);
        setValue("title", reviewToEdit.title);
        setValue("text", reviewToEdit.text);
      }
    } else if (selectedAppointmentId) {
      const selectedAppt = appointments.find(a => a.id === selectedAppointmentId);
      setAppointmentData(selectedAppt);
    }
  }, [reviewToEdit, selectedAppointmentId, appointments, setValue]);

  const { data: serviceData } = useFetchServiceByIdQuery(
    appointmentData?.serviceType,
    { skip: !appointmentData?.serviceType }
  );

  const onSubmit = async (data) => {
  if (!appointmentData) {
    setAlert({
      type: "error",
      message: "Please select a valid appointment.",
    });
    return;
  }

  try {
    const reviewData = {
      rating: data.rating,
      title: data.title,
      text: data.text
    };

    if (reviewToEdit) {
      await updateReview({
        id: reviewToEdit.id,
        ...reviewData
      }).unwrap();
      navigate("/appointments", {
        state: { alert: { type: "success", message: "Review updated successfully!" } },
      });
    } else {
      const newReviewData = {
        ...reviewData,
        userId: user.id,
        name: `${user.firstName} ${user.lastName}`,
        serviceType: appointmentData.serviceType,
        appointmentId: selectedAppointmentId,
        appointmentDateTime: appointmentData.appointmentDateTime,
        date: new Date().toISOString(),
      };
      await createReview(newReviewData).unwrap();
      navigate("/appointments", {
        state: { alert: { type: "success", message: "Review created successfully!" } },
      });
    }
  } catch (error) {
    setAlert({ 
      type: "error", 
      message: error.data?.message || "Failed to submit review" 
    });
  }
};

  if (isLoadingAppointments) return <CircularProgress disableShrink />;

  if (!reviewToEdit && availableAppointments.length === 0) {
    return (
      <Alert severity="info">
        <AlertTitle>No Appointments Available for Review</AlertTitle>
        You don't have any completed appointments that haven't been reviewed yet.
      </Alert>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 3 }}>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12}>
          <Typography variant="h6">
            {reviewToEdit ? "Edit Review" : "Write a Review"}
          </Typography>
        </Grid>
        
        {alert.message && (
          <Grid item xs={12}>
            <Alert severity={alert.type}>
              <AlertTitle>{alert.type === "success" ? "Success" : "Error"}</AlertTitle>
              {alert.message}
            </Alert>
          </Grid>
        )}

        {!reviewToEdit && availableAppointments.length > 0 && (
          <Grid item xs={12}>
            <FormControl fullWidth required>
              <InputLabel>Select Appointment</InputLabel>
              <Select
                value={selectedAppointmentId}
                onChange={(e) => setSelectedAppointmentId(e.target.value)}
                label="Select Appointment"
              >
                {availableAppointments.map((appointment) => {
                  const service = allServices.results.find(s => s.id === appointment.serviceType);
                  return (
                    <MenuItem key={appointment.id} value={appointment.id}>
                      {dayjs(appointment.appointmentDateTime).format("DD/MM/YYYY HH:mm")} - 
                      {service?.title || "Service"}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          </Grid>
        )}

        {appointmentData && (
          <>
            <Grid item xs={12}>
              <TextField
                label="Service"
                value={serviceData?.title || "Loading..."}
                fullWidth
                disabled
              />
            </Grid>
            
            <Grid item xs={12}>
              <Controller
                name="rating"
                control={control}
                rules={{ required: "Rating is required" }}
                render={({ field }) => (
                  <Box>
                    <Typography component="legend">Rating</Typography>
                    <Rating
                      {...field}
                      value={Number(field.value)}
                      onChange={(_, value) => field.onChange(value)}
                      precision={1}
                    />
                    {errors.rating && (
                      <Typography color="error">{errors.rating.message}</Typography>
                    )}
                  </Box>
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="title"
                control={control}
                rules={{ required: "Title is required" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Title"
                    fullWidth
                    error={!!errors.title}
                    helperText={errors.title?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="text"
                control={control}
                rules={{ required: "Review text is required" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Your Review"
                    fullWidth
                    multiline
                    rows={4}
                    error={!!errors.text}
                    helperText={errors.text?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" gap={2}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={isCreating || isUpdating}
                >
                  {reviewToEdit ? "Update Review" : "Submit Review"}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate("/reviews")}
                >
                  Cancel
                </Button>
              </Box>
            </Grid>
          </>
        )}
      </Grid>
    </Box>
  );
};

export default ReviewForm;