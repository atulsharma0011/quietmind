export function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const today = new Date(); today.setHours(0,0,0,0);
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
  const dl = new Date(d); dl.setHours(0,0,0,0);
  if (dl.getTime() === today.getTime()) return 'Today';
  if (dl.getTime() === tomorrow.getTime()) return 'Tomorrow';
  if (dl < today) return 'Overdue';
  return d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
}

export function isOverdue(task) {
  if (!task.deadline || task.completed) return false;
  const now = new Date(); now.setHours(0,0,0,0);
  return new Date(task.deadline) < now;
}

export function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export function todayFormatted() {
  return new Date().toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' });
}

export function calcPriority(task, mood = null) {
  let score = task.importance * 0.4 + task.urgency * 0.3;
  if (task.deadline) {
    const now = new Date(); now.setHours(0,0,0,0);
    const dl = new Date(task.deadline); dl.setHours(0,0,0,0);
    const diff = Math.ceil((dl - now) / 86400000);
    if (diff < 0) score += 3.0;
    else if (diff === 0) score += 2.5;
    else if (diff === 1) score += 2.0;
    else if (diff <= 3) score += 1.4;
    else if (diff <= 7) score += 0.7;
    else score += 0.15;
  }
  if (mood === 'stressed') {
    if (task.urgency <= 2 && task.importance <= 3) score *= 1.3;
    else if (task.urgency >= 4) score *= 0.7;
  } else if (mood === 'happy') {
    score *= 1.05;
  }
  return Math.round(score * 100) / 100;
}
