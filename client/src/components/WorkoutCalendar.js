import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Container, Typography, Modal, Box, Button, CircularProgress } from '@mui/material';
import { supabase } from '../supabaseClient';
import YouTube from 'react-youtube';

const WorkoutCalendar = () => {
  const [date, setDate] = useState(new Date());
  const [workoutForDay, setWorkoutForDay] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchWorkoutForDay = async (selectedDate) => {
    setLoading(true);
    const formattedDate = selectedDate.toISOString().split('T')[0]; // Format date as YYYY-MM-DD
    const { data, error } = await supabase
      .from('workout_plans')
      .select('*')
      .eq('workout_date', formattedDate);

    if (error) {
      console.error('Error fetching workout:', error);
      setWorkoutForDay(null);
    } else {
      setWorkoutForDay(data[0]); // Assuming only one workout per day
    }
    setLoading(false);
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
    <Container maxWidth="md">
      <Typography variant="h4" align="center" gutterBottom>
        Weekly Workout Plan
      </Typography>

      <Calendar
        onChange={handleDayClick}
        value={date}
        tileContent={({ date, view }) => view === 'month' ? <div>{/* You can add markers if a workout exists */}</div> : null }
      />

      <Modal open={openModal} onClose={handleClose} aria-labelledby="workout-modal-title" aria-describedby="workout-modal-description">
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', boxShadow: 24, p: 4 }}>
          {loading ? (
            <CircularProgress />
          ) : workoutForDay ? (
            <>
              <Typography id="workout-modal-title" variant="h6" component="h2">
                Workout for {date.toDateString()}
              </Typography>
              <Typography id="workout-modal-description" sx={{ mt: 2 }}>
                {workoutForDay.plan_details ? workoutForDay.plan_details : 'No details available.'}
              </Typography>
              {workoutForDay.youtube_id && <YouTube videoId={workoutForDay.youtube_id} />}
              <Button variant="contained" color="primary" onClick={() => console.log('Workout marked as complete')} sx={{ mt: 2 }}>
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
