import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Zap, Plus, X, Smartphone, Home, Droplet, Wifi, Flame, MonitorPlay } from 'lucide-react';
import useScrollAnimation from '../hooks/useScrollAnimation';

const UTILITY_TYPES = [
  { id: 'ELECTRICITY', label: 'Electricity', icon: Zap },
  { id: 'MOBILE_RECHARGE', label: 'Mobile', icon: Smartphone },
  { id: 'MAID', label: 'House Help', icon: Home },
  { id: 'WATER', label: 'Water', icon: Droplet },
  { id: 'INTERNET', label: 'Internet', icon: Wifi },
  { id: 'GAS', label: 'Gas', icon: Flame },
  { id: 'OTT_SUBSCRIPTION', label: 'OTT', icon: MonitorPlay }
];

const Utilities = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState('ELECTRICITY');
  const [formAmount, setFormAmount] = useState('');
  const [formDueDate, setFormDueDate] = useState('');
  
  useScrollAnimation();

  useEffect(() => { fetchSummary(); }, []);

  const fetchSummary = async () => {
    try {
      const res = await api.get('/utilities/summary');
      setSummary(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUtility = async (e) => {
    e.preventDefault();
    try {
      await api.post('/utilities', {
        utilityType: formType,
        amount: parseFloat(formAmount),
        dueDate: formDueDate,
        billDate: new Date().toISOString().split('T')[0],
        isPaid: false
      });
      setShowForm(false);
      setFormAmount('');
      setFormDueDate('');
      fetchSummary();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkPaid = async (id) => {
    try {
      await api.patch(`/utilities/${id}/pay`);
      fetchSummary();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !summary) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '16rem' }}>
      <div className="animate-spin" style={{ width: '32px', height: '32px', border: '4px solid var(--primary)', borderBottomColor: 'transparent', borderRadius: '50%' }} />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {summary.upcomingDue && summary.upcomingDue.length > 0 && (
        <div className="animate-on-scroll" style={{ background: '#FEF3C7', border: '1px solid #F59E0B', padding: '1rem', borderRadius: '12px', color: '#92400E', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          ⚠️ You have {summary.upcomingDue.length} bill(s) due within the next 7 days.
        </div>
      )}

      <div className="animate-on-scroll" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>Utilities Tracker</h1>
          <p className="text-muted">Manage your monthly recurring bills</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="neu-button neu-button-primary">
          {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {showForm ? 'Cancel' : 'Add Bill'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        {UTILITY_TYPES.map((type, i) => {
          const Icon = type.icon;
          const data = summary.byType[type.id];
          const hasBill = data !== null;
          
          let statusBadge = { text: 'NOT ADDED', bg: 'rgba(107, 114, 128, 0.1)', color: '#6B7280' };
          if (hasBill) {
            if (data.isPaid) statusBadge = { text: 'PAID', bg: 'rgba(52, 211, 153, 0.1)', color: 'var(--success)' };
            else statusBadge = { text: 'UNPAID', bg: 'rgba(248, 113, 113, 0.1)', color: 'var(--danger)' };
          }

          return (
            <div key={type.id} className={`neu-card animate-on-scroll delay-${(i % 4) * 150}`}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(124, 58, 237, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 style={{ fontWeight: '600', fontSize: '1rem' }}>{type.label}</h3>
                </div>
                <span style={{ fontSize: '0.625rem', fontWeight: 'bold', padding: '4px 8px', borderRadius: '9999px', background: statusBadge.bg, color: statusBadge.color }}>
                  {statusBadge.text}
                </span>
              </div>
              
              <div style={{ marginTop: '1rem' }}>
                {hasBill ? (
                  <>
                    <p style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--text)' }}>₹{data.amount.toFixed(2)}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '4px' }}>Due: {data.dueDate}</p>
                    {!data.isPaid && (
                      <button onClick={() => handleMarkPaid(data.id)} className="neu-button" style={{ width: '100%', marginTop: '1rem', padding: '6px', fontSize: '0.875rem' }}>
                        Mark as Paid
                      </button>
                    )}
                  </>
                ) : (
                  <div style={{ height: '70px', display: 'flex', alignItems: 'center' }}>
                    <p style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>No bill added this month.</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(30, 27, 75, 0.5)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="neu-card" style={{ width: '100%', maxWidth: '500px', animation: 'fadeIn 0.2s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Add Utility Bill</h2>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}>
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddUtility} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>Utility Type</label>
                <select value={formType} onChange={e => setFormType(e.target.value)} className="neu-input">
                  {UTILITY_TYPES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>Amount (₹)</label>
                <input type="number" step="0.01" required value={formAmount} onChange={e => setFormAmount(e.target.value)} className="neu-input" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>Due Date</label>
                <input type="date" required value={formDueDate} onChange={e => setFormDueDate(e.target.value)} className="neu-input" />
              </div>
              <button type="submit" className="neu-button neu-button-primary" style={{ marginTop: '1rem' }}>Save Bill</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Utilities;
