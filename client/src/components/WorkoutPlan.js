import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Typography, Card, CardContent, Button, CircularProgress } from '@mui/material';
import { CheckCircle } from '@mui/icons-material';

const WorkoutPlan = () => {
  const [workoutPlan, setWorkoutPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWorkoutPlan = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('http://localhost:5001/generate-workout-plan', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        if (data.workoutPlan) {
          setWorkoutPlan(data.workoutPlan);
          console.log('Workout plan generated:', data.workoutPlan);
        } else {
          throw new Error('Failed to generate workout plan');
        }
      } catch (err) {
        console.error('Error generating workout plan:', err);

        if (err.response && err.response.status === 401) {
          setError('Unauthorized: Invalid API key.');
          console.error('Error: Invalid API key');
        } else if (err.response && err.response.status === 403) {
          setError('Forbidden: API access is blocked.');
          console.error('Error: API access blocked');
        } else if (err.response && err.response.status === 404) {
          setError('Workout plan not found.');
          console.error('Error: Workout plan not found');
        } else if (err.code === 'ERR_NETWORK') {
          setError('Network error. Please check your connection.');
          console.error('Network error occurred:', err);
        } else {
          setError('An unexpected error occurred.');
          console.error('Unexpected error:', err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchWorkoutPlan();
  }, []);

  return (
    <Container maxWidth="md">
      <Typography variant="h4" align="center" gutterBottom>
        Your Workout Plan
      </Typography>
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Typography color="error" align="center">{error}</Typography>
      ) : workoutPlan ? (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              1-Week Workout Plan
            </Typography>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {workoutPlan.split('\n').map((line, index) => (
                <Typography key={index}>{line}</Typography>
              ))}
            </div>
            <Button variant="contained" color="primary" fullWidth startIcon={<CheckCircle />}>
              Mark as Complete
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Typography variant="body1" align="center">
          No workout plan available.
        </Typography>
      )}
    </Container>
  );
};

export default WorkoutPlan;
