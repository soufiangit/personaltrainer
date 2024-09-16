// src/components/SignUp.js
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { TextField, Button, Container, Typography, Box, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { PersonAdd } from '@mui/icons-material';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert('Please fill in both email and password.');
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp(
      { email, password },
      { redirectTo: 'http://localhost:3000/profile-setup' }
    );

    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
    } else {
      setEmailSent(true);
      alert('Please check your email to verify your account.');
    }
  };

  if (emailSent) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#f0f0f0',
        }}
      >
        <Container maxWidth="xs">
          <Box
            sx={{
              backgroundColor: '#fff',
              p: 4,
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              textAlign: 'center',
            }}
          >
            <Typography variant="h4" gutterBottom>
              Confirmation Email Sent
            </Typography>
            <Typography align="center">
              Please check your email to confirm your account. Once confirmed, click below to proceed.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 2 }}
              onClick={() => navigate('/login')}
            >
              Proceed to Login
            </Button>
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
      }}
    >
      <Container maxWidth="xs">
        <Box
          sx={{
            backgroundColor: '#fff',
            p: 4,
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            textAlign: 'center',
          }}
        >
          <PersonAdd sx={{ fontSize: 50, mb: 2, color: '#1976d2' }} />
          <Typography variant="h4" gutterBottom>
            Sign Up
          </Typography>
          <form onSubmit={handleSignUp}>
            <TextField
              label="Email"
              variant="outlined"
              fullWidth
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <TextField
              label="Password"
              type="password"
              variant="outlined"
              fullWidth
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button
              variant="contained"
              color="primary"
              fullWidth
              type="submit"
              disabled={loading}
              sx={{ mt: 2 }}
            >
              {loading ? 'Signing up...' : 'Sign Up'}
            </Button>
          </form>
          {errorMessage && (
            <Typography color="error" align="center" gutterBottom sx={{ mt: 2 }}>
              {errorMessage}
            </Typography>
          )}
          <Box mt={3}>
            <Link
              href="#"
              onClick={() => navigate('/login')}
              sx={{ textDecoration: 'none', fontWeight: 'bold' }}
            >
              Already have an account? Log In
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default SignUp;
