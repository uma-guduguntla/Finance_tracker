import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, TrendingDown, Calendar, DollarSign, CreditCard, AlertCircle } from 'lucide-react';

const NON_ESSENTIAL = ['Shopping', 'Entertainment', 'Others'];

const Analytics = () => {
  const [leaks, setLeaks] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

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
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Spending Analytics</h1>
        <p className="text-slate-500 mt-1">Deep insights into your financial behavior</p>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">30-Day Total</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-indigo-600" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-800">${total30.toFixed(2)}</p>
          {percentChange30 !== null && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${total30 > totalPrev30 ? 'text-red-500' : 'text-emerald-500'}`}>
              {total30 > totalPrev30 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(percentChange30)}% vs last period
            </div>
          )}
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Daily Average</span>
            <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-800">${dailyAvg.toFixed(2)}</p>
          <p className="text-xs text-slate-400 mt-1">{last30.length} transactions</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Essential</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-800">${essentialSpent.toFixed(2)}</p>
          <p className="text-xs text-slate-400 mt-1">{essentialPercent}% of total</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Non-Essential</span>
            <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-orange-500" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-800">${nonEssentialSpent.toFixed(2)}</p>
          <p className="text-xs text-slate-400 mt-1">{nonEssentialPercent}% of total</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-96">
          <h3 className="text-base font-semibold text-slate-800 mb-4">Category Distribution</h3>
          {categoryBarData.length > 0 ? (
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={categoryBarData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#334155', fontSize: 12, fontWeight: 500 }} width={90} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} formatter={(v) => [`$${v.toFixed(2)}`, 'Amount']} />
                <Bar dataKey="value" fill="#6366f1" radius={[0, 8, 8, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400">No spending data yet</div>
          )}
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-96">
          <h3 className="text-base font-semibold text-slate-800 mb-4">Weekly Spending Trend</h3>
          <ResponsiveContainer width="100%" height="85%">
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} formatter={(v) => [`$${v.toFixed(2)}`, 'Spent']} />
              <Line type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row: Spending Alerts + Top Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spending Alerts (from rule-based backend engine) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-base font-semibold text-slate-800 mb-4">Spending Alerts</h3>
          {leaks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-500 text-sm">No spending alerts right now. Your habits look good.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {leaks.map(leak => (
                <div key={leak.id} className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <h4 className="font-semibold text-amber-900 text-sm">{leak.type.replace(/_/g, ' ')}</h4>
                  </div>
                  <p className="text-sm text-amber-800 leading-relaxed">{leak.explanation}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Categories */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-base font-semibold text-slate-800 mb-4">Top Spending</h3>
          <div className="space-y-4">
            {topCategories.map((cat, i) => {
              const colors = ['bg-indigo-50 text-indigo-700 border-indigo-100', 'bg-emerald-50 text-emerald-700 border-emerald-100', 'bg-amber-50 text-amber-700 border-amber-100'];
              return (
                <div key={cat.name} className={`p-4 rounded-xl border ${colors[i]}`}>
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">#{i + 1}</p>
                  <h4 className="text-lg font-bold mt-1">{cat.name}</h4>
                  <p className="text-2xl font-black mt-1">${cat.value.toFixed(2)}</p>
                </div>
              );
            })}
            {topCategories.length === 0 && (
              <div className="text-center py-8 text-slate-400 text-sm border border-dashed border-slate-200 rounded-xl">
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
