import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertCircle, TrendingUp, ShieldAlert, Sparkles } from 'lucide-react';

const Analytics = () => {
  const [leaks, setLeaks] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

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

  // Process data for trend chart (grouping expenses by date)
  const trendDataMap = {};
  expenses.forEach(exp => {
    const d = new Date(exp.date).toLocaleDateString([], { month: 'short', day: 'numeric' });
    trendDataMap[d] = (trendDataMap[d] || 0) + exp.amount;
  });

  // Sort by date (requires parsing dates correctly or assuming chronological insertion)
  // For simplicity, let's reverse sort the keys if we want chronological since expenses come desc
  const sortedDates = expenses.sort((a,b) => new Date(a.date) - new Date(b.date));
  const trendData = [];
  const processedDates = new Set();
  
  sortedDates.forEach(exp => {
    const d = new Date(exp.date).toLocaleDateString([], { month: 'short', day: 'numeric' });
    if (!processedDates.has(d)) {
      processedDates.add(d);
      trendData.push({ date: d, amount: trendDataMap[d] });
    }
  });

  // Top spending categories
  const categoryMap = {};
  expenses.forEach(exp => {
    categoryMap[exp.category] = (categoryMap[exp.category] || 0) + exp.amount;
  });
  const topCategories = Object.entries(categoryMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 3); // Top 3

  if (loading) return <div className="p-8">Loading Analytics...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Analytics & AI</h1>
        <p className="text-slate-500 mt-1">Deep dive into your spending habits and AI detected leaks.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Money Leaks Section */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-500" />
                AI Leak Detection
              </h3>
            </div>
            
            {leaks.length === 0 ? (
              <div className="text-emerald-700 bg-emerald-50 border border-emerald-100 p-5 rounded-xl flex flex-col items-center text-center gap-3">
                <ShieldAlert className="w-8 h-8 text-emerald-500 mb-2" />
                <h4 className="font-semibold text-lg">No Leaks Detected</h4>
                <p className="text-sm opacity-90">Your spending habits are optimal. Keep it up!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {leaks.map(leak => (
                  <div key={leak.id} className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-5 h-5 text-amber-600" />
                      <h4 className="font-semibold text-amber-900 text-sm">
                        {leak.type.replace(/_/g, ' ')}
                      </h4>
                    </div>
                    <p className="text-sm text-amber-800 opacity-90 leading-relaxed">
                      {leak.explanation}
                    </p>
                    <p className="text-xs text-amber-600 mt-3 font-medium">
                      Detected {new Date(leak.detectedAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Charts & Trends Section */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              Spending Trends
            </h3>
            <div className="h-72 w-full">
              {trendData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 12 }} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      tickFormatter={(val) => `$${val}`}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(value) => [`$${value.toFixed(2)}`, 'Spent']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="#3b82f6" 
                      strokeWidth={3} 
                      dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} 
                      activeDot={{ r: 6 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400">Not enough data to map trends</div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             {topCategories.map((cat, i) => (
                <div key={cat.name} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Top Category #{i+1}</p>
                  <h4 className="text-xl font-bold text-slate-800 truncate" title={cat.name}>{cat.name}</h4>
                  <p className="text-2xl font-black text-indigo-600 mt-2">${cat.value.toFixed(2)}</p>
                </div>
             ))}
             {topCategories.length === 0 && (
                <div className="col-span-3 text-center p-8 border border-dashed border-slate-300 rounded-2xl text-slate-500">
                  Add expenses to see your top categories
                </div>
             )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Analytics;
