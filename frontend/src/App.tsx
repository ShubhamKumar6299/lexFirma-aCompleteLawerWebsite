import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import ChatbotWidget from './components/ChatbotWidget/ChatbotWidget';
import Home from './pages/Home/Home';
import LawyerListing from './pages/LawyerListing/LawyerListing';
import LawyerProfile from './pages/LawyerProfile/LawyerProfile';
import LawyerDashboard from './pages/LawyerDashboard/LawyerDashboard';
import CaseSurfing from './pages/CaseSurfing/CaseSurfing';
import ScheduleMeeting from './pages/ScheduleMeeting/ScheduleMeeting';
import ContactLawyer from './pages/ContactLawyer/ContactLawyer';
import ChatRoom from './pages/ChatRoom/ChatRoom';
import LawyerChatRoom from './pages/LawyerChatRoom/LawyerChatRoom';
import JoinMeeting from './pages/JoinMeeting/JoinMeeting';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import NotFound from './pages/NotFound/NotFound';
import './index.css';

const ProtectedRoute = ({ children, requiredRole }: { children: React.ReactNode; requiredRole?: string }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/auth/login" replace />;
  if (requiredRole && user.role !== requiredRole) return <Navigate to="/" replace />;
  return <>{children}</>;
};

function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route
          path="/admin"
          element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>}
        />
        <Route path="/" element={<Home />} />
        <Route path="/lawyers" element={<LawyerListing />} />
        <Route path="/lawyers/:id" element={<LawyerProfile />} />
        <Route path="/news" element={<CaseSurfing />} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={<ProtectedRoute requiredRole="lawyer"><LawyerDashboard /></ProtectedRoute>}
        />
        <Route
          path="/meetings/schedule/:lawyerId"
          element={<ProtectedRoute><ScheduleMeeting /></ProtectedRoute>}
        />
        <Route
          path="/meetings/join/:meetingId"
          element={<ProtectedRoute><JoinMeeting /></ProtectedRoute>}
        />
        <Route path="/contact/:lawyerId" element={<ContactLawyer />} />
        <Route
          path="/chat/:lawyerId"
          element={<ProtectedRoute><ChatRoom /></ProtectedRoute>}
        />
        <Route
          path="/chat/room/:roomId"
          element={<ProtectedRoute><LawyerChatRoom /></ProtectedRoute>}
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
      <ChatbotWidget />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#111827',
              color: '#f3f4f6',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#111827' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#111827' } },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
