import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react';
import useScrollAnimation from '../hooks/useScrollAnimation';

const LEAK_SEVERITY_COLORS = {
  LOW: { bg: '#D1FAE5', color: '#059669', border: '#10B981' },
  MEDIUM: { bg: '#FEF3C7', color: '#D97706', border: '#F59E0B' },
  HIGH: { bg: '#FEE2E2', color: '#DC2626', border: '#EF4444' }
};

const LEAK_TYPE_LABELS = {
  FREQUENT_SMALL_TRANSACTIONS: 'Small Transactions',
  CATEGORY_DOMINANCE: 'Category Overspending',
  SPENDING_VELOCITY: 'Spending Acceleration',
  WEEKEND_OVERSPEND: 'Weekend Spending',
  RECURRING_EXPENSE: 'Recurring Expense',
  DAILY_SPIKE: 'Spending Spike',
};

const Leaks = () => {
  const [leaks, setLeaks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();
  useScrollAnimation();

  useEffect(() => { fetchLeaks(); }, []);

  const fetchLeaks = async () => {
    try {
      const res = await api.get('/analysis/leaks');
      setLeaks(res.data);
    } catch (error) {
      console.error('Failed to fetch leaks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshAnalysis = async () => {
    setRefreshing(true);
    try {
      await api.get('/analysis/refresh');
      await fetchLeaks();
    } catch (error) {
      console.error('Failed to refresh analysis:', error);
    } finally {
      setRefreshing(false);
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
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>Money Leak Detection</h1>
          <p className="text-muted">Smart analysis of your spending patterns</p>
        </div>
        <button
          onClick={handleRefreshAnalysis}
          disabled={refreshing}
          className="neu-button"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Analyzing...' : 'Re-analyze'}
        </button>
      </div>

      <div className="neu-card animate-on-scroll delay-100" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: leaks.length > 0 ? 'rgba(251, 191, 36, 0.1)' : 'rgba(52, 211, 153, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {leaks.length > 0
            ? <AlertTriangle className="w-6 h-6 text-warning" />
            : <ShieldCheck className="w-6 h-6 text-success" />
          }
        </div>
        <div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600' }}>
            {leaks.length > 0 ? `${leaks.length} pattern${leaks.length > 1 ? 's' : ''} detected` : 'No leaks detected'}
          </h3>
          <p className="text-muted" style={{ fontSize: '0.875rem' }}>
            {leaks.length > 0
              ? 'Review each alert below and adjust your spending.'
              : 'Your spending habits look healthy!'}
          </p>
        </div>
      </div>

      {leaks.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {leaks.map((leak, i) => {
            const severityStyle = LEAK_SEVERITY_COLORS[leak.severity || 'LOW'];
            return (
              <div
                key={leak.id}
                className={`neu-card animate-on-scroll delay-${(i % 3 + 1) * 150}`}
                style={{ padding: '1.5rem', borderLeft: `6px solid ${severityStyle.border}` }}
              >
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <AlertTriangle className="w-6 h-6" style={{ color: severityStyle.color, marginTop: '2px' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <h4 style={{ fontWeight: '600', fontSize: '1.125rem' }}>
                        {LEAK_TYPE_LABELS[leak.type] || leak.type.replace(/_/g, ' ')}
                      </h4>
                      <span style={{ fontSize: '0.625rem', fontWeight: 'bold', padding: '2px 8px', borderRadius: '9999px', background: severityStyle.bg, color: severityStyle.color }}>
                        {leak.severity || 'LOW'}
                      </span>
                    </div>
                    <p style={{ color: 'var(--text)', lineHeight: '1.6', fontSize: '0.875rem', marginBottom: '0.5rem' }}>{leak.description}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                      Detected {new Date(leak.detectedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="neu-card animate-on-scroll delay-150" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(52, 211, 153, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <ShieldCheck className="w-8 h-8 text-success" />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>All clear!</h3>
          <p className="text-muted" style={{ maxWidth: '400px', margin: '0 auto 1.5rem' }}>
            Our smart engine analyzed your transactions and found no concerning spending patterns.
          </p>
          <button onClick={() => navigate('/expenses')} className="neu-button" style={{ fontSize: '0.875rem' }}>
            Go to Expenses
          </button>
        </div>
      )}
    </div>
  );
};

export default Leaks;
