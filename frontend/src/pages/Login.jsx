import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Wallet } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.token, res.data.name);
    } catch (err) {
      setError('Invalid credentials. Please try again.');
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Left side form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-10 relative z-10">
        <div className="max-w-md w-full mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-blue-600 rounded-xl">
              <Wallet className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Smart Spend</h1>
          </div>
          
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Welcome back</h2>
          <p className="text-slate-500 mb-8">Enter your details to access your dashboard.</p>
          
          {error && <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-6 text-sm">{error}</div>}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
            >
              Sign In
            </button>
          </form>
          
          <p className="mt-8 text-center text-slate-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 font-semibold hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
      
      {/* Right side background */}
      <div className="hidden lg:block w-1/2 bg-gradient-to-br from-blue-600 to-indigo-800 rounded-l-[3rem] relative overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-white/10 backdrop-blur-3xl" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 20% 100%)' }}></div>
        <div className="absolute inset-0 flex flex-col justify-center items-center text-white p-16">
          <h2 className="text-5xl font-bold mb-6">Track. Analyze. Save.</h2>
          <p className="text-xl text-blue-100 text-center max-w-lg">
            Take control of your finances with smart analytics and automated leak detection.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
