import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, CreditCard, ArrowRight, AlertTriangle, ShieldCheck, Sparkles, Loader2, Zap } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import useScrollAnimation from '../hooks/useScrollAnimation';

const CATEGORY_COLORS_MAP = {
  Food: { bg: '#FFEDD5', color: '#C2410C' },
  Transport: { bg: '#DBEAFE', color: '#1D4ED8' },
  Shopping: { bg: '#FCE7F3', color: '#BE185D' },
  Bills: { bg: '#FEF3C7', color: '#B45309' },
  Entertainment: { bg: '#F3E8FF', color: '#7E22CE' },
  Others: { bg: '#F1F5F9', color: '#334155' },
  Utilities: { bg: '#CCFBF1', color: '#0F766E' }
};

const COLORS = ['#7C3AED', '#34D399', '#FBBF24', '#F87171', '#06B6D4', '#EC4899', '#8B5CF6'];

const Dashboard = () => {
  const [expenses, setExpenses] = useState([]);
  const [leaks, setLeaks] = useState([]);
  const [utilities, setUtilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiAdvice, setAiAdvice] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  useScrollAnimation();

  const handleGetAdvice = async () => {
    setAiLoading(true);
    try {
      const res = await api.get('/analysis/ai-advice');
      setAiAdvice(res.data.advice);
    } catch (error) {
      console.error('Failed to get advice:', error);
      setAiAdvice('Failed to get advice. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [expRes, leakRes, utilRes] = await Promise.all([
        api.get('/expenses'),
        api.get('/analysis/leaks'),
        api.get('/utilities/upcoming').catch(() => ({ data: [] }))
      ]);
      setExpenses(expRes.data);
      setLeaks(leakRes.data);
      setUtilities(utilRes.data || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const thisMonthExpenses = expenses.filter(exp => {
    const d = new Date(exp.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const lastMonthExpenses = expenses.filter(exp => {
    const d = new Date(exp.date);
    const lm = currentMonth === 0 ? 11 : currentMonth - 1;
    const ly = currentMonth === 0 ? currentYear - 1 : currentYear;
    return d.getMonth() === lm && d.getFullYear() === ly;
  });

  const monthlySpent = thisMonthExpenses.reduce((s, e) => s + e.amount, 0);
  const lastMonthSpent = lastMonthExpenses.reduce((s, e) => s + e.amount, 0);
  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);
  const percentChange = lastMonthSpent > 0 ? (((monthlySpent - lastMonthSpent) / lastMonthSpent) * 100).toFixed(1) : null;

  // 14-day trend
  const trendMap = {};
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    trendMap[key] = 0;
  }
  expenses.forEach(exp => {
    const d = new Date(exp.date);
    const diff = (now - d) / (1000 * 60 * 60 * 24);
    if (diff >= 0 && diff < 14) {
      const key = d.toLocaleDateString([], { month: 'short', day: 'numeric' });
      if (trendMap[key] !== undefined) trendMap[key] += exp.amount;
    }
  });
  const trendData = Object.entries(trendMap).map(([date, amount]) => ({ date, amount }));

  const categoryData = expenses.reduce((acc, curr) => {
    const existing = acc.find(item => item.name === curr.category);
    if (existing) existing.value += curr.amount;
    else acc.push({ name: curr.category, value: curr.amount });
    return acc;
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '16rem' }}>
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div className="animate-on-scroll">
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>Dashboard</h1>
          <p className="text-muted">{getGreeting()}, {user?.name} 👋</p>
        </div>
        <button className="neu-button neu-button-primary animate-on-scroll delay-100" onClick={() => navigate('/expenses')}>
          + Add Expense
        </button>
      </div>

      {/* 4 Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
        <div className="neu-card animate-on-scroll delay-100" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--muted)' }}>This Month</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: 'rgba(124, 58, 237, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
          </div>
          <p style={{ fontSize: '1.875rem', fontWeight: '900' }}>₹{monthlySpent.toFixed(2)}</p>
          {percentChange !== null && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: '600', marginTop: '8px', color: monthlySpent > lastMonthSpent ? 'var(--danger)' : 'var(--success)' }}>
              {monthlySpent > lastMonthSpent ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(percentChange)}% vs last month
            </div>
          )}
        </div>

        <div className="neu-card animate-on-scroll delay-150" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--muted)' }}>Total Spent</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: 'rgba(52, 211, 153, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CreditCard className="w-5 h-5 text-success" />
            </div>
          </div>
          <p style={{ fontSize: '1.875rem', fontWeight: '900' }}>₹{totalSpent.toFixed(2)}</p>
          <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '8px' }}>{expenses.length} total transactions</p>
        </div>

        <div className="neu-card animate-on-scroll delay-300" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--muted)' }}>Active Leaks</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: 'rgba(248, 113, 113, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle className="w-5 h-5 text-danger" />
            </div>
          </div>
          <p style={{ fontSize: '1.875rem', fontWeight: '900' }}>{leaks.length}</p>
          <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '8px' }}>Patterns detected</p>
        </div>

        <div className="neu-card animate-on-scroll delay-450" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--muted)' }}>Bills Due</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: 'rgba(251, 191, 36, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap className="w-5 h-5 text-warning" />
            </div>
          </div>
          <p style={{ fontSize: '1.875rem', fontWeight: '900' }}>{utilities.length}</p>
          <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '8px' }}>In next 7 days</p>
        </div>
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        <div className="neu-card animate-on-scroll" style={{ height: '24rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>Spending by Category</h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height="85%">
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={75} outerRadius={105} paddingAngle={4} dataKey="value">
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} contentStyle={{ borderRadius: '12px', border: 'none', background: 'var(--card-bg)' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>No spending data yet</div>
          )}
        </div>

        <div className="neu-card animate-on-scroll" style={{ height: '24rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>14-Day Spending Trend</h3>
          <ResponsiveContainer width="100%" height="85%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#D1C4E9" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} tickFormatter={(v) => `₹${v}`} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', background: 'var(--card-bg)' }} formatter={(v) => [`₹${v.toFixed(2)}`, 'Spent']} />
              <Line type="monotone" dataKey="amount" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4, fill: 'var(--primary)', strokeWidth: 2, stroke: 'var(--card-bg)' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        {/* Leaks */}
        <div className="neu-card animate-on-scroll">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '600' }}>Money Leak Detection</h3>
            <button onClick={() => navigate('/leaks')} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
              View All <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          {leaks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(52, 211, 153, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <ShieldCheck className="w-7 h-7 text-success" />
              </div>
              <h4 style={{ fontWeight: '600' }}>Great job!</h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--muted)', marginTop: '4px' }}>No significant spending leaks detected</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {leaks.slice(0, 3).map(leak => (
                <div key={leak.id} style={{ display: 'flex', gap: '12px', padding: '12px', background: 'rgba(248, 113, 113, 0.05)', borderRadius: '12px', border: '1px solid rgba(248, 113, 113, 0.2)' }}>
                  <AlertTriangle className="w-5 h-5 text-danger flex-shrink-0" />
                  <div>
                    <p style={{ fontWeight: '600', fontSize: '0.875rem', color: 'var(--danger)' }}>{leak.type.replace(/_/g, ' ')}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text)', marginTop: '4px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{leak.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Expenses */}
        <div className="neu-card animate-on-scroll">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '600' }}>Recent Expenses</h3>
            <button onClick={() => navigate('/expenses')} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
              View All <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {expenses.slice(0, 5).map(exp => {
              const catStyle = CATEGORY_COLORS_MAP[exp.category] || CATEGORY_COLORS_MAP.Others;
              return (
                <div key={exp.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', borderRadius: '12px', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.5)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: catStyle.bg, color: catStyle.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 'bold' }}>
                      {exp.category.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p style={{ fontWeight: '600', fontSize: '0.875rem' }}>{exp.description}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '2px' }}>{new Date(exp.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <p style={{ fontWeight: 'bold', color: 'var(--primary)' }}>₹{exp.amount.toFixed(2)}</p>
                </div>
              );
            })}
            {expenses.length === 0 && <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '2rem 0', fontSize: '0.875rem' }}>No expenses yet. Add your first one!</p>}
          </div>
        </div>
      </div>

      {/* AI Insights Panel */}
      <div className="animate-on-scroll" style={{
        background: 'linear-gradient(135deg, #1E1B4B 0%, #7C3AED 100%)',
        borderRadius: '20px',
        padding: '24px',
        boxShadow: '8px 8px 16px #D1C4E9, -8px -8px 16px #FFFFFF',
        color: 'white'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles className="w-5 h-5 text-accent" />
            AI Financial Advisor
            <span style={{ fontSize: '0.625rem', padding: '2px 8px', borderRadius: '9999px', background: 'rgba(255,255,255,0.2)', fontWeight: 'bold' }}>Powered by Gemini</span>
          </h3>
          <button onClick={handleGetAdvice} disabled={aiLoading} className="neu-button" style={{ padding: '8px 16px', fontSize: '0.875rem' }}>
            {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {aiLoading ? 'Analyzing...' : 'Get Advice'}
          </button>
        </div>
        
        {aiAdvice ? (
          <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '16px', backdropFilter: 'blur(10px)' }}>
            <p style={{ fontSize: '0.875rem', lineHeight: '1.6', whiteSpace: 'pre-line' }}>{aiAdvice}</p>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <Sparkles className="w-6 h-6 text-accent" />
            </div>
            <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.8)' }}>Ready to help you optimize your finances</p>
            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>Click "Get Advice" for personalized recommendations</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
