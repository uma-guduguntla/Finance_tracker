import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react';

const LEAK_TYPE_COLORS = {
  FREQUENT_SMALL_TRANSACTIONS: 'border-orange-200 bg-orange-50',
  CATEGORY_DOMINANCE: 'border-red-200 bg-red-50',
  SPENDING_VELOCITY: 'border-purple-200 bg-purple-50',
  WEEKEND_OVERSPEND: 'border-blue-200 bg-blue-50',
  RECURRING_EXPENSE: 'border-amber-200 bg-amber-50',
  DAILY_SPIKE: 'border-pink-200 bg-pink-50',
};

const LEAK_TYPE_LABELS = {
  FREQUENT_SMALL_TRANSACTIONS: 'Small Transactions',
  CATEGORY_DOMINANCE: 'Category Overspending',
  SPENDING_VELOCITY: 'Spending Acceleration',
  WEEKEND_OVERSPEND: 'Weekend Spending',
  RECURRING_EXPENSE: 'Recurring Expense',
  DAILY_SPIKE: 'Spending Spike',
};

const MoneyLeaks = () => {
  const [leaks, setLeaks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

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
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Money Leak Detection</h1>
          <p className="text-slate-500 mt-1">Smart analysis of your spending patterns to find hidden leaks</p>
        </div>
        <button
          onClick={handleRefreshAnalysis}
          disabled={refreshing}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 hover:bg-indigo-700 transition shadow-md shadow-indigo-200 w-fit disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Analyzing...' : 'Re-analyze'}
        </button>
      </div>

      {/* Summary */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${leaks.length > 0 ? 'bg-amber-100' : 'bg-emerald-100'}`}>
            {leaks.length > 0
              ? <AlertTriangle className="w-6 h-6 text-amber-600" />
              : <ShieldCheck className="w-6 h-6 text-emerald-600" />
            }
          </div>
          <div>
            <h3 className="font-semibold text-lg text-slate-800">
              {leaks.length > 0 ? `${leaks.length} spending pattern${leaks.length > 1 ? 's' : ''} detected` : 'No leaks detected'}
            </h3>
            <p className="text-sm text-slate-500">
              {leaks.length > 0
                ? 'Review each alert below and consider adjusting your spending habits.'
                : 'Your spending habits look healthy. Keep it up!'}
            </p>
          </div>
        </div>
      </div>

      {/* Leak Cards */}
      {leaks.length > 0 ? (
        <div className="space-y-4">
          {leaks.map(leak => (
            <div
              key={leak.id}
              className={`p-5 rounded-2xl border shadow-sm ${LEAK_TYPE_COLORS[leak.type] || 'border-slate-200 bg-slate-50'}`}
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-slate-800">
                      {LEAK_TYPE_LABELS[leak.type] || leak.type.replace(/_/g, ' ')}
                    </h4>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/50 text-slate-600 border border-slate-200">
                      {leak.type}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">{leak.explanation}</p>
                  <p className="text-xs text-slate-400 mt-2">
                    Detected {new Date(leak.detectedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-2xl border border-slate-100 shadow-sm text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8 text-emerald-500" />
          </div>
          <h3 className="text-xl font-semibold text-slate-800">All clear!</h3>
          <p className="text-slate-500 mt-2 max-w-md mx-auto">
            Our smart engine analyzed your transactions and found no concerning spending patterns.
            Keep tracking your expenses and we'll alert you if anything changes.
          </p>
          <button
            onClick={() => navigate('/expenses')}
            className="mt-6 text-indigo-600 font-medium hover:text-indigo-700 text-sm"
          >
            Go to Expenses →
          </button>
        </div>
      )}
    </div>
  );
};

export default MoneyLeaks;
