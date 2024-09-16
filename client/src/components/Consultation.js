import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Container, Typography, TextField, Button, Card, CardContent, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Consultation = () => {
  const [consultationMessages, setConsultationMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userData.user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
        handleAIResponse(`Hi ${profileData.full_name}, I see your goal is to ${profileData.goal}. Let's begin your fitness consultation.`);
      } else {
        navigate('/profile-setup');
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleUserInput = async () => {
    if (!userInput.trim()) return;

    const updatedMessages = [...consultationMessages, { role: 'user', content: userInput }];
    setConsultationMessages(updatedMessages);
    setUserInput('');

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5001/consultation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ profile, messages: updatedMessages }),
      });

      const data = await response.json();
      setConsultationMessages([...updatedMessages, { role: 'assistant', content: data.reply }]);
    } catch (error) {
      console.error('Error during consultation:', error);
    }

    setLoading(false);
  };

  const handleAIResponse = (message) => {
    const updatedMessages = [...consultationMessages, { role: 'assistant', content: message }];
    setConsultationMessages(updatedMessages);
  };

  const finishConsultation = async () => {
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5001/generate-workout-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ profile, consultationResults: consultationMessages }),
      });

      const data = await response.json();
      if (data.workoutPlan) {
        handleAIResponse('Your workout plan has been generated. You can now view it in your calendar.');
        navigate('/workout-calendar'); // Redirect to the calendar
      } else {
        handleAIResponse('An error occurred while generating the workout plan.');
      }
    } catch (error) {
      console.error('Error during workout plan generation:', error);
      handleAIResponse('An error occurred while generating the workout plan.');
    }

    setLoading(false);
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" align="center" gutterBottom>
        Consultation
      </Typography>
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Consultation Chat
          </Typography>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {consultationMessages.map((message, index) => (
              <Typography key={index} variant={message.role === 'user' ? 'body1' : 'body2'} align={message.role === 'user' ? 'right' : 'left'}>
                <strong>{message.role === 'user' ? 'You' : 'AI'}: </strong> {message.content}
              </Typography>
            ))}
          </div>
          <TextField
            fullWidth
            label="Your message"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            margin="normal"
            onKeyPress={(e) => {
              if (e.key === 'Enter') handleUserInput();
            }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleUserInput}
            fullWidth
            disabled={loading || !userInput.trim()}
          >
            {loading ? <CircularProgress size={24} /> : 'Send'}
          </Button>

          <Button
            variant="outlined"
            color="secondary"
            onClick={finishConsultation}
            fullWidth
            sx={{ mt: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Finish Consultation and Generate Workout Plan'}
          </Button>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Consultation;
