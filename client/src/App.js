// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignUp from './components/SignUp';
import Login from './components/Login';
import ProfileSetup from './components/ProfileSetup';
import AuthProvider from './AuthProvider'; // Ensure this is wrapped around the components
import Consultation from './components/Consultation';
import WorkoutCalendar from './components/WorkoutCalendar';
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile-setup" element={<ProfileSetup />} />
          <Route path="/consultation" element={<Consultation />} />
          <Route path="/workout-calendar" element={<WorkoutCalendar />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
