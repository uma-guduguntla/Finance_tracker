import React, { useEffect, useState, useContext } from 'react';
import api from '../services/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { TrendingDown, Calendar } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Dashboard = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const expRes = await api.get('/expenses');
      setExpenses(expRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const thisMonthExpenses = expenses.filter(exp => {
    const d = new Date(exp.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const totalSpent = expenses.reduce((sum, item) => sum + item.amount, 0);
  const monthlySpent = thisMonthExpenses.reduce((sum, item) => sum + item.amount, 0);

  // Group by category for pie chart
  const categoryData = expenses.reduce((acc, curr) => {
    const existing = acc.find(item => item.name === curr.category);
    if (existing) {
      existing.value += curr.amount;
    } else {
      acc.push({ name: curr.category, value: curr.amount });
    }
    return acc;
  }, []);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Dashboard</h1>
        <p className="text-slate-500 mt-1">Welcome back, {user?.name}. Here's what's happening with your money.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 text-blue-50 opacity-50">
            <Calendar className="w-32 h-32" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <TrendingDown className="w-5 h-5" />
              </div>
              <h3 className="text-slate-500 font-medium">Monthly Spending</h3>
            </div>
            <p className="text-4xl font-bold text-slate-800">${monthlySpent.toFixed(2)}</p>
            <p className="text-sm text-slate-400 mt-2">In {currentDate.toLocaleString('default', { month: 'long' })}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <TrendingDown className="w-5 h-5" />
            </div>
            <h3 className="text-slate-500 font-medium">Total Lifetime Spent</h3>
          </div>
          <p className="text-4xl font-bold text-slate-800">${totalSpent.toFixed(2)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-96">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">Spending by Category</h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height="85%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400">No data available</div>
          )}
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-slate-800">Recent Transactions</h3>
          </div>
          <div className="space-y-4">
            {expenses.slice(0, 7).map(exp => (
              <div key={exp.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-sm">
                    {exp.category.substring(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">{exp.description}</p>
                    <p className="text-xs text-slate-500">{new Date(exp.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="font-semibold text-slate-800">
                  ${exp.amount.toFixed(2)}
                </div>
              </div>
            ))}
            {expenses.length === 0 && <p className="text-slate-500 text-center py-8">No recent transactions.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
