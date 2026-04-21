import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import InterestPicker from '../components/InterestPicker';

export default function Settings() {
  const { user, profile, refreshProfile } = useAuth();
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [preferences, setPreferences] = useState({
    event_radius: 5,
    preferred_times: [],
    show_live_first: true
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (profile) {
      setSelectedInterests(profile.interests || []);
      setPreferences(profile.preferences || {
        event_radius: 5,
        preferred_times: [],
        show_live_first: true
      });
    }
  }, [profile]);

  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          interests: selectedInterests,
          preferences: preferences
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      await refreshProfile();
      setSuccess('Settings saved successfully!');
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Failed to save settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const togglePreferredTime = (time) => {
    setPreferences(prev => ({
      ...prev,
      preferred_times: prev.preferred_times.includes(time)
        ? prev.preferred_times.filter(t => t !== time)
        : [...prev.preferred_times, time]
    }));
  };

  return (
    <div className="page settings-page">
      <div className="settings-header">
        <h1>Settings</h1>
        <p className="settings-subtitle">Manage your interests and preferences</p>
      </div>

      {success && (
        <div className="success-banner">
          {success}
        </div>
      )}

      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}

      <div className="settings-content">
        <div className="settings-section">
          <div className="section-header">
            <h2>Your Interests</h2>
            <p className="section-description">
              Select the types of events you'd like to see in your feed
            </p>
          </div>
          <InterestPicker
            selectedInterests={selectedInterests}
            onInterestsChange={setSelectedInterests}
            minSelection={0}
            showDescription={true}
          />
        </div>

        <div className="settings-section">
          <div className="section-header">
            <h2>Event Preferences</h2>
            <p className="section-description">
              Customize how you discover events
            </p>
          </div>

          <div className="preference-group">
            <label className="preference-label">
              <span className="label-text">Event Radius</span>
              <span className="label-hint">How far are you willing to travel?</span>
            </label>
            <div className="radius-slider-container">
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={preferences.event_radius}
                onChange={(e) => setPreferences(prev => ({ ...prev, event_radius: parseInt(e.target.value) }))}
                className="radius-slider"
              />
              <div className="radius-value">{preferences.event_radius} miles</div>
            </div>
          </div>

          <div className="preference-group">
            <label className="preference-label">
              <span className="label-text">Preferred Times</span>
              <span className="label-hint">When do you usually attend events?</span>
            </label>
            <div className="time-pills">
              {['morning', 'afternoon', 'evening', 'night'].map(time => (
                <button
                  key={time}
                  type="button"
                  className={`time-pill ${preferences.preferred_times.includes(time) ? 'active' : ''}`}
                  onClick={() => togglePreferredTime(time)}
                >
                  {time === 'morning' && '🌅'} 
                  {time === 'afternoon' && '☀️'}
                  {time === 'evening' && '🌆'}
                  {time === 'night' && '🌙'}
                  <span>{time.charAt(0).toUpperCase() + time.slice(1)}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="preference-group">
            <label className="preference-toggle">
              <input
                type="checkbox"
                checked={preferences.show_live_first}
                onChange={(e) => setPreferences(prev => ({ ...prev, show_live_first: e.target.checked }))}
              />
              <span className="toggle-text">
                <span className="toggle-label">Show live events first</span>
                <span className="toggle-hint">Prioritize events happening right now</span>
              </span>
            </label>
          </div>
        </div>

        <div className="settings-actions">
          <button
            type="button"
            className="save-settings-btn"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
