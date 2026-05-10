import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useStore } from './store/useStore';
import Sidebar from './components/layout/Sidebar';
import MobileNav from './components/layout/MobileNav';
import Toasts from './components/ui/Toasts';
import TaskModal from './components/ui/TaskModal';
import Dashboard from './components/views/Dashboard';
import Tasks from './components/views/Tasks';
import Mood from './components/views/Mood';
import Insights from './components/views/Insights';
import Settings from './components/views/Settings';
import Login from './components/views/Login';
import Register from './components/views/Register';

function ProtectedRoute({ children }) {
  const { token } = useStore();
  return token ? children : <Navigate to="/login" replace />;
}

function AppLayout() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [modalOpen, setModalOpen] = useState(false);
  const { loadUser, loadTasks, loadMoods, token } = useStore();

  useEffect(() => {
    if (token) {
      loadUser();
      loadTasks();
      loadMoods();
    }
  }, [token]);

  const views = {
    dashboard: <Dashboard onNavigate={setCurrentView} onAddTask={() => setModalOpen(true)} />,
    tasks: <Tasks onAddTask={() => setModalOpen(true)} />,
    mood: <Mood />,
    insights: <Insights />,
    settings: <Settings />,
  };

  return (
    <div className="app-layout">
      <Sidebar currentView={currentView} onNavigate={setCurrentView} />
      <main className="main-content">
        {views[currentView]}
      </main>
      <MobileNav currentView={currentView} onNavigate={setCurrentView} />
      {currentView === 'tasks' && (
        <button className="fab" onClick={() => setModalOpen(true)} aria-label="Add task">
          <i className="fa-solid fa-plus"></i>
        </button>
      )}
      <TaskModal open={modalOpen} onClose={() => setModalOpen(false)} />
      <Toasts />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/*" element={
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      } />
    </Routes>
  );
}
