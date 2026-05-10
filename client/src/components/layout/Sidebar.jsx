import { useStore } from '../../store/useStore';

const navItems = [
  { view: 'dashboard', icon: 'fa-house', label: 'Dashboard' },
  { view: 'tasks', icon: 'fa-list-check', label: 'Tasks' },
  { view: 'mood', icon: 'fa-heart-pulse', label: 'Mood' },
  { view: 'insights', icon: 'fa-chart-line', label: 'Insights' },
  { view: 'settings', icon: 'fa-sliders', label: 'Settings' },
];

export default function Sidebar({ currentView, onNavigate }) {
  const { tasks, settings } = useStore();
  const overdue = tasks.filter(t => {
    if (!t.deadline || t.completed) return false;
    const now = new Date(); now.setHours(0,0,0,0);
    return new Date(t.deadline) < now;
  });
  const showDot = settings.silentReminders && overdue.length > 0;

  return (
    <aside className="sidebar" role="navigation" aria-label="Main navigation">
      <div className="sidebar-brand">
        <h1>
          <span className={`breathing-dot ${!settings.breathingAnim ? 'paused' : ''}`}></span>
          QuietMind
        </h1>
        <p>Silent Productivity</p>
      </div>
      <nav className="sidebar-nav">
        {navItems.map(({ view, icon, label }) => (
          <button
            key={view}
            className={`nav-item ${currentView === view ? 'active' : ''}`}
            onClick={() => onNavigate(view)}
            aria-current={currentView === view ? 'page' : undefined}
          >
            <i className={`fa-solid ${icon}`}></i>
            {label}
            {view === 'tasks' && showDot && <span className="reminder-dot" id="reminder-dot"></span>}
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">
        <p>Your data is synced securely.</p>
      </div>
    </aside>
  );
}
