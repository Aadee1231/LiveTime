import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LivePulseDot from './LivePulseDot';

export default function Navbar() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const getInitials = (email) => {
    if (!email) return 'U';
    return email.charAt(0).toUpperCase();
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <LivePulseDot size="sm" color="primary" />
          <span>LiveTime</span>
        </Link>
        <div className="nav-links">
          {user ? (
            <>
              <Link to="/" className={isActive('/') ? 'active' : ''}>Home</Link>
              <Link to="/feed" className={isActive('/feed') ? 'active' : ''}>Feed</Link>
              <Link to="/create" className={`nav-create-btn ${isActive('/create') ? 'active' : ''}`}>
                <span>Post Event</span>
              </Link>
              <Link to="/settings" className={isActive('/settings') ? 'active' : ''}>Settings</Link>
              <div className="nav-profile-section">
                <Link to="/profile" className={`nav-profile-pill ${isActive('/profile') ? 'active' : ''}`}>
                  <span className="profile-avatar">{getInitials(user.email)}</span>
                  <span className="profile-name">
                    {profile?.account_type === 'organization' ? profile.org_name : 'Profile'}
                  </span>
                </Link>
                <button onClick={handleLogout} className="logout-btn" title="Logout">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                </button>
              </div>
            </>
          ) : (
            <Link to="/auth">Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
}
