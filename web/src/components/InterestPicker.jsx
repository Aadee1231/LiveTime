import { useState, useEffect } from 'react';

const INTERESTS = [
  { id: 'social', label: 'Social', icon: '🎉', description: 'Parties, hangouts, networking' },
  { id: 'sports', label: 'Sports', icon: '⚽', description: 'Games, fitness, athletics' },
  { id: 'food', label: 'Free Food', icon: '🍕', description: 'Free meals and snacks' },
  { id: 'academic', label: 'Academic', icon: '📚', description: 'Workshops, lectures, study' },
  { id: 'club', label: 'Club', icon: '👥', description: 'Club meetings and activities' },
  { id: 'outdoors', label: 'Outdoors', icon: '🌲', description: 'Hiking, camping, nature' },
  { id: 'music', label: 'Music', icon: '🎵', description: 'Concerts, performances, jams' },
  { id: 'networking', label: 'Networking', icon: '🤝', description: 'Career fairs, meetups' },
  { id: 'cultural', label: 'Cultural', icon: '🌍', description: 'Cultural events and festivals' },
  { id: 'study', label: 'Study', icon: '✏️', description: 'Study sessions and groups' }
];

export default function InterestPicker({ 
  selectedInterests = [], 
  onInterestsChange,
  minSelection = 1,
  showDescription = true,
  variant = 'default'
}) {
  const [selected, setSelected] = useState(selectedInterests);

  useEffect(() => {
    setSelected(selectedInterests);
  }, [selectedInterests]);

  const toggleInterest = (interestId) => {
    let newSelected;
    if (selected.includes(interestId)) {
      newSelected = selected.filter(id => id !== interestId);
    } else {
      newSelected = [...selected, interestId];
    }
    setSelected(newSelected);
    onInterestsChange?.(newSelected);
  };

  const isSelected = (interestId) => selected.includes(interestId);

  return (
    <div className={`interest-picker ${variant}`}>
      <div className="interest-grid">
        {INTERESTS.map((interest) => {
          const active = isSelected(interest.id);
          return (
            <button
              key={interest.id}
              type="button"
              className={`interest-card ${active ? 'active' : ''}`}
              onClick={() => toggleInterest(interest.id)}
            >
              <div className="interest-icon">{interest.icon}</div>
              <div className="interest-content">
                <div className="interest-label">{interest.label}</div>
                {showDescription && (
                  <div className="interest-description">{interest.description}</div>
                )}
              </div>
              {active && (
                <div className="interest-check">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
      {minSelection > 0 && selected.length < minSelection && (
        <p className="interest-hint">
          Select at least {minSelection} interest{minSelection > 1 ? 's' : ''} to continue
        </p>
      )}
    </div>
  );
}

export { INTERESTS };
