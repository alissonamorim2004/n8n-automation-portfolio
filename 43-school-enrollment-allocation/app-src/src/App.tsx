import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ChatBot from './components/ChatBot';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import SchoolDashboard from './pages/SchoolDashboard';
import SemedDashboard from './pages/SemedDashboard';
import CitizenPortal from './pages/CitizenPortal';
import ApplicationForm from './pages/ApplicationForm';
import ApplicationStatus from './pages/ApplicationStatus';
import CultureBlog from './pages/CultureBlog';
import Campaigns from './pages/Campaigns';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Register />} />
            <Route path="/cultura" element={<CultureBlog />} />
            <Route path="/campanhas" element={<Campaigns />} />
            <Route 
              path="/escola" 
              element={
                <ProtectedRoute allowedTypes={['school']}>
                  <SchoolDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/semed" 
              element={
                <ProtectedRoute allowedTypes={['semed']}>
                  <SemedDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/cidadao" 
              element={
                <ProtectedRoute allowedTypes={['citizen']}>
                  <CitizenPortal />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/matricula" 
              element={
                <ProtectedRoute allowedTypes={['citizen']}>
                  <ApplicationForm />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/status/:id" 
              element={
                <ProtectedRoute allowedTypes={['citizen']}>
                  <ApplicationStatus />
                </ProtectedRoute>
              } 
            />
          </Routes>
          <ChatBot />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;