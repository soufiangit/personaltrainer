import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import OpenAI from 'openai';

// Load environment variables from .env
dotenv.config();

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

// Consultation Route with Enhanced Error Logging
app.post('/consultation', async (req, res) => {
  const { profile, conversationContext } = req.body;

  if (!profile) {
    return res.status(400).json({ error: 'User profile is required.' });
  }

  const messages = [
    { role: 'system', content: 'You are a fitness coach. Your job is to remember past conversations and ask follow-up questions based on user responses.' },
    { role: 'user', content: conversationContext },
  ];

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
    });

    const aiResponse = completion.choices[0].message.content;

    // Analyzing AI response before sending it back
    if (aiResponse.toLowerCase().includes("great to see")) {
      const refinedResponse = `I see you're comfortable with high-intensity workouts. Let's get into the details. How many days a week can you commit to?`;
      return res.json({ reply: refinedResponse });
    }

    res.json({ reply: aiResponse });
  } catch (error) {
    console.error('Error generating AI response:', error.message);
    res.status(500).json({ error: 'Failed to process consultation' });
  }
});


// Workout Plan Route with Enhanced Error Logging
app.post('/generate-workout-plan', async (req, res) => {
  const { profile, consultationResults } = req.body;

  if (!profile || !consultationResults) {
    return res.status(400).json({ error: 'Profile and consultation results are required' });
  }

  try {
    const messages = [
      { role: 'system', content: 'You are a personal trainer generating a workout plan based on the consultation.' },
      { role: 'user', content: `User profile: ${JSON.stringify(profile)}` },
      { role: 'user', content: `Consultation results: ${JSON.stringify(consultationResults)}` },
    ];

    console.log('Sending request to OpenAI for workout plan:', JSON.stringify(messages, null, 2));

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
    });

    if (completion && completion.choices && completion.choices.length > 0) {
      const workoutPlan = completion.choices[0].message.content;

      // Here you would normally store the generated workout plan in your database
      // For example:
      // const { error } = await supabase.from('workout_plans').insert([{ user_id: profile.id, plan: workoutPlan }]);

      res.json({ workoutPlan });
    } else {
      throw new Error('No valid workout plan found in the response');
    }
  } catch (error) {
    console.error('Error generating workout plan:', error.message);
    console.error('Stack trace:', error.stack); // Log full stack trace for debugging
    if (error.response) {
      console.error('API response data:', error.response.data); // Log OpenAI API response
    } else {
      console.error('No response data from OpenAI');
    }
    res.status(500).json({ error: 'Failed to generate workout plan' });
  }
});

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
