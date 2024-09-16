// src/components/ProfileSetup.js
import React, { useState, useContext } from 'react';
import { supabase } from '../supabaseClient';
import { AuthContext } from '../AuthProvider';
import {
  TextField,
  Button,
  Container,
  Typography,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Stepper,
  Step,
  StepLabel,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Fade,
  Box,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Person, FitnessCenter, Sports, AccessibilityNew } from '@mui/icons-material';

const steps = [
  'Personal Information',
  'Body Composition',
  'Fitness Goals & Experience',
  'Physical Condition & Sports',
];

const ProfileSetup = () => {
  const { session } = useContext(AuthContext);
  const [activeStep, setActiveStep] = useState(0);
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [goal, setGoal] = useState('');
  const [activityLevel, setActivityLevel] = useState('');
  const [workoutDays, setWorkoutDays] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [dietPreference, setDietPreference] = useState('');
  const [injuries, setInjuries] = useState('');
  const [sports, setSports] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  // Proceed to the next step only if validation passes
  const handleNext = () => {
    if (validateForm()) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  // Go back to the previous step
  const handleBack = () => setActiveStep((prevActiveStep) => prevActiveStep - 1);

  // Handle final form submission
  const handleSubmit = async () => {
    if (validateForm()) {
      setLoading(true);
  
      const { data: userData } = await supabase.auth.getUser();
  
      if (!userData.user) {
        alert('User not found!');
        setLoading(false);
        return;
      }
  
      const { error } = await supabase.from('profiles').upsert({
        id: userData.user.id,
        full_name: fullName,
        age: parseInt(age),
        gender,
        weight: parseFloat(weight),
        height: parseFloat(height),
        body_fat_percentage: bodyFat ? parseFloat(bodyFat) : null,
        goal,
        activity_level: activityLevel,
        workout_days: workoutDays,
        preferred_time: preferredTime,
        diet_preference: dietPreference,
        injuries,
        sports,
      });
  
      setLoading(false);
  
      if (error) {
        alert(error.message);
      } else {
        alert('Profile updated successfully!');
        navigate('/consultation'); // Redirect to consultation page
      }
    }
  };
  

  // Validation function for each field
  const validateForm = () => {
    let formErrors = {};

    if (activeStep === 0) {
      if (!fullName.trim()) {
        formErrors.fullName = 'Full Name is required';
      }
      if (!age || age < 1 || age > 120) {
        formErrors.age = 'Please enter a valid age between 1 and 120';
      }
      if (!gender) {
        formErrors.gender = 'Gender is required';
      }
    }

    if (activeStep === 1) {
      if (!weight || weight <= 0 || weight > 300) {
        formErrors.weight = 'Please enter a valid weight between 1 and 300 kg';
      }
      if (!height || height <= 0 || height > 250) {
        formErrors.height = 'Please enter a valid height between 1 and 250 cm';
      }
      if (bodyFat && (bodyFat < 0 || bodyFat > 100)) {
        formErrors.bodyFat = 'Body fat percentage must be between 0 and 100';
      }
    }

    if (activeStep === 2) {
      if (!goal) {
        formErrors.goal = 'Fitness goal is required';
      }
      if (!activityLevel) {
        formErrors.activityLevel = 'Activity level is required';
      }
      if (!workoutDays || workoutDays <= 0 || workoutDays > 7) {
        formErrors.workoutDays = 'Please enter a valid number of workout days (1-7)';
      }
      if (!preferredTime) {
        formErrors.preferredTime = 'Preferred workout time is required';
      }
    }

    setErrors(formErrors);
    return Object.keys(formErrors).length === 0; // Only move to the next step if there are no validation errors
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Fade in>
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <Person /> Personal Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      label="Full Name"
                      variant="outlined"
                      fullWidth
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      error={!!errors.fullName}
                      helperText={errors.fullName}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Age"
                      variant="outlined"
                      fullWidth
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      error={!!errors.age}
                      helperText={errors.age}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <FormControl fullWidth error={!!errors.gender}>
                      <InputLabel>Gender</InputLabel>
                      <Select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        label="Gender"
                      >
                        <MenuItem value="Male">Male</MenuItem>
                        <MenuItem value="Female">Female</MenuItem>
                        <MenuItem value="Other">Other</MenuItem>
                      </Select>
                      {errors.gender && (
                        <Typography color="error" variant="caption">
                          {errors.gender}
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Fade>
        );
      case 1:
        return (
          <Fade in>
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <FitnessCenter /> Body Composition
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      label="Weight (kg)"
                      variant="outlined"
                      fullWidth
                      type="number"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      error={!!errors.weight}
                      helperText={errors.weight}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Height (cm)"
                      variant="outlined"
                      fullWidth
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      error={!!errors.height}
                      helperText={errors.height}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Body Fat Percentage (optional)"
                      variant="outlined"
                      fullWidth
                      type="number"
                      value={bodyFat}
                      onChange={(e) => setBodyFat(e.target.value)}
                      error={!!errors.bodyFat}
                      helperText={errors.bodyFat}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Fade>
        );
      // Fitness Goals & Experience step
      case 2:
        return (
            <Fade in>
                <Card sx={{ mt: 3 }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            <AccessibilityNew /> Fitness Goals & Experience
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <FormControl fullWidth error={!!errors.goal}>
                                    <InputLabel>Fitness Goal</InputLabel>
                                    <Select
                                        value={goal}
                                        onChange={(e) => setGoal(e.target.value)}
                                        label="Fitness Goal"
                                    >
                                        <MenuItem value="Lose Weight">Lose Weight</MenuItem>
                                        <MenuItem value="Build Muscle">Build Muscle</MenuItem>
                                        <MenuItem value="Improve Endurance">Improve Endurance</MenuItem>
                                    </Select>
                                    {errors.goal && (
                                        <Typography color="error" variant="caption">
                                            {errors.goal}
                                        </Typography>
                                    )}
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <FormControl fullWidth error={!!errors.activityLevel}>
                                    <InputLabel>Activity Level</InputLabel>
                                    <Select
                                        value={activityLevel}
                                        onChange={(e) => setActivityLevel(e.target.value)}
                                        label="Activity Level"
                                    >
                                        <MenuItem value="Sedentary">Sedentary</MenuItem>
                                        <MenuItem value="Lightly Active">Lightly Active</MenuItem>
                                        <MenuItem value="Moderately Active">Moderately Active</MenuItem>
                                        <MenuItem value="Very Active">Very Active</MenuItem>
                                    </Select>
                                    {errors.activityLevel && (
                                        <Typography color="error" variant="caption">
                                            {errors.activityLevel}
                                        </Typography>
                                    )}
                                </FormControl>
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    label="Workout Days per Week"
                                    variant="outlined"
                                    fullWidth
                                    type="number"
                                    value={workoutDays}
                                    onChange={(e) => setWorkoutDays(e.target.value)}
                                    error={!!errors.workoutDays}
                                    helperText={errors.workoutDays}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <FormControl fullWidth error={!!errors.preferredTime}>
                                    <InputLabel>Preferred Workout Time</InputLabel>
                                    <Select
                                      value={preferredTime}
                                      onChange={(e) => setPreferredTime(e.target.value)}
                                      label="Preferred Workout Time"
                                    >
                                      <MenuItem value="Morning">Morning</MenuItem>
                                      <MenuItem value="Afternoon">Afternoon</MenuItem>
                                      <MenuItem value="Evening">Evening</MenuItem>
                                    </Select>
                                    {errors.preferredTime && (
                                      <Typography color="error" variant="caption">
                                        {errors.preferredTime}
                                      </Typography>
                                    )}
                                </FormControl>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            </Fade>
        );
        case 3:
  return (
    <Fade in>
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <Sports /> Physical Condition & Sports
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Injuries (if any)"
                variant="outlined"
                fullWidth
                value={injuries}
                onChange={(e) => setInjuries(e.target.value)}
                error={!!errors.injuries}
                helperText={errors.injuries}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth error={!!errors.sports}>
                <InputLabel>Athlete</InputLabel>
                <Select
                  value={sports}
                  onChange={(e) => setSports(e.target.value)}
                  label="Athlete"
                >
                  <MenuItem value="Yes">Yes</MenuItem>
                  <MenuItem value="No">No</MenuItem>
                </Select>
                {errors.sports && (
                  <Typography color="error" variant="caption">
                    {errors.sports}
                  </Typography>
                )}
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Fade>
  );

      default:
        return 'Unknown step';
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
      }}
    >
      <Container maxWidth="md">
        <Typography variant="h4" align="center" gutterBottom>
          Complete Your Profile
        </Typography>

        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ mt: 2 }}>
          <LinearProgress variant="determinate" value={(activeStep / steps.length) * 100} />
        </Box>

        {renderStepContent(activeStep)}

        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
          <Button disabled={activeStep === 0} onClick={handleBack}>
            Back
          </Button>
          {activeStep === steps.length - 1 ? (
            <Button variant="contained" color="primary" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Saving...' : 'Save Profile'}
            </Button>
          ) : (
            <Button variant="contained" color="primary" onClick={handleNext}>
              Next
            </Button>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default ProfileSetup;
