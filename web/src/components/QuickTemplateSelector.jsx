const TEMPLATES = [
  {
    id: 'free-food',
    icon: '🍕',
    label: 'Free Food',
    title: 'Free Food at ',
    description: 'Come grab some free food! ',
    category: 'food',
    free_food: true
  },
  {
    id: 'pickup-game',
    icon: '⚽',
    label: 'Pickup Game',
    title: 'Pickup ',
    description: 'Looking for players! All skill levels welcome.',
    category: 'sports',
    free_food: false
  },
  {
    id: 'study-session',
    icon: '📚',
    label: 'Study Session',
    title: 'Study Session',
    description: 'Group study session. Bring your materials and questions!',
    category: 'academic',
    free_food: false
  },
  {
    id: 'hangout',
    icon: '🎉',
    label: 'Hangout',
    title: 'Casual Hangout',
    description: 'Come hang out and meet new people!',
    category: 'social',
    free_food: false
  },
  {
    id: 'performance',
    icon: '🎭',
    label: 'Performance',
    title: 'Live Performance',
    description: 'Join us for a live performance!',
    category: 'social',
    free_food: false
  },
  {
    id: 'club-meeting',
    icon: '👥',
    label: 'Club Meeting',
    title: 'Club Meeting',
    description: 'Regular club meeting. New members welcome!',
    category: 'club',
    free_food: false
  }
];

export default function QuickTemplateSelector({ onSelectTemplate }) {
  return (
    <div className="quick-template-selector">
      <div className="template-header">
        <h4>Quick Templates</h4>
        <p className="template-subtitle">Start with a common event type</p>
      </div>
      
      <div className="template-grid">
        {TEMPLATES.map(template => (
          <button
            key={template.id}
            type="button"
            className="template-option"
            onClick={() => onSelectTemplate(template)}
          >
            <span className="template-icon">{template.icon}</span>
            <span className="template-label">{template.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
