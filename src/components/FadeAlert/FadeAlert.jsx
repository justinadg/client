import { useEffect, useState } from "react";
import { Alert, Fade } from "@mui/material";
import PropTypes from "prop-types";

const FadeAlert = ({ message, severity, duration, onClose }) => {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setOpen(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleExited = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <Fade in={open} timeout={600} onExited={handleExited}>
      <Alert severity={severity} sx={{ mb: 2 }}>
        {message}
      </Alert>
    </Fade>
  );
};

FadeAlert.propTypes = {
  message: PropTypes.string.isRequired,
  severity: PropTypes.oneOf(["error", "warning", "info", "success"]).isRequired,
  duration: PropTypes.number.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default FadeAlert;
