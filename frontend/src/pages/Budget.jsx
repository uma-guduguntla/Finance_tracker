import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { PieChart, X, Target } from 'lucide-react';
import useScrollAnimation from '../hooks/useScrollAnimation';

const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Utilities', 'Others'];

const Budget = () => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [limit, setLimit] = useState('');
  useScrollAnimation();

  useEffect(() => { fetchBudgets(); }, []);

  const fetchBudgets = async () => {
    try {
      const res = await api.get('/budgets');
      setBudgets(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/budgets', { category, monthlyLimit: parseFloat(limit) });
      setShowForm(false);
      setCategory(CATEGORIES[0]);
      setLimit('');
      fetchBudgets();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '16rem' }}>
      <div className="animate-spin" style={{ width: '32px', height: '32px', border: '4px solid var(--primary)', borderBottomColor: 'transparent', borderRadius: '50%' }} />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="animate-on-scroll" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>Budget Tracking</h1>
          <p className="text-muted">Set monthly limits to stay in control</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="neu-button neu-button-primary">
          {showForm ? <X className="w-5 h-5" /> : '+ Add Budget'}
        </button>
      </div>

      {showForm && (
        <div className="neu-card animate-on-scroll delay-100" style={{ animation: 'fadeIn 0.2s ease-out' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Set Category Budget</h2>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="neu-input">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>Monthly Limit (₹)</label>
              <input type="number" required step="0.01" value={limit} onChange={e => setLimit(e.target.value)} className="neu-input" />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
              <button type="submit" className="neu-button neu-button-primary" style={{ width: '100%' }}>Save Budget</button>
            </div>
          </form>
        </div>
      )}

      {budgets.length === 0 ? (
        <div className="neu-card animate-on-scroll delay-150" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(124, 58, 237, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <Target className="w-8 h-8 text-primary" />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>No budgets set</h3>
          <p className="text-muted" style={{ maxWidth: '400px', margin: '0 auto' }}>
            Create a budget to track your spending and get alerts before you overspend.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {budgets.map((b, i) => {
            const ratio = b.spent / b.monthlyLimit;
            const percentage = Math.min(Math.round(ratio * 100), 100);
            let barColor = 'var(--success)';
            if (ratio >= 0.7 && ratio < 0.9) barColor = 'var(--warning)';
            if (ratio >= 0.9) barColor = 'var(--danger)';

            return (
              <div key={b.id} className={`neu-card animate-on-scroll delay-${(i % 3 + 1) * 150}`}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <PieChart className="w-5 h-5 text-primary" />
                    <h3 style={{ fontWeight: '600', fontSize: '1.125rem' }}>{b.category}</h3>
                  </div>
                  <span style={{ fontSize: '0.875rem', fontWeight: 'bold', color: barColor }}>
                    {percentage}%
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                  <span className="text-muted">Spent: <strong style={{ color: 'var(--text)' }}>₹{b.spent.toFixed(2)}</strong></span>
                  <span className="text-muted">Limit: <strong>₹{b.monthlyLimit.toFixed(2)}</strong></span>
                </div>

                <div style={{ height: '12px', background: 'rgba(255,255,255,0.5)', borderRadius: '9999px', overflow: 'hidden', boxShadow: 'inset 1px 1px 3px rgba(0,0,0,0.1)' }}>
                  <div style={{ 
                    height: '100%', 
                    background: barColor, 
                    width: `${percentage}%`,
                    transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
                    borderRadius: '9999px'
                  }} />
                </div>
                
                {ratio >= 0.9 && (
                  <p style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: '0.5rem', fontWeight: '600' }}>
                    Warning: You are near or over your budget limit!
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Budget;
