const CATEGORIES = [
  { id: 'social', label: 'Social', icon: '🎉' },
  { id: 'sports', label: 'Sports', icon: '🏀' },
  { id: 'food', label: 'Free Food', icon: '🍕' },
  { id: 'study', label: 'Study', icon: '📚' },
  { id: 'outdoors', label: 'Outdoors', icon: '🌲' },
  { id: 'club', label: 'Club', icon: '🎭' },
  { id: 'arts', label: 'Arts', icon: '🎨' },
  { id: 'music', label: 'Music', icon: '🎵' },
];

export default function CategorySelector({ value, onChange }) {
  return (
    <div className="category-selector">
      {CATEGORIES.map((category) => (
        <button
          key={category.id}
          type="button"
          className={`category-option ${value === category.id ? 'selected' : ''}`}
          onClick={() => onChange(category.id)}
        >
          <span className="category-icon">{category.icon}</span>
          <span className="category-label">{category.label}</span>
        </button>
      ))}
    </div>
  );
}

export { CATEGORIES };
