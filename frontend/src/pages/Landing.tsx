import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { ArrowRight } from 'lucide-react';

interface Vehicle {
  id: string;
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
  color?: string;
  year?: number;
  mileage?: string;
  unsplashId?: string;
}

export const Landing: React.FC = () => {
  const { isAuthenticated } = useAuth();

  const { data: vehicles = [], isLoading } = useQuery<Vehicle[]>({
    queryKey: ['vehicles-count'],
    queryFn: async () => {
      const response = await api.get('/vehicles');
      return response.data;
    },
  });

  const totalStock = vehicles.reduce((sum, v) => sum + (v.quantity || 0), 0);
  const premiumBrands = new Set(vehicles.map(v => v.make.trim())).size;

  // Floating Logo Icon component matching "Apex." red square branding
  const ApexLogoIcon = () => (
    <div className="w-6 h-6 bg-red-600 rounded flex items-center justify-center text-white shrink-0 shadow-sm shadow-red-500/25">
      <span className="text-[10px] font-black select-none">▲</span>
    </div>
  );

  return (
    <div className="bg-[#fafafa] text-slate-900 font-sans min-h-screen grid-background">
      
      {/* 1. HERO SECTION */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-12 flex flex-col items-center text-center">
        {/* Bullet tag badge */}
        <div className="inline-flex items-center space-x-2 bg-red-50 border border-red-100 px-3.5 py-1 rounded-full text-xs font-bold text-red-600 mb-6 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
          <span>New inventory arriving weekly</span>
        </div>

        {/* Big Heading */}
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-950 max-w-4xl leading-[1.1] mb-6">
          Find your perfect <br />
          <span className="text-red-600 font-extrabold">dream car.</span>
        </h1>

        {/* Subtext */}
        <p className="text-slate-500 max-w-2xl text-sm sm:text-base leading-relaxed mb-8">
          The world's most coveted automobiles, hand-picked and certified for those who demand nothing but extraordinary.
        </p>

        {/* Call to Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          <Link
            to="/inventory"
            className="w-full sm:w-auto px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl transition-all shadow-md shadow-red-600/10 active:scale-[0.98] flex items-center justify-center space-x-2"
          >
            <span>Browse inventory</span>
            <ArrowRight size={14} />
          </Link>
          <Link
            to={isAuthenticated ? "/inventory" : "/login"}
            className="w-full sm:w-auto px-6 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition-all shadow-sm active:scale-[0.98] flex items-center justify-center"
          >
            Client portal
          </Link>
        </div>
      </section>

      {/* 4. STATS GRID SECTION */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: isLoading ? '...' : `${totalStock}`, label: 'Vehicles in stock' },
            { value: isLoading ? '...' : `${premiumBrands}`, label: 'Premium brands' },
            { value: '15 yrs', label: 'In business' },
            { value: '4,200+', label: 'Happy clients' },
          ].map((stat, i) => (
            <div 
              key={i} 
              className="bg-white/80 border border-slate-200/50 rounded-2xl p-6 text-center shadow-sm flex flex-col justify-center space-y-1"
            >
              <span className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">{stat.value}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 7. FOOTER SECTION */}
      <footer className="bg-white border-t border-slate-200/60 mt-12 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-3">
            <ApexLogoIcon />
            <span className="text-sm font-extrabold tracking-tight text-slate-900">Apex.</span>
            <span className="text-slate-450 text-[11px] font-medium pl-1">© 2024 Apex Motors Ltd.</span>
          </div>

          <div className="flex items-center space-x-6 text-[11px] font-bold text-slate-500">
            <Link to="/inventory" className="hover:text-slate-900 transition-colors">Inventory</Link>
            <button onClick={() => alert("Contact support at: support@apex.com")} className="hover:text-slate-900 transition-colors cursor-pointer">Contact</button>
            <button onClick={() => alert("Apex Motors - Premium Dealership since 2009")} className="hover:text-slate-900 transition-colors cursor-pointer">About</button>
            <button onClick={() => alert("Privacy policy page is under construction.")} className="hover:text-slate-900 transition-colors cursor-pointer">Privacy</button>
          </div>
        </div>
      </footer>

    </div>
  );
};
