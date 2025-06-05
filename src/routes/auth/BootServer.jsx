import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  CircularProgress,
  Typography,
  Box,
  Alert,
  Button,
  Container,
} from "@mui/material";
import { Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

export default function BootServer() {
  const navigate = useNavigate();
  const [error, setError] = useState(false);

  useEffect(() => {
    const bootServer = async () => {
      try {
        await axios.get(`${API_URL}/health`);
        navigate("/");
      } catch (error) {
        console.error("Failed to boot the server:", error);
        setError(true);
      }
    };

    bootServer();
  }, [navigate]);

  return (
    <Container maxWidth="lg">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        height="100vh"
      >
        {error ? (
          <Alert severity="warning">
            Failed to boot the server. Please try again later or contact
            support.
            <Box sx={{ mt: 1 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
              <Link to="/contact" style={{ textDecoration: "none" }}>
                <Button variant="outlined" color="primary" sx={{ ml: 2 }}>
                  Contact Support
                </Button>
              </Link>
            </Box>
          </Alert>
        ) : (
          <>
            <CircularProgress />
            <Typography textAlign="center" variant="h4" sx={{ mt: 2 }}>
              Waking up the server may take up to a minute. Please wait...
            </Typography>
          </>
        )}
      </Box>
    </Container>
  );
}
