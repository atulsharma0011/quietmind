import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const { settings, updateSettings, user, logout, addToast } = useStore();
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();

  const toggle = async (key) => {
    await updateSettings({ [key]: !settings[key] });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <section className="fade-in">
      <div style={{ marginBottom: '32px' }}>
        <h2 className="font-display" style={{ fontSize: '1.5rem', fontWeight: 700 }}>Settings</h2>
        <p style={{ fontSize: '0.82rem', color: 'var(--fg-muted)', marginTop: '2px' }}>Customize your QuietMind experience</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '560px' }}>
        {/* User info */}
        {user && (
          <div className="card card-compact" style={{ marginBottom: '4px' }}>
            <p style={{ fontSize: '0.92rem', fontWeight: 600 }}>{user.name}</p>
            <p style={{ fontSize: '0.78rem', color: 'var(--fg-muted)' }}>{user.email}</p>
          </div>
        )}

        {/* Dark Mode */}
        <div className="card card-compact" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: '0.92rem', fontWeight: 600 }}>Dark Mode</p>
            <p style={{ fontSize: '0.78rem', color: 'var(--fg-muted)' }}>Easier on the eyes in low light</p>
          </div>
          <button className={`toggle ${settings.darkMode ? 'on' : ''}`} onClick={() => toggle('darkMode')} aria-label="Toggle dark mode"></button>
        </div>

        {/* Silent Reminders */}
        <div className="card card-compact" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: '0.92rem', fontWeight: 600 }}>Silent Reminders</p>
            <p style={{ fontSize: '0.78rem', color: 'var(--fg-muted)' }}>Subtle overdue indicators instead of alerts</p>
          </div>
          <button className={`toggle ${settings.silentReminders ? 'on' : ''}`} onClick={() => toggle('silentReminders')} aria-label="Toggle silent reminders"></button>
        </div>

        {/* Breathing Animation */}
        <div className="card card-compact" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: '0.92rem', fontWeight: 600 }}>Breathing Animation</p>
            <p style={{ fontSize: '0.78rem', color: 'var(--fg-muted)' }}>Gentle pulse on the brand indicator</p>
          </div>
          <button className={`toggle ${settings.breathingAnim ? 'on' : ''}`} onClick={() => toggle('breathingAnim')} aria-label="Toggle breathing animation"></button>
        </div>

        <div style={{ borderTop: '1px solid var(--border)', margin: '8px 0' }}></div>

        {/* Logout */}
        <div className="card card-compact" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: '0.92rem', fontWeight: 600 }}>Sign Out</p>
            <p style={{ fontSize: '0.78rem', color: 'var(--fg-muted)' }}>Log out of your account</p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
            <i className="fa-solid fa-right-from-bracket"></i> Log Out
          </button>
        </div>

        {/* About */}
        <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--fg-muted)', fontSize: '0.78rem' }}>
          <p className="font-display" style={{ fontSize: '1.1rem', color: 'var(--accent)', marginBottom: '4px' }}>QuietMind</p>
          <p>Silent AI Productivity & Mental Load Reducer</p>
          <p style={{ marginTop: '4px' }}>Data synced to your account securely.</p>
        </div>
      </div>

      {showConfirm && (
        <div className="modal-overlay" onClick={() => setShowConfirm(false)}>
          <div className="modal-box" style={{ maxWidth: '360px', textAlign: 'center' }}>
            <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: '2rem', color: 'var(--danger)', marginBottom: '14px', display: 'block' }}></i>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '8px' }}>Sign Out?</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--fg-secondary)', marginBottom: '24px', lineHeight: 1.5 }}>Your data will remain saved in your account.</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button className="btn btn-secondary" onClick={() => setShowConfirm(false)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleLogout}>Sign Out</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
