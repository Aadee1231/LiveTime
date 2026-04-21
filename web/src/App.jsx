import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Feed from './pages/Feed';
import Create from './pages/Create';
import Profile from './pages/Profile';
import OrgProfile from './pages/OrgProfile';
import Settings from './pages/Settings';
import Auth from './pages/Auth';
import Onboarding from './pages/Onboarding';
import EventDetailModal from './components/EventDetailModal';
import { useAuth } from './contexts/AuthContext';
import { useEventModal } from './contexts/EventModalContext';
import './App.css';
import './components/OrgCredibility.css';

function App() {
  const { user } = useAuth();
  const { selectedEvent, closeEventModal } = useEventModal();

  return (
    <Router>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/feed" 
              element={
                <ProtectedRoute>
                  <Feed />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/create" 
              element={
                <ProtectedRoute>
                  <Create />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/org/:username" 
              element={
                <ProtectedRoute>
                  <OrgProfile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/onboarding" 
              element={
                <ProtectedRoute>
                  <Onboarding />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/auth" 
              element={user ? <Navigate to="/" replace /> : <Auth />} 
            />
          </Routes>
        </main>
        {selectedEvent && (
          <EventDetailModal event={selectedEvent} onClose={closeEventModal} />
        )}
      </div>
    </Router>
  );
}

export default App;
