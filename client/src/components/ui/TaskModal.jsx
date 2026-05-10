import { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';

export default function TaskModal({ open, onClose }) {
  const { addTask } = useStore();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('work');
  const [urgency, setUrgency] = useState(3);
  const [importance, setImportance] = useState(3);
  const [deadline, setDeadline] = useState('');

  useEffect(() => {
    if (open) setTimeout(() => document.getElementById('task-name-input')?.focus(), 100);
  }, [open]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const reset = () => {
    setName(''); setCategory('work'); setUrgency(3); setImportance(3); setDeadline('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    await addTask({ name: name.trim(), category, urgency, importance, deadline: deadline || null });
    reset(); onClose();
  };

  const handleClose = () => { reset(); onClose(); };

  if (!open) return null;
  const today = new Date().toISOString().split('T')[0];
  const cats = ['work', 'personal', 'health', 'creative'];

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && handleClose()}>
      <div className="modal-box">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>New Task</h2>
          <button className="btn-ghost" onClick={handleClose} aria-label="Close">
            <i className="fa-solid fa-xmark" style={{ fontSize: '1.1rem' }}></i>
          </button>
        </div>
        <form onSubmit={handleSubmit} autoComplete="off">
          <div style={{ marginBottom: '18px' }}>
            <label className="form-label" htmlFor="task-name-input">Task Name</label>
            <input
              id="task-name-input"
              className="form-input"
              type="text"
              placeholder="What needs to be done?"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>
          <div style={{ marginBottom: '18px' }}>
            <label className="form-label">Category</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {cats.map(cat => (
                <button
                  key={cat}
                  type="button"
                  className={`cat-pill ${category === cat ? 'selected' : ''}`}
                  data-cat={cat}
                  onClick={() => setCategory(cat)}
                  style={{ textTransform: 'capitalize' }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '18px' }}>
            <div>
              <label className="form-label">
                Urgency: <span style={{ color: 'var(--accent)' }}>{urgency}</span>/5
              </label>
              <input
                type="range" min="1" max="5" value={urgency}
                onChange={e => setUrgency(Number(e.target.value))}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--fg-muted)', marginTop: '2px' }}>
                <span>Low</span><span>Critical</span>
              </div>
            </div>
            <div>
              <label className="form-label">
                Importance: <span style={{ color: 'var(--warm)' }}>{importance}</span>/5
              </label>
              <input
                type="range" min="1" max="5" value={importance}
                className="warm-range"
                onChange={e => setImportance(Number(e.target.value))}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--fg-muted)', marginTop: '2px' }}>
                <span>Optional</span><span>Essential</span>
              </div>
            </div>
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label className="form-label" htmlFor="task-deadline">Deadline (optional)</label>
            <input
              id="task-deadline"
              className="form-input"
              type="date"
              min={today}
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            <i className="fa-solid fa-plus"></i> Add Task
          </button>
        </form>
      </div>
    </div>
  );
}
