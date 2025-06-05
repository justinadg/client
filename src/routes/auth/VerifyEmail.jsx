import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useVerifyEmailMutation } from '../../services/api/authApi';
import { Alert, Box, Button, Container, Typography, CircularProgress } from '@mui/material';
import { LockOutlined } from '@mui/icons-material';

export default function VerifyEmail() {
  const location = useLocation();
  const navigate = useNavigate();
  const [verifyEmail, { isLoading, isSuccess, error }] = useVerifyEmailMutation();
  const [token, setToken] = useState(null);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');
    setToken(token);

    if (token) {
      verifyEmail({ token })
        .unwrap()
        .then(() => {
          setAlert({
            type: 'success',
            message: 'Email verified successfully! You can now log in.',
          });
        })
        .catch((err) => {
          setAlert({
            type: 'error',
            message: err.data?.message || 'Failed to verify email. The link may have expired.',
          });
        });
    } else {
      setAlert({
        type: 'error',
        message: 'No verification token found in the URL.',
      });
    }
  }, [location.search, verifyEmail]);

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <LockOutlined sx={{ fontSize: 50, mb: 2 }} />
        <Typography component="h1" variant="h5">
          Email Verification
        </Typography>
        
        {isLoading && (
          <Box sx={{ mt: 3 }}>
            <CircularProgress />
            <Typography>Verifying your email...</Typography>
          </Box>
        )}

        {alert && (
          <Alert severity={alert.type} sx={{ mt: 3, width: '100%' }}>
            {alert.message}
          </Alert>
        )}

        {(isSuccess || error) && (
          <Button
            variant="contained"
            sx={{ mt: 3 }}
            onClick={() => navigate('/login')}
          >
            Go to Login
          </Button>
        )}
      </Box>
    </Container>
  );
}