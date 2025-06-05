import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useFetchAllAppointmentsQuery } from "../../services/api/appointmentsApi";
import {
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Container,
  Grid,
  FormControl,
  Fade,
  CircularProgress,
} from "@mui/material";
import dayjs from "dayjs";
import AppointmentCalendar from "../../components/AppointmentCalendar/AppointmentCalendar";
import DaySlider from "../../components/DaySlider";
import ServerAlert from "../../components/ServerAlert/ServerAlert";
import {
  SectionContainer,
  StyledButton,
} from "./BookAppointmentSection.styles";

export default function BookAppointmentSection() {
  const [selectedDay, setSelectedDay] = useState(dayjs());
  const [selectedSlot, setSelectedSlot] = useState(null);
  const navigate = useNavigate();

  const {
    data: allAppointments = { results: [] },
    isLoading: isLoadingAppointments,
    error: appointmentError,
  } = useFetchAllAppointmentsQuery({
    date: selectedDay.format("YYYY-MM-DD"),
    page: 1,
    limit: 1000,
  });

  const handleSlotSelect = (time) => {
    setSelectedSlot(time);
  };

  return (
    <SectionContainer id="booking-section">
      <Container maxWidth="lg">
        <Grid container spacing={2} justifyContent="center">
          <Grid item xs={12}>
            <Typography variant="h3" align="center" gutterBottom>
              Book an Appointment
            </Typography>
          </Grid>
        </Grid>

        <Fade in={true}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <DaySlider
                currentDay={selectedDay}
                setCurrentDay={setSelectedDay}
              />
            </Grid>
            <Grid item xs={12}>
              {isLoadingAppointments ? (
                <CircularProgress />
              ) : appointmentError ? (
                <ServerAlert keyword="appointments" />
              ) : (
                <AppointmentCalendar
                  appointments={allAppointments.results}
                  onSlotSelect={handleSlotSelect}
                  selectedDay={selectedDay}
                  initialSlot={
                    selectedSlot ? dayjs(selectedSlot).format("HH:mm") : null
                  }
                />
              )}
            </Grid>
            <Grid item xs={12}>
              <StyledButton
                variant="contained"
                color="primary"
                onClick={() =>
                  navigate("/appointments/create", {
                    state: { selectedSlot },
                  })
                }
                disabled={!selectedSlot}
              >
                Book Now
              </StyledButton>
            </Grid>
          </Grid>
        </Fade>
      </Container>
    </SectionContainer>
  );
}