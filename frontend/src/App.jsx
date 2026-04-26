import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Analytics from './pages/Analytics';
import Leaks from './pages/Leaks';
import Budget from './pages/Budget';
import Utilities from './pages/Utilities';
import AIInsights from './pages/AIInsights';
import Recommendations from './pages/Recommendations';
import Landing from './pages/Landing';
import Layout from './components/Layout';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/leaks" element={<Leaks />} />
            <Route path="/budget" element={<Budget />} />
            <Route path="/utilities" element={<Utilities />} />
            <Route path="/ai" element={<AIInsights />} />
            <Route path="/recommendations" element={<Recommendations />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
