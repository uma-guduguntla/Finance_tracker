import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, CreditCard, ArrowRight, AlertTriangle, ShieldCheck, Sparkles, Loader2 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const CATEGORY_COLORS_MAP = {
  Food: 'bg-orange-100 text-orange-700',
  Transport: 'bg-blue-100 text-blue-700',
  Shopping: 'bg-pink-100 text-pink-700',
  Bills: 'bg-yellow-100 text-yellow-700',
  Entertainment: 'bg-purple-100 text-purple-700',
  Others: 'bg-slate-100 text-slate-700',
};

const Dashboard = () => {
  const [expenses, setExpenses] = useState([]);
  const [leaks, setLeaks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiAdvice, setAiAdvice] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleGetAdvice = async () => {
    setAiLoading(true);
    try {
      const res = await api.get('/analysis/ai-advice');
      setAiAdvice(res.data.advice);
    } catch (err) {
      setAiAdvice('Failed to get advice. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [expRes, leakRes] = await Promise.all([
        api.get('/expenses'),
        api.get('/analysis/leaks'),
      ]);
      setExpenses(expRes.data);
      setLeaks(leakRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
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

  // Category data
  const categoryData = expenses.reduce((acc, curr) => {
    const existing = acc.find(item => item.name === curr.category);
    if (existing) existing.value += curr.amount;
    else acc.push({ name: curr.category, value: curr.amount });
    return acc;
  }, []);

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Dashboard</h1>
          <p className="text-slate-500 mt-1">Welcome back, {user?.name}</p>
        </div>
        <button
          onClick={() => navigate('/expenses')}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 hover:bg-indigo-700 transition shadow-md shadow-indigo-200 w-fit"
        >
          + Add Expense
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">This Month</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-indigo-600" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-800">${monthlySpent.toFixed(2)}</p>
          <p className="text-xs text-slate-400 mt-1">{thisMonthExpenses.length} transactions</p>
          {percentChange !== null && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${monthlySpent > lastMonthSpent ? 'text-red-500' : 'text-emerald-500'}`}>
              {monthlySpent > lastMonthSpent ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(percentChange)}% vs last month
            </div>
          )}
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Spent</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-800">${totalSpent.toFixed(2)}</p>
          <p className="text-xs text-slate-400 mt-1">{expenses.length} total transactions</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Money Leaks</span>
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-800">{leaks.length}</p>
          <p className="text-xs text-slate-400 mt-1">Patterns detected</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-96">
          <h3 className="text-base font-semibold text-slate-800 mb-4">Spending by Category</h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height="85%">
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={75} outerRadius={105} paddingAngle={4} dataKey="value">
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400">No spending data yet</div>
          )}
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-96">
          <h3 className="text-base font-semibold text-slate-800 mb-4">14-Day Spending Trend</h3>
          <ResponsiveContainer width="100%" height="85%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} formatter={(v) => [`$${v.toFixed(2)}`, 'Spent']} />
              <Line type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 3, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Money Leak Detection + Recent Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Money Leak Detection */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-semibold text-slate-800">Money Leak Detection</h3>
            <button
              onClick={() => navigate('/money-leaks')}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
            >
              View All <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          {leaks.length === 0 ? (
            <div className="flex flex-col items-center text-center py-6">
              <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mb-3">
                <ShieldCheck className="w-7 h-7 text-emerald-500" />
              </div>
              <h4 className="font-semibold text-slate-800">Great job!</h4>
              <p className="text-sm text-slate-500 mt-1">No significant spending leaks detected</p>
            </div>
          ) : (
            <div className="space-y-3">
              {leaks.slice(0, 3).map(leak => (
                <div key={leak.id} className="flex gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
                  <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm text-amber-900">{leak.type.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-amber-700 mt-0.5 line-clamp-2">{leak.explanation}</p>
                  </div>
                </div>
              ))}
              {leaks.length > 3 && (
                <p className="text-xs text-slate-400 text-center">+ {leaks.length - 3} more alerts</p>
              )}
            </div>
          )}
        </div>

        {/* Recent Expenses */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-semibold text-slate-800">Recent Expenses</h3>
            <button
              onClick={() => navigate('/expenses')}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
            >
              View All <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            {expenses.slice(0, 5).map(exp => (
              <div key={exp.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-500">
                    {exp.category.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-slate-800 text-sm">{exp.description}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${CATEGORY_COLORS_MAP[exp.category] || 'bg-slate-100 text-slate-600'}`}>
                        {exp.category}
                      </span>
                      <span className="text-[10px] text-slate-400">{new Date(exp.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>
                </div>
                <p className="font-bold text-slate-800">${exp.amount.toFixed(2)}</p>
              </div>
            ))}
            {expenses.length === 0 && <p className="text-slate-400 text-center py-8 text-sm">No expenses yet. Add your first one!</p>}
          </div>
        </div>
      </div>

      {/* AI Financial Advisor */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            AI Financial Advisor
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-600">Powered by Gemini</span>
          </h3>
          <button
            onClick={handleGetAdvice}
            disabled={aiLoading}
            className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {aiLoading ? 'Analyzing...' : 'Get Advice'}
          </button>
        </div>
        {aiAdvice ? (
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{aiAdvice}</p>
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-6 h-6 text-indigo-400" />
            </div>
            <p className="text-sm text-slate-500">Ready to help you optimize your finances</p>
            <p className="text-xs text-slate-400 mt-1">Click "Get Advice" for personalized recommendations</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
