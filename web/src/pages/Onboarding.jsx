import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import InterestPicker from '../components/InterestPicker';

const STEPS = {
  WELCOME: 0,
  INTERESTS: 1,
  PREFERENCES: 2,
  COMPLETE: 3
};

export default function Onboarding() {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(STEPS.WELCOME);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [preferences, setPreferences] = useState({
    event_radius: 5,
    preferred_times: [],
    show_live_first: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSkip = async () => {
    try {
      setLoading(true);
      await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', user.id);
      
      await refreshProfile();
      navigate('/');
    } catch (err) {
      console.error('Error skipping onboarding:', err);
      setError('Failed to skip onboarding');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStep === STEPS.WELCOME) {
      setCurrentStep(STEPS.INTERESTS);
    } else if (currentStep === STEPS.INTERESTS) {
      if (selectedInterests.length === 0) {
        setError('Please select at least one interest');
        return;
      }
      setError('');
      setCurrentStep(STEPS.PREFERENCES);
    } else if (currentStep === STEPS.PREFERENCES) {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > STEPS.WELCOME) {
      setCurrentStep(currentStep - 1);
      setError('');
    }
  };

  const handleComplete = async () => {
    try {
      setLoading(true);
      setError('');

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          onboarding_completed: true,
          interests: selectedInterests,
          preferences: preferences
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      await refreshProfile();
      setCurrentStep(STEPS.COMPLETE);
      
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      console.error('Error completing onboarding:', err);
      setError('Failed to save your preferences. Please try again.');
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

  const renderProgressBar = () => {
    const progress = ((currentStep + 1) / 4) * 100;
    return (
      <div className="onboarding-progress">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
        <p className="progress-text">Step {currentStep + 1} of 4</p>
      </div>
    );
  };

  const renderWelcome = () => (
    <div className="onboarding-step welcome-step">
      <div className="welcome-icon">👋</div>
      <h1>Welcome to LiveTime!</h1>
      <p className="welcome-subtitle">
        Let's personalize your experience so you never miss the events that matter to you.
      </p>
      <div className="welcome-features">
        <div className="feature-item">
          <div className="feature-icon">🎯</div>
          <div className="feature-text">
            <h3>Personalized Feed</h3>
            <p>See events tailored to your interests</p>
          </div>
        </div>
        <div className="feature-item">
          <div className="feature-icon">🔔</div>
          <div className="feature-text">
            <h3>Smart Notifications</h3>
            <p>Get notified about events you care about</p>
          </div>
        </div>
        <div className="feature-item">
          <div className="feature-icon">⚡</div>
          <div className="feature-text">
            <h3>Quick Discovery</h3>
            <p>Find relevant events faster</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderInterests = () => (
    <div className="onboarding-step interests-step">
      <h2>What interests you?</h2>
      <p className="step-subtitle">
        Select the types of events you'd like to see. You can always change this later.
      </p>
      <InterestPicker
        selectedInterests={selectedInterests}
        onInterestsChange={setSelectedInterests}
        minSelection={1}
        showDescription={true}
      />
    </div>
  );

  const renderPreferences = () => (
    <div className="onboarding-step preferences-step">
      <h2>Set your preferences</h2>
      <p className="step-subtitle">
        Help us show you the most relevant events (optional)
      </p>
      
      <div className="preference-section">
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

      <div className="preference-section">
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

      <div className="preference-section">
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
  );

  const renderComplete = () => (
    <div className="onboarding-step complete-step">
      <div className="complete-icon">🎉</div>
      <h2>You're all set!</h2>
      <p className="complete-subtitle">
        Your LiveTime experience is now personalized. Redirecting you to the app...
      </p>
      <div className="loading-spinner"></div>
    </div>
  );

  return (
    <div className="onboarding-container">
      <div className="onboarding-card">
        {currentStep !== STEPS.COMPLETE && renderProgressBar()}
        
        {error && (
          <div className="onboarding-error">
            {error}
          </div>
        )}

        <div className="onboarding-content">
          {currentStep === STEPS.WELCOME && renderWelcome()}
          {currentStep === STEPS.INTERESTS && renderInterests()}
          {currentStep === STEPS.PREFERENCES && renderPreferences()}
          {currentStep === STEPS.COMPLETE && renderComplete()}
        </div>

        {currentStep !== STEPS.COMPLETE && (
          <div className="onboarding-actions">
            <div className="action-left">
              {currentStep > STEPS.WELCOME && (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleBack}
                  disabled={loading}
                >
                  Back
                </button>
              )}
            </div>
            <div className="action-right">
              <button
                type="button"
                className="btn-skip"
                onClick={handleSkip}
                disabled={loading}
              >
                Skip for now
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleNext}
                disabled={loading || (currentStep === STEPS.INTERESTS && selectedInterests.length === 0)}
              >
                {loading ? 'Saving...' : currentStep === STEPS.PREFERENCES ? 'Complete' : 'Next'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
