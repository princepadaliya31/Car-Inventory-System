import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, role } = response.data;
      login(token, role, email);
      if (role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || 
        err.response?.data?.error || 
        (err.message === 'Network Error' 
          ? 'Cannot connect to server. Please check if the backend is running.' 
          : 'Invalid credentials. Please try again.')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-4 py-12 bg-[#fafafa] font-sans">
      
      {/* 1. Logo */}
      <div className="flex items-center space-x-2.5 mb-8 select-none">
        <div className="w-7 h-7 bg-red-600 rounded flex items-center justify-center text-white shrink-0 shadow-sm">
          <span className="text-[10px] font-black leading-none">▲</span>
        </div>
        <span className="text-lg font-black tracking-tight text-slate-950">
          Apex.
        </span>
      </div>

      <div className="w-full max-w-sm flex flex-col">
        
        {/* 2. Switcher tabs */}
        <div className="w-full bg-slate-100 p-1 rounded-2xl flex mb-8 select-none border border-slate-200/40">
          <Link
            to="/login"
            className="flex-1 text-center py-2 rounded-xl text-xs font-black transition-all bg-red-600 text-white shadow-sm shadow-red-500/10"
          >
            Sign in
          </Link>
          <Link
            to="/register"
            className="flex-1 text-center py-2 rounded-xl text-xs font-bold transition-all text-slate-500 hover:text-slate-800"
          >
            Create account
          </Link>
        </div>

        {/* Status Alerts */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs flex items-center space-x-2 animate-pulse">
            <AlertTriangle size={15} />
            <span>{error}</span>
          </div>
        )}

        {/* 3. Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email field */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-800 block">
              Email address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-slate-800 placeholder-slate-450 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/20 transition-all text-xs shadow-sm"
            />
          </div>

          {/* Password field */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-800 block">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-slate-800 placeholder-slate-450 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/20 transition-all text-xs shadow-sm"
            />
          </div>

          {/* Remember me & Forgot password */}
          <div className="flex items-center justify-between text-xs text-slate-500 py-0.5">
            <label className="flex items-center space-x-2 cursor-pointer select-none">
              <input
                type="checkbox"
                className="rounded border-slate-300 text-slate-600 focus:ring-0 focus:ring-offset-0 w-4 h-4 cursor-pointer"
              />
              <span className="font-bold text-slate-500">Remember me</span>
            </label>
            <button
              type="button"
              onClick={() => alert("Please contact support at admin@velocity.com")}
              className="hover:underline font-bold text-slate-700 cursor-pointer text-right"
            >
              Forgot password?
            </button>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-extrabold py-3.5 rounded-2xl transition-all text-xs tracking-wider shadow-md shadow-red-600/10 active:scale-[0.98] mt-2 flex items-center justify-center cursor-pointer select-none"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>
            ) : (
              <span>Sign in</span>
            )}
          </button>
        </form>

        {/* 4. Footer Home Redirect Link */}
        <Link
          to="/"
          className="mt-8 self-center text-xs font-bold text-slate-450 hover:text-slate-700 flex items-center space-x-1.5 transition-colors"
        >
          <ArrowLeft size={13} />
          <span>Back to home</span>
        </Link>

      </div>
    </div>
  );
};
