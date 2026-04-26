import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { Wallet, Loader2 } from 'lucide-react';
import useScrollAnimation from '../hooks/useScrollAnimation';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  useScrollAnimation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await api.post('/auth/register', { name, email, password });
      // Post-registration login fix: auto login the user
      const loginRes = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', loginRes.data.token);
      localStorage.setItem('user', JSON.stringify(loginRes.data.user));
      navigate('/dashboard');
      window.location.reload(); // Ensure auth context picks it up
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try a different email.');
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg)', padding: '1rem' }}>
      <div className="neu-card animate-on-scroll" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem 2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', boxShadow: '0 4px 14px rgba(124, 58, 237, 0.4)' }}>
            <Wallet className="w-8 h-8" />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--sidebar-bg)' }}>Create Account</h1>
          <p className="text-muted" style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Join SmartSpend to track your finances</p>
        </div>

        {error && (
          <div style={{ padding: '0.75rem', marginBottom: '1.5rem', backgroundColor: '#FEE2E2', color: '#DC2626', borderRadius: '12px', fontSize: '0.875rem', textAlign: 'center', border: '1px solid #FCA5A5' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="neu-input"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="neu-input"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="neu-input"
              placeholder="••••••••"
              minLength={6}
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="neu-button neu-button-primary"
            style={{ width: '100%', marginTop: '0.5rem', padding: '12px' }}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.875rem', color: 'var(--muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
