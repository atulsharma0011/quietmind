const BASE = '/api';

function getToken() {
  return localStorage.getItem('qm_token');
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { ...headers, ...options.headers }
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  // Auth
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  me: () => request('/auth/me'),
  updateSettings: (body) => request('/auth/settings', { method: 'PATCH', body: JSON.stringify(body) }),

  // Tasks
  getTasks: () => request('/tasks'),
  createTask: (body) => request('/tasks', { method: 'POST', body: JSON.stringify(body) }),
  updateTask: (id, body) => request(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteTask: (id) => request(`/tasks/${id}`, { method: 'DELETE' }),
  getSuggestion: () => request('/tasks/suggest'),

  // Moods
  getMoods: () => request('/moods'),
  getTodayMood: () => request('/moods/today'),
  logMood: (mood) => request('/moods', { method: 'POST', body: JSON.stringify({ mood }) }),

  // Insights
  getInsights: () => request('/insights'),
};
