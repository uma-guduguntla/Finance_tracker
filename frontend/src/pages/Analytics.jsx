import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, TrendingDown, Calendar, DollarSign, CreditCard, AlertCircle } from 'lucide-react';
import useScrollAnimation from '../hooks/useScrollAnimation';

const NON_ESSENTIAL = ['Shopping', 'Entertainment', 'Others'];

const Analytics = () => {
  const [leaks, setLeaks] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  useScrollAnimation();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [leakRes, expRes] = await Promise.all([
        api.get('/analysis/leaks'),
        api.get('/expenses')
      ]);
      setLeaks(leakRes.data);
      setExpenses(expRes.data);
    } catch (error) {
      console.error('Failed to fetch analytics', error);
    } finally {
      setLoading(false);
    }
  };

  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const sixtyDaysAgo = new Date(now);
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

  const last30 = expenses.filter(e => new Date(e.date) >= thirtyDaysAgo);
  const prev30 = expenses.filter(e => { const d = new Date(e.date); return d >= sixtyDaysAgo && d < thirtyDaysAgo; });

  const total30 = last30.reduce((s, e) => s + e.amount, 0);
  const totalPrev30 = prev30.reduce((s, e) => s + e.amount, 0);
  const percentChange30 = totalPrev30 > 0 ? (((total30 - totalPrev30) / totalPrev30) * 100).toFixed(1) : null;

  const dailyAvg = total30 / 30;
  const essentialSpent = last30.filter(e => !NON_ESSENTIAL.includes(e.category)).reduce((s, e) => s + e.amount, 0);
  const nonEssentialSpent = last30.filter(e => NON_ESSENTIAL.includes(e.category)).reduce((s, e) => s + e.amount, 0);
  const essentialPercent = total30 > 0 ? ((essentialSpent / total30) * 100).toFixed(0) : 0;
  const nonEssentialPercent = total30 > 0 ? ((nonEssentialSpent / total30) * 100).toFixed(0) : 0;

  // Weekly spending trend (last 4 weeks)
  const weeklyData = [];
  for (let i = 3; i >= 0; i--) {
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - (i + 1) * 7);
    const weekEnd = new Date(now);
    weekEnd.setDate(weekEnd.getDate() - i * 7);
    const total = expenses.filter(e => {
      const d = new Date(e.date);
      return d >= weekStart && d < weekEnd;
    }).reduce((s, e) => s + e.amount, 0);
    weeklyData.push({ week: `Week ${4 - i}`, amount: total });
  }

  // Category breakdown for bar chart
  const categoryMap = {};
  last30.forEach(exp => {
    categoryMap[exp.category] = (categoryMap[exp.category] || 0) + exp.amount;
  });
  const categoryBarData = Object.entries(categoryMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const topCategories = categoryBarData.slice(0, 3);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '16rem' }}>
      <div className="animate-spin" style={{ width: '32px', height: '32px', border: '4px solid var(--primary)', borderBottomColor: 'transparent', borderRadius: '50%' }} />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="animate-on-scroll">
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>Spending Analytics</h1>
        <p className="text-muted">Deep insights into your financial behavior</p>
      </div>

      {/* 4 Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
        <div className="neu-card animate-on-scroll delay-100" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--muted)' }}>30-Day Total</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: 'rgba(124, 58, 237, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
          </div>
          <p style={{ fontSize: '1.875rem', fontWeight: '900' }}>₹{total30.toFixed(2)}</p>
          {percentChange30 !== null && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: '600', marginTop: '8px', color: total30 > totalPrev30 ? 'var(--danger)' : 'var(--success)' }}>
              {total30 > totalPrev30 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(percentChange30)}% vs last period
            </div>
          )}
        </div>

        <div className="neu-card animate-on-scroll delay-150" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--muted)' }}>Daily Average</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: 'rgba(6, 182, 212, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar className="w-5 h-5 text-secondary" />
            </div>
          </div>
          <p style={{ fontSize: '1.875rem', fontWeight: '900' }}>₹{dailyAvg.toFixed(2)}</p>
          <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '8px' }}>{last30.length} transactions</p>
        </div>

        <div className="neu-card animate-on-scroll delay-300" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--muted)' }}>Essential</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: 'rgba(52, 211, 153, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CreditCard className="w-5 h-5 text-success" />
            </div>
          </div>
          <p style={{ fontSize: '1.875rem', fontWeight: '900' }}>₹{essentialSpent.toFixed(2)}</p>
          <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '8px' }}>{essentialPercent}% of total</p>
        </div>

        <div className="neu-card animate-on-scroll delay-450" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--muted)' }}>Non-Essential</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: 'rgba(251, 191, 36, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingDown className="w-5 h-5 text-warning" />
            </div>
          </div>
          <p style={{ fontSize: '1.875rem', fontWeight: '900' }}>₹{nonEssentialSpent.toFixed(2)}</p>
          <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '8px' }}>{nonEssentialPercent}% of total</p>
        </div>
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        <div className="neu-card animate-on-scroll" style={{ height: '24rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>Category Distribution</h3>
          {categoryBarData.length > 0 ? (
            <div style={{ minHeight: '320px' }}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryBarData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#D1C4E9" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} tickFormatter={(v) => `₹${v}`} />
                  <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#1F2937', fontSize: 12, fontWeight: 500 }} width={90} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', background: 'var(--card-bg)' }} formatter={(v) => [`₹${v.toFixed(2)}`, 'Amount']} />
                  <Bar dataKey="value" fill="var(--primary)" radius={[0, 8, 8, 0]} barSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>No spending data yet</div>
          )}
        </div>

        <div className="neu-card animate-on-scroll" style={{ height: '24rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>Weekly Spending Trend</h3>
          {weeklyData.length > 0 ? (
            <div style={{ minHeight: '320px' }}>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#D1C4E9" />
                  <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} tickFormatter={(v) => `₹${v}`} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', background: 'var(--card-bg)' }} formatter={(v) => [`₹${v.toFixed(2)}`, 'Spent']} />
                  <Line type="monotone" dataKey="amount" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4, fill: 'var(--primary)', strokeWidth: 2, stroke: 'var(--card-bg)' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>No spending data yet</div>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <div className="neu-card animate-on-scroll" style={{ gridColumn: 'span 2' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>Spending Alerts</h3>
          {leaks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>No spending alerts right now. Your habits look good.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {leaks.map(leak => (
                <div key={leak.id} style={{ padding: '1rem', background: 'rgba(251, 191, 36, 0.1)', borderRadius: '12px', border: '1px solid rgba(251, 191, 36, 0.2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <AlertCircle className="w-4 h-4 text-warning" />
                    <h4 style={{ fontWeight: '600', color: '#92400E', fontSize: '0.875rem' }}>{leak.type.replace(/_/g, ' ')}</h4>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: '#B45309', lineHeight: '1.5' }}>{leak.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="neu-card animate-on-scroll">
          <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>Top Spending</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {topCategories.map((cat, i) => {
              const colors = [
                { bg: 'rgba(124, 58, 237, 0.1)', border: 'rgba(124, 58, 237, 0.2)', text: 'var(--primary)' },
                { bg: 'rgba(52, 211, 153, 0.1)', border: 'rgba(52, 211, 153, 0.2)', text: 'var(--success)' },
                { bg: 'rgba(251, 191, 36, 0.1)', border: 'rgba(251, 191, 36, 0.2)', text: 'var(--warning)' }
              ];
              const c = colors[i] || colors[0];
              return (
                <div key={cat.name} style={{ padding: '1rem', borderRadius: '12px', background: c.bg, border: `1px solid ${c.border}` }}>
                  <p style={{ fontSize: '0.625rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.7, color: c.text }}>#{i + 1}</p>
                  <h4 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginTop: '4px', color: c.text }}>{cat.name}</h4>
                  <p style={{ fontSize: '1.5rem', fontWeight: '900', marginTop: '4px', color: c.text }}>₹{cat.value.toFixed(2)}</p>
                </div>
              );
            })}
            {topCategories.length === 0 && (
              <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--muted)', fontSize: '0.875rem', border: '1px dashed #D1C4E9', borderRadius: '12px' }}>
                Add expenses to see rankings
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
