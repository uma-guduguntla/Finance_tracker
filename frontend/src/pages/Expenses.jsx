import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Trash2, Edit2, Filter, X } from 'lucide-react';

const CATEGORIES = ['All', 'Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Others'];

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  
  // Filtering state
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterDate, setFilterDate] = useState('');

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES[1]);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchExpenses();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [expenses, filterCategory, filterDate]);

  const fetchExpenses = async () => {
    try {
      const res = await api.get('/expenses');
      setExpenses(res.data);
    } catch (error) {
      console.error('Failed to fetch expenses', error);
    }
  };

  const applyFilters = () => {
    let result = expenses;
    if (filterCategory !== 'All') {
      result = result.filter(e => e.category === filterCategory);
    }
    if (filterDate) {
      result = result.filter(e => e.date === filterDate);
    }
    setFilteredExpenses(result);
  };

  const resetForm = () => {
    setEditingId(null);
    setAmount('');
    setDescription('');
    setCategory(CATEGORIES[1]);
    setDate(new Date().toISOString().split('T')[0]);
    setShowForm(false);
  };

  const handleEditClick = (expense) => {
    setEditingId(expense.id);
    setAmount(expense.amount);
    setCategory(expense.category);
    setDescription(expense.description);
    setDate(expense.date);
    setShowForm(true);
  };

  const clearFilters = () => {
    setFilterCategory('All');
    setFilterDate('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { amount: parseFloat(amount), category, description, date };
    try {
      if (editingId) {
        await api.put(`/expenses/${editingId}`, payload);
      } else {
        await api.post('/expenses', payload);
      }
      resetForm();
      fetchExpenses();
    } catch (error) {
      console.error('Failed to save expense', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await api.delete(`/expenses/${id}`);
        fetchExpenses();
      } catch (error) {
        console.error('Failed to delete expense', error);
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
           <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Expenses</h1>
           <p className="text-slate-500 mt-1">Manage and track your transactions</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(!showForm); }}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-blue-700 transition shadow-sm w-full md:w-auto"
        >
          {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {showForm ? 'Cancel' : 'Add Expense'}
        </button>
      </div>

      {/* Filter Section */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row items-center gap-4 shadow-sm">
        <div className="flex items-center gap-2 text-slate-500 font-medium">
          <Filter className="w-5 h-5" /> Filters:
        </div>
        <select
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 bg-white"
        >
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <input
          type="date"
          value={filterDate}
          onChange={e => setFilterDate(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 bg-white text-slate-700"
        />
        {(filterCategory !== 'All' || filterDate) && (
          <button onClick={clearFilters} className="text-sm text-blue-600 hover:underline">
            Clear Filters
          </button>
        )}
      </div>

      {/* Form Section */}
      {showForm && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100 animate-in fade-in slide-in-from-top-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>
          <h2 className="text-lg font-bold text-slate-800 mb-4">{editingId ? 'Edit Expense' : 'New Expense'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Amount ($)</label>
              <input
                type="number" step="0.01" required value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
              <select
                value={category} onChange={e => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition bg-white"
              >
                {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
              <input
                type="text" required value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Date</label>
              <input
                type="date" required value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition bg-white text-slate-800"
              />
            </div>
            <div className="md:col-span-2 flex justify-end gap-3 pt-2">
              <button type="submit" className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition shadow-sm shadow-blue-200">
                {editingId ? 'Save Changes' : 'Add Transaction'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="py-4 px-6 font-medium text-slate-500 text-sm">Date</th>
              <th className="py-4 px-6 font-medium text-slate-500 text-sm">Description</th>
              <th className="py-4 px-6 font-medium text-slate-500 text-sm">Category</th>
              <th className="py-4 px-6 font-medium text-slate-500 text-sm text-right">Amount</th>
              <th className="py-4 px-6 font-medium text-slate-500 text-sm text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredExpenses.map((expense) => (
              <tr key={expense.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-4 px-6 text-slate-600">{new Date(expense.date).toLocaleDateString()}</td>
                <td className="py-4 px-6 font-medium text-slate-800">{expense.description}</td>
                <td className="py-4 px-6">
                  <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-full border border-blue-100">
                    {expense.category}
                  </span>
                </td>
                <td className="py-4 px-6 text-right font-medium text-slate-800">${expense.amount.toFixed(2)}</td>
                <td className="py-4 px-6 text-center space-x-2">
                  <button onClick={() => handleEditClick(expense)} className="text-slate-400 hover:text-blue-500 transition-colors bg-white p-2 rounded-lg hover:bg-blue-50">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(expense.id)} className="text-slate-400 hover:text-red-500 transition-colors bg-white p-2 rounded-lg hover:bg-red-50">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {filteredExpenses.length === 0 && (
              <tr>
                <td colSpan="5" className="py-12 text-center text-slate-500">
                  No expenses found matching the criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Expenses;
