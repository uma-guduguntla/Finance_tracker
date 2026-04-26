import React, { useState } from 'react';
import api from '../services/api';
import { Sparkles, Loader2, Bot, BrainCircuit } from 'lucide-react';
import useScrollAnimation from '../hooks/useScrollAnimation';

const AIInsights = () => {
  const [advice, setAdvice] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  useScrollAnimation();

  const handleGetAdvice = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await api.get('/analysis/ai-advice');
      setAdvice(res.data.advice);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="animate-on-scroll">
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>AI Financial Advisor</h1>
        <p className="text-muted">Personalized financial guidance powered by Gemini</p>
      </div>

      <div className="neu-card animate-on-scroll delay-100" style={{ 
        background: 'linear-gradient(135deg, #1E1B4B 0%, #7C3AED 100%)',
        color: 'white',
        padding: '3rem 2rem',
        textAlign: 'center'
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}>
            <BrainCircuit className="w-10 h-10 text-accent" />
          </div>
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Get Your Comprehensive Financial Report</h2>
        <p style={{ maxWidth: '600px', margin: '0 auto 2rem', color: '#C7D2FE', lineHeight: '1.6' }}>
          Our AI analyzes your spending history, active leaks, upcoming utilities, and monthly budgets to give you actionable advice tailored to your exact situation.
        </p>
        <button 
          onClick={handleGetAdvice} 
          disabled={loading}
          className="neu-button"
          style={{ padding: '1rem 2.5rem', fontSize: '1.125rem' }}
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
          {loading ? 'Analyzing Your Finances...' : 'Generate AI Report'}
        </button>
      </div>

      {error && (
        <div className="animate-on-scroll" style={{ padding: '1rem', background: '#FEE2E2', color: '#DC2626', borderRadius: '12px', textAlign: 'center', border: '1px solid #FCA5A5' }}>
          Failed to generate advice. Please ensure your backend is connected and configured with a Gemini API key.
        </div>
      )}

      {advice && !loading && (
        <div className="neu-card animate-on-scroll delay-150" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(124, 58, 237, 0.1)', paddingBottom: '1rem' }}>
            <Bot className="w-6 h-6 text-primary" />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Your Financial Strategy</h3>
          </div>
          <div style={{ fontSize: '1rem', lineHeight: '1.8', color: 'var(--text)', whiteSpace: 'pre-line' }}>
            {advice}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIInsights;
