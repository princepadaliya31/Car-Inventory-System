import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { AlertTriangle, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.post('/auth/register', { name, email, password });
      setSuccess(response.data.message || 'Registration successful! Redirecting...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setError(
        err.response?.data?.message || 
        err.response?.data?.error || 
        (err.message === 'Network Error' 
          ? 'Cannot connect to server. Please check if the backend is running.' 
          : 'Registration failed. Please try again.')
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
            className="flex-1 text-center py-2 rounded-xl text-xs font-bold transition-all text-slate-500 hover:text-slate-800"
          >
            Sign in
          </Link>
          <Link
            to="/register"
            className="flex-1 text-center py-2 rounded-xl text-xs font-black transition-all bg-red-600 text-white shadow-sm shadow-red-500/10"
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

        {success && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 text-xs flex items-center space-x-2 animate-pulse">
            <CheckCircle2 size={15} />
            <span>{success}</span>
          </div>
        )}

        {/* 3. Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name field */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-800 block">
              Full name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Smith"
              className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-slate-800 placeholder-slate-450 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/20 transition-all text-xs shadow-sm"
            />
          </div>

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
              placeholder="Min. 6 characters"
              className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-slate-800 placeholder-slate-450 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/20 transition-all text-xs shadow-sm"
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-extrabold py-3.5 rounded-2xl transition-all text-xs tracking-wider shadow-md shadow-red-600/10 active:scale-[0.98] mt-4 flex items-center justify-center cursor-pointer select-none"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>
            ) : (
              <span>Create account</span>
            )}
          </button>
        </form>

        {/* Disclaimer text */}
        <p className="text-[10px] text-slate-400 text-center mt-4">
          By registering you agree to our <button onClick={() => alert("Terms of Service")} className="font-bold underline text-slate-500 hover:text-slate-700 cursor-pointer">Terms</button> and <button onClick={() => alert("Privacy Policy")} className="font-bold underline text-slate-500 hover:text-slate-700 cursor-pointer">Privacy Policy</button>.
        </p>

        {/* 4. Footer Home Redirect Link */}
        <Link
          to="/"
          className="mt-8 self-center text-xs font-bold text-slate-450 hover:text-slate-750 flex items-center space-x-1.5 transition-colors"
        >
          <ArrowLeft size={13} />
          <span>Back to home</span>
        </Link>

      </div>
    </div>
  );
};
