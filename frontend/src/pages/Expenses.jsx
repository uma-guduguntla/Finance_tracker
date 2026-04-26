import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Trash2, Edit2, Filter, X } from 'lucide-react';
import useScrollAnimation from '../hooks/useScrollAnimation';

const CATEGORIES = ['All', 'Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Utilities', 'Others'];

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

  useScrollAnimation();

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
    <div className="max-w-6xl mx-auto" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="animate-on-scroll" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
           <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>Expenses</h1>
           <p className="text-muted">Manage and track your transactions</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(!showForm); }}
          className="neu-button neu-button-primary"
        >
          {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {showForm ? 'Cancel' : 'Add Expense'}
        </button>
      </div>

      {/* Filter Section */}
      <div className="neu-card animate-on-scroll delay-100" style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', padding: '1rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600', color: 'var(--primary)' }}>
          <Filter className="w-5 h-5" /> Filters:
        </div>
        <select
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
          className="neu-input"
          style={{ width: 'auto', padding: '8px 12px' }}
        >
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <input
          type="date"
          value={filterDate}
          onChange={e => setFilterDate(e.target.value)}
          className="neu-input"
          style={{ width: 'auto', padding: '8px 12px' }}
        />
        {(filterCategory !== 'All' || filterDate) && (
          <button onClick={clearFilters} style={{ background: 'none', border: 'none', color: 'var(--danger)', fontWeight: '600', cursor: 'pointer', padding: '8px' }}>
            Clear Filters
          </button>
        )}
      </div>

      {/* Table Section */}
      <div className="neu-card animate-on-scroll delay-150" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid rgba(124, 58, 237, 0.1)' }}>
                <th style={{ padding: '1rem 1.5rem', fontWeight: '600', color: 'var(--muted)', fontSize: '0.875rem' }}>Date</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: '600', color: 'var(--muted)', fontSize: '0.875rem' }}>Description</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: '600', color: 'var(--muted)', fontSize: '0.875rem' }}>Category</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: '600', color: 'var(--muted)', fontSize: '0.875rem', textAlign: 'right' }}>Amount</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: '600', color: 'var(--muted)', fontSize: '0.875rem', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.map((expense) => (
                <tr key={expense.id} style={{ borderBottom: '1px solid rgba(124, 58, 237, 0.05)', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--card-bg)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '1rem 1.5rem', color: 'var(--text)' }}>{new Date(expense.date).toLocaleDateString()}</td>
                  <td style={{ padding: '1rem 1.5rem', fontWeight: '600' }}>{expense.description}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span style={{ padding: '4px 12px', background: 'rgba(124, 58, 237, 0.1)', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: '600', borderRadius: '9999px' }}>
                      {expense.category}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'right', fontWeight: 'bold' }}>₹{expense.amount.toFixed(2)}</td>
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>
                    <button onClick={() => handleEditClick(expense)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: 'var(--primary)' }}>
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(expense.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: 'var(--danger)' }}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredExpenses.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted)' }}>
                    No expenses found matching the criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(30, 27, 75, 0.5)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="neu-card" style={{ width: '100%', maxWidth: '600px', animation: 'fadeIn 0.2s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{editingId ? 'Edit Expense' : 'New Expense'}</h2>
              <button onClick={resetForm} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}>
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>Amount (₹)</label>
                <input
                  type="number" step="0.01" required value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="neu-input"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>Category</label>
                <select
                  value={category} onChange={e => setCategory(e.target.value)}
                  className="neu-input"
                >
                  {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>Description</label>
                <input
                  type="text" required value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="neu-input"
                />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>Date</label>
                <input
                  type="date" required value={date}
                  onChange={e => setDate(e.target.value)}
                  className="neu-input"
                />
              </div>
              <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={resetForm} className="neu-button" style={{ fontWeight: '600' }}>Cancel</button>
                <button type="submit" className="neu-button neu-button-primary">
                  {editingId ? 'Save Changes' : 'Add Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
