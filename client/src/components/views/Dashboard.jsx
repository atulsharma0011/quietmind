import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { api } from '../../api/client';
import { formatDate, isOverdue, getGreeting, todayFormatted, calcPriority } from '../../utils';

export default function Dashboard({ onNavigate, onAddTask }) {
  const { tasks, todayMood, logMood } = useStore();
  const [suggestion, setSuggestion] = useState(null);
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);

  const { toggleTask } = useStore();

  const pending = tasks.filter(t => !t.completed);
  const today = new Date().toISOString().split('T')[0];
  const todayCompleted = tasks.filter(t => t.completed && t.completedAt && t.completedAt.startsWith(today)).length;
  const todayTotal = tasks.filter(t => (t.createdAt || '').startsWith(today)).length;
  const overdue = tasks.filter(t => isOverdue(t));

  const topTasks = [...tasks]
    .filter(t => !t.completed)
    .map(t => ({ ...t, ps: calcPriority(t, todayMood) }))
    .sort((a, b) => b.ps - a.ps)
    .slice(0, 3);

  const circumference = 2 * Math.PI * 52;
  const progress = todayTotal > 0 ? todayCompleted / todayTotal : 0;
  const offset = circumference * (1 - progress);

  const getSuggestion = async () => {
    setLoadingSuggestion(true);
    try {
      const data = await api.getSuggestion();
      setSuggestion(data);
    } catch (e) {
      setSuggestion(null);
    } finally {
      setLoadingSuggestion(false);
    }
  };

  const handleToggle = async (id) => {
    await toggleTask(id);
    setSuggestion(null);
  };

  return (
    <section className="fade-in">
      <div style={{ marginBottom: '32px' }}>
        <p style={{ fontSize: '0.85rem', color: 'var(--fg-muted)', marginBottom: '4px' }}>{todayFormatted()}</p>
        <h2 className="font-display" style={{ fontSize: '1.8rem', fontWeight: 700 }}>{getGreeting()}</h2>
      </div>

      {overdue.length > 0 && (
        <div className="card card-compact" style={{ marginBottom: '20px', borderColor: 'var(--danger)', background: 'var(--danger-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className="fa-solid fa-clock" style={{ color: 'var(--danger)' }}></i>
            <span style={{ fontSize: '0.85rem', color: 'var(--danger)', fontWeight: 600 }}>
              {overdue.length} overdue task{overdue.length > 1 ? 's' : ''} — consider addressing these first.
            </span>
          </div>
        </div>
      )}

      <div className="dashboard-grid">
        {/* Suggestion card */}
        <div className="suggest-card">
          <p className="section-header" style={{ marginBottom: '8px' }}>What Should I Do Now?</p>
          {!suggestion ? (
            pending.length > 0 ? (
              <>
                <p style={{ fontSize: '0.92rem', color: 'var(--fg-secondary)', marginBottom: '16px', lineHeight: 1.5 }}>
                  Let the prioritization engine pick your next action based on urgency, importance, deadline, and current mood.
                </p>
                <button className="btn btn-primary" onClick={getSuggestion} disabled={loadingSuggestion}>
                  {loadingSuggestion
                    ? <><i className="fa-solid fa-spinner fa-spin"></i> Thinking...</>
                    : <><i className="fa-solid fa-wand-magic-sparkles"></i> Get Suggestion</>
                  }
                </button>
              </>
            ) : (
              <div className="empty-state" style={{ padding: '20px' }}>
                <i className="fa-solid fa-sparkles" style={{ fontSize: '1.5rem' }}></i>
                <p>No pending tasks. Enjoy the clarity.</p>
              </div>
            )
          ) : suggestion.task ? (
            <div className="slide-up">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span className={`cat-badge ${suggestion.task.category}`}>{suggestion.task.category}</span>
                {isOverdue(suggestion.task) && <span className="overdue-badge">Overdue</span>}
                {suggestion.task.deadline && !isOverdue(suggestion.task) && (
                  <span className="deadline-text">{formatDate(suggestion.task.deadline)}</span>
                )}
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '10px', lineHeight: 1.3 }}>{suggestion.task.name}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--fg-secondary)', lineHeight: 1.55, marginBottom: '16px' }}>{suggestion.reason}</p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-primary btn-sm" onClick={() => handleToggle(suggestion.task._id || suggestion.task.id)}>
                  <i className="fa-solid fa-check"></i> Done
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => setSuggestion(null)}>
                  <i className="fa-solid fa-rotate"></i> Reset
                </button>
              </div>
            </div>
          ) : (
            <p style={{ fontSize: '0.88rem', color: 'var(--fg-muted)' }}>No pending tasks to suggest.</p>
          )}
        </div>

        {/* Progress ring */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <p className="section-header" style={{ alignSelf: 'flex-start' }}>Today</p>
          <svg width="120" height="120" viewBox="0 0 120 120" style={{ margin: '8px 0' }}>
            <circle cx="60" cy="60" r="52" stroke="var(--border)" strokeWidth="7" fill="none"/>
            <circle cx="60" cy="60" r="52" stroke="var(--accent)" strokeWidth="7" fill="none"
              strokeDasharray={circumference} strokeDashoffset={offset}
              strokeLinecap="round" className="progress-ring-circle"/>
            <text x="60" y="56" textAnchor="middle" fill="var(--fg)" fontSize="1.4rem" fontWeight="700" fontFamily="DM Sans">{Math.round(progress * 100)}%</text>
            <text x="60" y="72" textAnchor="middle" fill="var(--fg-muted)" fontSize="0.65rem" fontWeight="500">{todayCompleted}/{todayTotal} done</text>
          </svg>
          <p style={{ fontSize: '0.78rem', color: 'var(--fg-muted)', marginTop: '4px' }}>{pending.length} task{pending.length !== 1 ? 's' : ''} remaining</p>
        </div>
      </div>

      {/* Top 3 */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <p className="section-header" style={{ marginBottom: 0 }}>Top 3 Priorities</p>
          <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('tasks')} style={{ fontSize: '0.78rem' }}>
            View all <i className="fa-solid fa-arrow-right" style={{ fontSize: '0.7rem' }}></i>
          </button>
        </div>
        {topTasks.length > 0 ? topTasks.map(t => (
          <div key={t._id || t.id} className="task-item" style={isOverdue(t) ? { borderColor: 'var(--danger)' } : {}}>
            <button className="task-check" onClick={() => toggleTask(t._id || t.id)} aria-label="Complete task">
              <i className="fa-solid fa-check"></i>
            </button>
            <span className="task-name">{t.name}</span>
            <div className="task-meta">
              <span className={`cat-badge ${t.category}`}>{t.category}</span>
              {isOverdue(t) && <span className="overdue-badge">Overdue</span>}
              {t.deadline && !isOverdue(t) && <span className="deadline-text">{formatDate(t.deadline)}</span>}
              <span className="priority-score">{t.ps.toFixed(1)}</span>
            </div>
          </div>
        )) : (
          <div className="empty-state">
            <i className="fa-solid fa-inbox"></i>
            <p>No tasks yet. Add one to see your top priorities here.</p>
          </div>
        )}
      </div>

      {/* Mood quick log */}
      <div>
        <p className="section-header">How are you feeling?</p>
        <div className="mood-cards-row">
          {['happy', 'neutral', 'stressed'].map(m => (
            <div key={m} className={`mood-card ${m} ${todayMood === m ? 'selected' : ''}`} onClick={() => logMood(m)}>
              <i className={`fa-solid ${m === 'happy' ? 'fa-face-smile' : m === 'neutral' ? 'fa-face-meh' : 'fa-face-frown-open'}`}></i>
              <span className="mood-label" style={{ textTransform: 'capitalize' }}>{m}</span>
            </div>
          ))}
        </div>
        {todayMood && (
          <p style={{ fontSize: '0.78rem', color: 'var(--fg-muted)', marginTop: '10px', textAlign: 'center' }}>
            Mood logged for today. Tasks will be re-prioritized accordingly.
          </p>
        )}
      </div>
    </section>
  );
}
