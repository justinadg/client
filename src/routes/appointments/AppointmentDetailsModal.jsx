import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  Chip,
} from "@mui/material";
import dayjs from "dayjs";
import { useFetchServiceByIdQuery } from "../../services/api/servicesApi";

const AppointmentDetailsModal = ({ open, onClose, appointment }) => {
  const { data: service } = useFetchServiceByIdQuery(appointment?.serviceType);

  if (!appointment) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Appointment Details</DialogTitle>
      <DialogContent dividers>
        <Box mb={2}>
          <Typography variant="h6" gutterBottom>
            {appointment.firstName} {appointment.lastName}
          </Typography>
          <Chip
            label={appointment.status}
            color={
              appointment.status === "Completed" ? "success" :
              appointment.status === "Cancelled" ? "error" : "primary"
            }
            size="small"
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box mb={2}>
          <Typography variant="subtitle1" gutterBottom>
            Service Information
          </Typography>
          <Typography variant="body2">
            <strong>Service:</strong> {service?.title || "Loading..."}
          </Typography>
          <Typography variant="body2">
            <strong>Price:</strong> ₱{service?.price || "0"}
          </Typography>
        </Box>

        <Box mb={2}>
          <Typography variant="subtitle1" gutterBottom>
            Appointment Time
          </Typography>
          <Typography variant="body2">
            {dayjs(appointment.appointmentDateTime).format("MMMM D, YYYY h:mm A")}
          </Typography>
        </Box>

        <Box mb={2}>
          <Typography variant="subtitle1" gutterBottom>
            Contact Information
          </Typography>
          <Typography variant="body2">
            <strong>Email:</strong> {appointment.email}
          </Typography>
          <Typography variant="body2">
            <strong>Phone:</strong> {appointment.contactNumber}
          </Typography>
        </Box>

        {appointment.additionalNotes && (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Additional Notes
            </Typography>
            <Typography variant="body2">
              {appointment.additionalNotes}
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AppointmentDetailsModal;