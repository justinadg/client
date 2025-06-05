import { useState, useEffect } from "react";
import { Grid, Typography, Button } from "@mui/material";
import dayjs from "dayjs";
import StyledSlot from "./AppointmentCalendar.styles";
import PropTypes from "prop-types";

AppointmentCalendar.propTypes = {
  appointments: PropTypes.array.isRequired,
  onSlotSelect: PropTypes.func.isRequired,
  selectedDay: PropTypes.object.isRequired,
  initialSlot: PropTypes.string,
  readOnly: PropTypes.bool,
  serviceCategory: PropTypes.string,
};

const slots = [];
// Generate time slots from 7:00 to 18:30 in 30-minute increments
for (let hour = 7; hour <= 18; hour++) {
  for (let minute = 0; minute <= 30; minute += 30) {
    slots.push(
      `${hour.toString().padStart(2, "0")}:${minute
        .toString()
        .padStart(2, "0")}`
    );
  }
}

const isSlotBooked = (time, appointments, selectedDay, serviceCategory) => {
  return appointments.some(
    (appt) =>
      dayjs(appt.appointmentDateTime).isSame(
        dayjs(selectedDay).hour(time.split(":")[0]).minute(time.split(":")[1]),
        "minute"
      ) &&
      appt.status !== "Cancelled" &&
      appt.serviceCategory === serviceCategory
  );
};

const isSlotInPast = (time, selectedDay) => {
  const slotDateTime = dayjs(selectedDay)
    .hour(time.split(":")[0])
    .minute(time.split(":")[1]);
  return slotDateTime.isBefore(dayjs());
};


export default function AppointmentCalendar({
  appointments,
  onSlotSelect,
  selectedDay,
  initialSlot,
  readOnly = false,
  serviceCategory, // Destructure serviceCategory
}) {
  const [selectedSlot, setSelectedSlot] = useState(initialSlot || null);

  useEffect(() => {
    if (initialSlot) {
      const initialSlotDay = dayjs(selectedDay).isSame(dayjs(), "day");
      if (initialSlotDay) {
        setSelectedSlot(initialSlot);
      } else {
        setSelectedSlot(null);
      }
    } else {
      setSelectedSlot(null);
    }
  }, [selectedDay, initialSlot]);

  useEffect(() => {
    if (initialSlot) {
      setSelectedSlot(initialSlot);
    }
  }, [initialSlot]);

  const handleSlotClick = (time) => {
    if (
      !readOnly &&
      !isSlotBooked(time, appointments, selectedDay, serviceCategory) &&
      !isSlotInPast(time, selectedDay)
    ) {
      setSelectedSlot(time);
      onSlotSelect(
        dayjs(selectedDay)
          .hour(time.split(":")[0])
          .minute(time.split(":")[1])
          .toISOString()
      );
    }
  };

  const getSlotStatus = (time) => {
    if (isSlotBooked(time, appointments, selectedDay, serviceCategory)) {
      return "Booked";
    }
    if (isSlotInPast(time, selectedDay)) {
      return "Past Slot";
    }
    return "Open Slot";
  };

  return (
    <Grid container spacing={2} mb={2}>
      {slots.map((time) => (
        <Grid item xs={12} sm={6} lg={3} key={time}>
          <StyledSlot
            elevation={3}
            isBooked={isSlotBooked(time, appointments, selectedDay, serviceCategory)}
            isSelected={selectedSlot === time}
          >
            <Button
              fullWidth
              variant="text"
              onClick={() => handleSlotClick(time)}
              disabled={
                readOnly ||
                isSlotBooked(time, appointments, selectedDay, serviceCategory) ||
                isSlotInPast(time, selectedDay)
              }
            >
              <Typography mr={1} variant="h6">
                {time}
              </Typography>
              <Typography variant="body2">{getSlotStatus(time)}</Typography>
            </Button>
          </StyledSlot>
        </Grid>
      ))}
    </Grid>
  );
}