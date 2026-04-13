import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">LiveTime</Link>
        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/feed">Feed</Link>
          <Link to="/create">Create</Link>
          <Link to="/profile">Profile</Link>
        </div>
      </div>
    </nav>
  );
}
