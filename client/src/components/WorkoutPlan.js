import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Container, Typography, Card, CardContent, Button, CircularProgress } from '@mui/material';
import { CheckCircle, AccessTime } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const WorkoutPlan = () => {
  const [workoutPlan, setWorkoutPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWorkoutPlan = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userData.user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
        try {
          setLoading(true);
          const response = await fetch('http://localhost:5001/generate-workout-plan', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ profile: profileData }),
          });
          const data = await response.json();
          setWorkoutPlan(data.workoutPlan);
        } catch (error) {
          console.error('Error fetching workout plan:', error);
        } finally {
          setLoading(false);
        }
      } else {
        navigate('/profile-setup');
      }
    };

    fetchWorkoutPlan();
  }, [navigate]);

  const handleCompleteWorkout = async (workoutId) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5001/complete-workout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: profile.id, workoutId }),
      });
      const data = await response.json();
      alert('Workout completed! Follow-up: ' + data.followUp);
    } catch (error) {
      console.error('Error completing workout:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" align="center" gutterBottom>
        Your Workout Plan
      </Typography>
      {loading ? (
        <CircularProgress />
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
            <Button
              variant="contained"
              color="primary"
              fullWidth
              startIcon={<CheckCircle />}
              onClick={() => handleCompleteWorkout(1)}
            >
              Mark as Complete
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              fullWidth
              startIcon={<AccessTime />}
              onClick={() => navigate('/consultation')}
              sx={{ mt: 2 }}
            >
              Consult Further
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
