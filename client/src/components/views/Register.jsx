import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { useStore } from '../../store/useStore';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuth } = useStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { token, user } = await api.register({ name, email, password });
      setAuth(user, token);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        <h1><span style={{ fontSize: '0.6em' }}>🌿 </span>QuietMind</h1>
        <p>Create your account</p>

        {error && (
          <div style={{ background: 'var(--danger-subtle)', border: '1px solid var(--danger)', borderRadius: 'var(--radius-xs)', padding: '10px 14px', marginBottom: '18px', fontSize: '0.85rem', color: 'var(--danger)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} autoComplete="off">
          <div style={{ marginBottom: '16px' }}>
            <label className="form-label" htmlFor="name">Name</label>
            <input id="name" className="form-input" type="text" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label className="form-label" htmlFor="email">Email</label>
            <input id="email" className="form-input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label className="form-label" htmlFor="password">Password</label>
            <input id="password" className="form-input" type="password" placeholder="At least 6 characters" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginBottom: '16px' }} disabled={loading}>
            {loading ? <><i className="fa-solid fa-spinner fa-spin"></i> Creating account...</> : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--fg-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
