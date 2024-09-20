import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Container, Typography, Modal, Box, Button, CircularProgress, Paper } from '@mui/material';
import './WorkoutCalendar.css';

const WorkoutCalendar = ({ generatedPlan }) => {
  const [date, setDate] = useState(new Date());
  const [workoutForDay, setWorkoutForDay] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWorkoutForDay = async (selectedDate) => {
    setLoading(true);
    setError(null); // Reset error before fetching
    const formattedDate = selectedDate.toISOString().split('T')[0]; // Format date as YYYY-MM-DD

    // Check if the generated plan has a workout for the selected date
    const muscleGroup = generatedPlan && generatedPlan[formattedDate] ? generatedPlan[formattedDate] : null;

    if (!muscleGroup) {
      setError(`No workout found for ${formattedDate}`);
      setLoading(false);
      return;
    }

    try {
      console.log(`Fetching workout for muscle group: ${muscleGroup}`);
      const options = {
        method: 'GET',
        url: 'https://work-out-api1.p.rapidapi.com/search',
        params: { Muscles: muscleGroup },
        headers: {
          'x-rapidapi-key': process.env.REACT_APP_EXERCISEDB_API_KEY,
          'x-rapidapi-host': 'work-out-api1.p.rapidapi.com',
        },
      };

      const response = await axios.request(options);
      if (response.status === 200) {
        setWorkoutForDay(response.data);
        console.log('Successfully fetched workout:', response.data);
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }
    } catch (err) {
      console.error('Error fetching workout:', err);
      setError('An error occurred while fetching the workout.');
    } finally {
      setLoading(false);
    }
  };

  const handleDayClick = (value) => {
    setDate(value);
    fetchWorkoutForDay(value);
    setOpenModal(true);
  };

  const handleClose = () => {
    setOpenModal(false);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Weekly Workout Plan
      </Typography>

      <Paper elevation={3} sx={{ padding: 3, margin: '0 auto', maxWidth: 600 }}>
        <Calendar
          onChange={handleDayClick}
          value={date}
          className="custom-calendar"
        />
      </Paper>

      <Modal open={openModal} onClose={handleClose} aria-labelledby="workout-modal-title" aria-describedby="workout-modal-description">
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 450,
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
          }}
        >
          {loading ? (
            <CircularProgress />
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : workoutForDay ? (
            <>
              <Typography id="workout-modal-title" variant="h6" component="h2" align="center" gutterBottom>
                Workout for {date.toDateString()}
              </Typography>
              <Typography id="workout-modal-description" sx={{ mt: 2, mb: 3 }}>
                {workoutForDay.details || 'No details available.'}
              </Typography>
              <Button variant="contained" color="primary" fullWidth onClick={() => console.log('Workout marked as complete')}>
                Mark as Complete
              </Button>
            </>
          ) : (
            <Typography>No workout scheduled for this day.</Typography>
          )}
        </Box>
      </Modal>
    </Container>
  );
};

export default WorkoutCalendar;
