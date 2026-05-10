import { useStore } from '../../store/useStore';
import { formatDate, isOverdue, calcPriority } from '../../utils';

function TaskItem({ task, onToggle, onDelete }) {
  const ps = calcPriority(task);
  return (
    <div className={`task-item ${task.completed ? 'completed' : ''}`}
      style={isOverdue(task) && !task.completed ? { borderColor: 'var(--danger)' } : {}}>
      <button
        className={`task-check ${task.completed ? 'checked' : ''}`}
        onClick={() => onToggle(task._id || task.id)}
        aria-label={`${task.completed ? 'Uncomplete' : 'Complete'} task`}
      >
        <i className="fa-solid fa-check"></i>
      </button>
      <span className="task-name">{task.name}</span>
      <div className="task-meta">
        <span className={`cat-badge ${task.category}`}>{task.category}</span>
        {isOverdue(task) && !task.completed && <span className="overdue-badge">Overdue</span>}
        {task.deadline && !isOverdue(task) && <span className="deadline-text">{formatDate(task.deadline)}</span>}
        {!task.completed && <span className="priority-score">{ps.toFixed(1)}</span>}
        <button
          className="btn-ghost"
          onClick={() => onDelete(task._id || task.id)}
          aria-label="Delete task"
          style={{ padding: '6px', color: 'var(--fg-muted)' }}
        >
          <i className="fa-solid fa-trash-can" style={{ fontSize: '0.78rem' }}></i>
        </button>
      </div>
    </div>
  );
}

export default function Tasks({ onAddTask }) {
  const { tasks, toggleTask, deleteTask, todayMood } = useStore();

  const pending = [...tasks]
    .filter(t => !t.completed)
    .map(t => ({ ...t, _ps: calcPriority(t, todayMood) }))
    .sort((a, b) => b._ps - a._ps);

  const completed = [...tasks]
    .filter(t => t.completed)
    .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));

  return (
    <section className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h2 className="font-display" style={{ fontSize: '1.5rem', fontWeight: 700 }}>Tasks</h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--fg-muted)', marginTop: '2px' }}>
            {pending.length} pending, {completed.length} completed
          </p>
        </div>
        <button className="btn btn-primary" onClick={onAddTask}>
          <i className="fa-solid fa-plus"></i> Add Task
        </button>
      </div>

      {pending.length > 0 ? (
        <>
          <p className="section-header">Pending ({pending.length})</p>
          {pending.map(t => (
            <TaskItem key={t._id || t.id} task={t} onToggle={toggleTask} onDelete={deleteTask} />
          ))}
        </>
      ) : (
        <div className="empty-state" style={{ marginBottom: '28px' }}>
          <i className="fa-solid fa-inbox"></i>
          <p>No pending tasks. You're all caught up or haven't added any yet.</p>
        </div>
      )}

      {completed.length > 0 && (
        <>
          <p className="section-header" style={{ marginTop: '28px' }}>Completed ({completed.length})</p>
          {completed.map(t => (
            <TaskItem key={t._id || t.id} task={t} onToggle={toggleTask} onDelete={deleteTask} />
          ))}
        </>
      )}
    </section>
  );
}
