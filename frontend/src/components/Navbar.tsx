import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, LogIn, UserPlus } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getUserDisplayName = (email: string) => {
    if (!email) return 'User';
    if (email.toLowerCase() === 'admin@gmail.com') return 'Admin User';
    const namePart = email.split('@')[0];
    return namePart
      .replace(/[._-]/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-6 py-3.5 text-slate-800 shadow-sm select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center space-x-2.5 group">
          <div className="w-6.5 h-6.5 bg-red-600 rounded flex items-center justify-center text-white shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-350">
            <span className="text-[10px] font-black leading-none">▲</span>
          </div>
          <span className="text-lg font-black tracking-tight text-slate-950">
            Apex.
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center space-x-1 sm:space-x-4">
          <Link
            to="/inventory"
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 flex items-center space-x-1.5 ${
              isActive('/inventory')
                ? 'bg-red-50 text-red-600'
                : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100/60'
            }`}
          >
            <span>Inventory</span>
          </Link>

          {isAuthenticated && isAdmin && (
            <Link
              to="/admin"
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 flex items-center space-x-1.5 ${
                isActive('/admin')
                  ? 'bg-slate-100 text-slate-900 border border-slate-200'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100/60'
              }`}
            >
              <Shield size={13} className="stroke-[1.8]" />
              <span className="hidden sm:inline">Admin Panel</span>
            </Link>
          )}
        </div>

        {/* User Actions */}
        <div className="flex items-center space-x-3">
          {isAuthenticated ? (
            <div className="flex items-center space-x-3">
              {/* Display Name & Role */}
              <div className="flex flex-col items-end text-xs leading-none">
                <span className="font-extrabold text-slate-950">
                  {getUserDisplayName(user?.email || '')}
                </span>
                <span className="text-[9px] text-slate-400 font-bold lowercase tracking-wider mt-0.5">
                  {user?.role.toLowerCase()}
                </span>
              </div>
              
              {/* Circular Avatar */}
              <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-extrabold text-xs select-none">
                {getUserDisplayName(user?.email || '').charAt(0).toUpperCase()}
              </div>

              {/* Sign Out Link */}
              <button
                onClick={handleLogout}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer select-none ml-1"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Link
                to="/login"
                className="px-3.5 py-2 rounded-xl text-slate-600 hover:text-slate-950 transition-all font-bold text-xs flex items-center space-x-1.5"
              >
                <LogIn size={13} className="stroke-[1.8]" />
                <span>Sign in</span>
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all text-xs shadow-sm shadow-red-500/10 flex items-center space-x-1.5"
              >
                <UserPlus size={13} className="stroke-[1.8]" />
                <span>Get started</span>
              </Link>
            </div>
          )}
        </div>

      </div>
    </nav>
  );
};
