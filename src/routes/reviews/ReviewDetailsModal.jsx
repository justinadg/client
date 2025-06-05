import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  Rating,
} from "@mui/material";
import dayjs from "dayjs";
import { useFetchServiceByIdQuery } from "../../services/api/servicesApi";
import { useFetchAppointmentByIdQuery } from "../../services/api/appointmentsApi";

const ReviewDetailsModal = ({ open, onClose, review }) => {
  const { data: service } = useFetchServiceByIdQuery(review?.serviceType);
  const { data: appointment } = useFetchAppointmentByIdQuery(review?.appointmentId);

  if (!review) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Review Details</DialogTitle>
      <DialogContent dividers>
        <Box mb={2}>
          <Typography variant="h6" gutterBottom>
            {review.name}
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            Reviewed on {dayjs(review.date).format("MMMM D, YYYY")}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box mb={2}>
          <Typography variant="subtitle1" gutterBottom>
            Service Information
          </Typography>
          <Typography variant="body2">
            <strong>Service:</strong> {service?.title || "Loading..."}
          </Typography>
          {appointment && (
            <Typography variant="body2">
              <strong>Appointment Date:</strong> {dayjs(appointment.appointmentDateTime).format("MMMM D, YYYY h:mm A")}
            </Typography>
          )}
        </Box>

        <Box mb={2}>
          <Typography variant="subtitle1" gutterBottom>
            Rating
          </Typography>
          <Rating value={review.rating} precision={0.5} readOnly />
        </Box>

        <Box mb={2}>
          <Typography variant="subtitle1" gutterBottom>
            Review Title
          </Typography>
          <Typography variant="body1" gutterBottom>
            {review.title}
          </Typography>
        </Box>

        <Box mb={2}>
          <Typography variant="subtitle1" gutterBottom>
            Review Content
          </Typography>
          <Typography variant="body1">
            {review.text}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReviewDetailsModal;