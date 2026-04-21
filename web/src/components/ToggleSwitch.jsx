export default function ToggleSwitch({ label, checked, onChange, icon }) {
  return (
    <label className="toggle-switch">
      <div className="toggle-label">
        {icon && <span className="toggle-icon">{icon}</span>}
        <span>{label}</span>
      </div>
      <div className="toggle-control">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="toggle-slider"></span>
      </div>
    </label>
  );
}
