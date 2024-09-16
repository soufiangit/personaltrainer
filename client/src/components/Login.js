// src/components/Login.js
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { TextField, Button, Container, Typography, Box, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { LockOpen } from '@mui/icons-material';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
    } else {
      navigate('/profile-setup');
    }
  };

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
          <LockOpen sx={{ fontSize: 50, mb: 2, color: '#1976d2' }} />
          <Typography variant="h4" gutterBottom>
            Log In
          </Typography>
          <form onSubmit={handleLogin}>
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
              {loading ? 'Logging in...' : 'Log In'}
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
              onClick={() => navigate('/signup')}
              sx={{ textDecoration: 'none', fontWeight: 'bold' }}
            >
              Don't have an account? Sign Up
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Login;
