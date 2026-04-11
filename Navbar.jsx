// Navbar.jsx
import React, { useState, useEffect } from 'react';
import { auth } from './firebase';
import { signOut } from 'firebase/auth';
import './App.css';

export default function Navbar({ currentView, onNavigate, user, theme, toggleTheme }) {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      onNavigate('home');
    } catch (err) {
      console.error(err);
    }
  };

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`global-navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="nav-left">
        <div className="nav-logo" onClick={() => onNavigate('home')}>
          <span className="logo-icon">🧭</span>
          <div className="logo-text-wrapper">
            <span className="logo-text">SkillPilot</span>
            <span className="logo-tagline">Navigate Your Skills</span>
          </div>
        </div>
        
        <div className="nav-links">
          <button 
            className={`nav-item ${currentView === 'home' ? 'active' : ''}`} 
            onClick={() => onNavigate('home')}
          >
            Home
          </button>
          <button 
            className="nav-item" 
            onClick={() => {
              onNavigate('home');
              setTimeout(() => {
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
          >
            Features
          </button>
          <button 
            className="nav-item" 
            onClick={() => window.open('https://github.com', '_blank')}
          >
            Community
          </button>

          {user && (
            <button 
              className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`} 
              onClick={() => onNavigate('dashboard')}
            >
              Roadmap Planner
            </button>
          )}
        </div>
      </div>

      <div className="nav-actions">
        <button className="theme-toggle nav-theme-toggle" onClick={toggleTheme} aria-label="Toggle Theme">
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        
        {!user ? (
          <button className="nav-signin-btn" onClick={() => onNavigate('login')}>
            Sign In
          </button>
        ) : (
          <div className="nav-user-group">
            <span className="nav-email">{user.displayName || user.email?.split('@')[0]}</span>
            <button className="logout-btn nav-logout-btn" onClick={handleLogout} title="Log Out">🚪 Logout</button>
          </div>
        )}
      </div>
    </nav>
  );
}
