import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

// Load environment variables from .env
dotenv.config();

// Initialize Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const app = express();

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60,
});
app.use(limiter);

// OpenAI API configuration
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'your_fallback_api_key_here',
});

// Consultation Route
app.post('/consultation', async (req, res) => {
  const { profile } = req.body;

  if (!profile) {
    return res.status(400).json({ error: 'User profile is required.' });
  }

  const messages = [
    { role: 'system', content: 'You are a fitness consultant analyzing user data to create a personalized workout plan and provide further consultation.' },
    {
      role: 'user',
      content: `
        Here is the user's profile:
        - Full Name: ${profile.fullName || 'Not provided'}
        - Age: ${profile.age || 'Not provided'}
        - Gender: ${profile.gender || 'Not provided'}
        - Weight: ${profile.weight || 'Not provided'} kg
        - Height: ${profile.height || 'Not provided'} cm
        - Body Fat Percentage: ${profile.bodyFat ? profile.bodyFat : 'Not provided'}
        - Fitness Goal: ${profile.goal || 'Not provided'}
        - Activity Level: ${profile.activityLevel || 'Not provided'}
        - Workout Days per Week: ${profile.workoutDays || 'Not provided'}
        - Preferred Workout Time: ${profile.preferredTime || 'Not provided'}
        - Diet Preference: ${profile.dietPreference || 'Not provided'}
        - Injuries: ${profile.injuries || 'None'}
        - Sports Experience: ${profile.sports ? 'Athlete' : 'Non-athlete'}
        
        Use this information to start a personalized consultation. Based on the user's activity level (${profile.activityLevel || 'Not provided'}) and fitness goal (${profile.goal || 'Not provided'}), ask relevant follow-up questions or provide advice to guide them toward their fitness goal.
      `,
    },
  ];

  try {
    console.log('Sending request to OpenAI:', messages);

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
    });

    console.log('OpenAI response:', completion);

    if (completion && completion.choices && completion.choices.length > 0) {
      const reply = completion.choices[0].message.content;
      res.json({ reply });
    } else {
      throw new Error('No valid message found in the response');
    }
  } catch (error) {
    console.error('Error during consultation:', error);

    if (error.response) {
      console.error('API response data:', error.response.data);
    } else {
      console.error('No response data');
    }

    res.status(500).json({ error: 'Failed to process consultation' });
  }
});

// Route to generate workout plan based on consultation
app.post('/generate-workout-plan', async (req, res) => {
  const { profile, consultationResults } = req.body;

  if (!profile || !consultationResults) {
    return res.status(400).json({ error: 'Profile and consultation results are required' });
  }

  try {
    const messages = [
      { role: 'system', content: 'You are a personal trainer generating a workout plan based on the consultation.' },
      { role: 'user', content: `User profile: ${JSON.stringify(profile)}` },
      { role: 'user', content: `Consultation results: ${consultationResults}` },
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
    });

    if (completion && completion.choices && completion.choices.length > 0) {
      const workoutPlan = completion.choices[0].message.content;

      // Insert workout plan into Supabase
      const { error } = await supabase
        .from('workout_plans')
        .insert([
          {
            user_id: profile.id,
            workout_date: new Date().toISOString().split('T')[0], // Set today's date for workout
            plan: workoutPlan,
            created_at: new Date().toISOString(),
          },
        ]);

      if (error) throw error;

      res.json({ workoutPlan });
    } else {
      throw new Error('No valid workout plan found in the response');
    }
  } catch (error) {
    console.error('Error generating workout plan:', error);
    res.status(500).json({ error: 'Failed to generate workout plan' });
  }
});

// Health check route
app.get('/health', (req, res) => {
  res.send('Server is healthy');
});

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
