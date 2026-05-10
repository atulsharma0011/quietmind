const navItems = [
  { view: 'dashboard', icon: 'fa-house', label: 'Home' },
  { view: 'tasks', icon: 'fa-list-check', label: 'Tasks' },
  { view: 'mood', icon: 'fa-heart-pulse', label: 'Mood' },
  { view: 'insights', icon: 'fa-chart-line', label: 'Insights' },
  { view: 'settings', icon: 'fa-sliders', label: 'Settings' },
];

export default function MobileNav({ currentView, onNavigate }) {
  return (
    <nav className="mobile-nav" aria-label="Mobile navigation">
      <div className="mobile-nav-items">
        {navItems.map(({ view, icon, label }) => (
          <button
            key={view}
            className={`mob-nav-item ${currentView === view ? 'active' : ''}`}
            onClick={() => onNavigate(view)}
          >
            <i className={`fa-solid ${icon}`}></i>
            {label}
          </button>
        ))}
      </div>
    </nav>
  );
}
