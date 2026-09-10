import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Wallet, Loader2 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import useScrollAnimation from '../hooks/useScrollAnimation';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  useScrollAnimation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await api.post('/auth/register', { name, email, password });
      // Post-registration login fix: auto login the user via AuthContext
      const success = await login(email, password);
      if (!success) {
        throw new Error('Auto-login failed after registration.');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed. Try a different email.');
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: 'var(--bg)' }}>
      {/* Left Sidebar */}
      <div style={{ flex: 1, background: 'linear-gradient(135deg, #1E1B4B 0%, #7C3AED 100%)', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '2rem', color: 'white' }} className="hidden md:flex">
        <div className="animate-on-scroll" style={{ textAlign: 'center', maxWidth: '400px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '24px', backgroundColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', border: '1px solid rgba(255,255,255,0.2)' }}>
            <Wallet className="w-10 h-10 text-white" />
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem', lineHeight: 1.2 }}>Start Your Journey Today</h1>
          <p style={{ fontSize: '1.125rem', color: '#E0E7FF', opacity: 0.9 }}>
            Join SmartSpend and experience a new, smarter way to manage your finances.
          </p>
        </div>
      </div>

      {/* Right Form Area */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div className="neu-card animate-on-scroll" style={{ width: '100%', maxWidth: '420px', padding: '3rem 2.5rem', background: 'var(--card-bg)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem', color: 'var(--primary)' }} className="md:hidden">
              <Wallet className="w-8 h-8" />
              <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>SmartSpend</span>
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--text)' }}>Create Account</h2>
            <p style={{ fontSize: '0.875rem', marginTop: '0.5rem', color: 'var(--muted)' }}>Join SmartSpend to track your finances</p>
          </div>

          {error && (
            <div style={{ padding: '1rem', marginBottom: '1.5rem', backgroundColor: '#FEE2E2', color: '#DC2626', borderRadius: '12px', fontSize: '0.875rem', textAlign: 'center', border: '1px solid #FCA5A5', fontWeight: '500' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text)' }}>Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="neu-input"
                placeholder="John Doe"
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text)' }}>Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="neu-input"
                placeholder="you@example.com"
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text)' }}>Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="neu-input"
                placeholder="••••••••"
                minLength={6}
                style={{ width: '100%' }}
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="neu-button neu-button-primary"
              style={{ width: '100%', marginTop: '1rem', padding: '14px', fontSize: '1rem', display: 'flex', justifyContent: 'center' }}
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.875rem', color: 'var(--muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 'bold', textDecoration: 'none' }}>
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
