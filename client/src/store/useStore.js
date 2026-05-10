import { create } from 'zustand';
import { api } from '../api/client';

export const useStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('qm_token') || null,
  tasks: [],
  moods: [],
  todayMood: null,
  settings: { darkMode: false, silentReminders: true, breathingAnim: true },
  toasts: [],
  loading: false,

  // Auth
  setAuth: (user, token) => {
    localStorage.setItem('qm_token', token);
    set({ user, token, settings: user.settings || get().settings });
    document.documentElement.setAttribute('data-theme', user.settings?.darkMode ? 'dark' : 'light');
  },
  logout: () => {
    localStorage.removeItem('qm_token');
    set({ user: null, token: null, tasks: [], moods: [], todayMood: null });
    document.documentElement.setAttribute('data-theme', 'light');
  },
  loadUser: async () => {
    const token = localStorage.getItem('qm_token');
    if (!token) return;
    try {
      const { user } = await api.me();
      set({ user, settings: user.settings });
      document.documentElement.setAttribute('data-theme', user.settings?.darkMode ? 'dark' : 'light');
    } catch {
      localStorage.removeItem('qm_token');
      set({ user: null, token: null });
    }
  },

  // Tasks
  loadTasks: async () => {
    try {
      const { tasks } = await api.getTasks();
      set({ tasks });
    } catch (e) { get().addToast(e.message, 'error'); }
  },
  addTask: async (task) => {
    try {
      const { task: t } = await api.createTask(task);
      set(s => ({ tasks: [t, ...s.tasks] }));
      get().addToast(`Task added: ${t.name}`, 'success');
    } catch (e) { get().addToast(e.message, 'error'); }
  },
  toggleTask: async (id) => {
    const task = get().tasks.find(t => t._id === id || t.id === id);
    if (!task) return;
    const newCompleted = !task.completed;
    try {
      const { task: updated } = await api.updateTask(id, { completed: newCompleted });
      set(s => ({ tasks: s.tasks.map(t => (t._id === id || t.id === id) ? updated : t) }));
      if (newCompleted) get().addToast(`Completed: ${task.name}`, 'success');
    } catch (e) { get().addToast(e.message, 'error'); }
  },
  deleteTask: async (id) => {
    const task = get().tasks.find(t => t._id === id || t.id === id);
    try {
      await api.deleteTask(id);
      set(s => ({ tasks: s.tasks.filter(t => t._id !== id && t.id !== id) }));
      if (task) get().addToast(`Removed: ${task.name}`, 'warning');
    } catch (e) { get().addToast(e.message, 'error'); }
  },

  // Moods
  loadMoods: async () => {
    try {
      const [{ moods }, { mood }] = await Promise.all([api.getMoods(), api.getTodayMood()]);
      set({ moods, todayMood: mood });
    } catch (e) { /* silently ignore */ }
  },
  logMood: async (mood) => {
    try {
      await api.logMood(mood);
      set({ todayMood: mood });
      const labels = { happy: 'Happy', neutral: 'Neutral', stressed: 'Stressed' };
      get().addToast(`Mood logged: ${labels[mood]}`, 'success');
      get().loadMoods();
    } catch (e) { get().addToast(e.message, 'error'); }
  },

  // Settings
  updateSettings: async (updates) => {
    try {
      const { settings } = await api.updateSettings(updates);
      set({ settings });
      if (typeof updates.darkMode === 'boolean') {
        document.documentElement.setAttribute('data-theme', updates.darkMode ? 'dark' : 'light');
      }
    } catch (e) { get().addToast(e.message, 'error'); }
  },

  // Toasts
  addToast: (message, type = 'success') => {
    const id = Date.now();
    set(s => ({ toasts: [...s.toasts, { id, message, type }] }));
    setTimeout(() => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })), 3000);
  },
  removeToast: (id) => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),
}));
