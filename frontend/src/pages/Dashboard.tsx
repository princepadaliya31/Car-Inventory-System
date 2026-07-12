import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Search, RotateCcw, ShoppingCart, ShieldAlert, CheckCircle2, ChevronDown, SlidersHorizontal, ArrowRight, Hash, Trash2, X } from 'lucide-react';

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

export const Dashboard: React.FC = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Edit Form Modal state (for Admin edit actions)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editMake, setEditMake] = useState('');
  const [editModel, setEditModel] = useState('');
  const [editCategory, setEditCategory] = useState('Sedan');
  const [editColor, setEditColor] = useState('');
  const [editPrice, setEditPrice] = useState('0');
  const [editQuantity, setEditQuantity] = useState('1');
  const [editYear, setEditYear] = useState('2024');
  const [editMileage, setEditMileage] = useState('0');
  const [editUnsplashId, setEditUnsplashId] = useState('1555215695-3004980ad54e');

  // Search Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [showFiltersDrawer, setShowFiltersDrawer] = useState(false);

  // Expanded fields inside filters drawer
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // Purchase Modal state
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [purchaseQty, setPurchaseQty] = useState(1);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [purchaseError, setPurchaseError] = useState('');

  // Clean filters before building params
  const getSearchParams = () => {
    const params: any = {};
    if (make) params.make = make;
    if (model) params.model = model;
    if (year) params.year = Number(year);
    if (minPrice) params.minPrice = Number(minPrice);
    if (maxPrice) params.maxPrice = Number(maxPrice);
    return params;
  };

  // Fetch hook
  const { data: vehicles = [], isLoading } = useQuery<Vehicle[]>({
    queryKey: ['vehicles', make, model, year, minPrice, maxPrice],
    queryFn: async () => {
      const params = getSearchParams();
      const hasFilters = Object.keys(params).length > 0;
      
      const endpoint = hasFilters ? '/vehicles/search' : '/vehicles';
      const response = await api.get(endpoint, { params });
      return response.data;
    },
  });

  // Purchase Mutation
  const purchaseMutation = useMutation({
    mutationFn: async ({ vehicleId, quantity }: { vehicleId: string; quantity: number }) => {
      const response = await api.post(`/vehicles/${vehicleId}/purchase`, null, {
        params: { quantity }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      setPurchaseSuccess(true);
      setTimeout(() => {
        setSelectedVehicle(null);
        setPurchaseSuccess(false);
        setPurchaseQty(1);
      }, 2000);
    },
    onError: (err: any) => {
      setPurchaseError(
        err.response?.data?.message || 
        err.response?.data?.error || 
        'Purchase failed. Please check stock and try again.'
      );
    }
  });

  const handleReset = () => {
    setMake('');
    setModel('');
    setYear('');
    setMinPrice('');
    setMaxPrice('');
    setSearchQuery('');
    setSortBy('default');
  };

  const openPurchaseModal = (vehicle: Vehicle) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setSelectedVehicle(vehicle);
    setPurchaseQty(1);
    setPurchaseError('');
    setPurchaseSuccess(false);
  };

  const handleConfirmPurchase = () => {
    if (!selectedVehicle) return;
    purchaseMutation.mutate({
      vehicleId: selectedVehicle.id,
      quantity: purchaseQty,
    });
  };

  const openEditModal = (vehicle: Vehicle) => {
    setEditingId(vehicle.id);
    setEditMake(vehicle.make);
    setEditModel(vehicle.model);
    setEditCategory(vehicle.category || 'Sedan');
    setEditColor(vehicle.color || '');
    setEditPrice(vehicle.price.toString());
    setEditQuantity(vehicle.quantity.toString());
    setEditYear((vehicle.year || 2024).toString());
    setEditMileage(vehicle.mileage || '0');
    setEditUnsplashId(vehicle.unsplashId || '1555215695-3004980ad54e');
    setIsEditModalOpen(true);
  };

  const clearEditForm = () => {
    setEditingId(null);
    setEditMake('');
    setEditModel('');
    setEditCategory('Sedan');
    setEditColor('');
    setEditPrice('0');
    setEditQuantity('1');
    setEditYear('2024');
    setEditMileage('0');
    setEditUnsplashId('1555215695-3004980ad54e');
  };

  const editMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (editingId) {
        const response = await api.put(`/vehicles/${editingId}`, payload);
        return response.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      setIsEditModalOpen(false);
      clearEditForm();
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || err.response?.data?.error || 'Failed to update vehicle details.');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/vehicles/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || err.response?.data?.error || 'Delete request failed.');
    }
  });

  const handleDeleteVehicle = (id: string) => {
    if (window.confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      deleteMutation.mutate(id);
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editMake || !editModel) {
      alert('Make and Model are required');
      return;
    }

    const payload = {
      make: editMake,
      model: editModel,
      category: editCategory || 'Sedan',
      price: editPrice.trim() === '' ? 0 : Number(editPrice),
      quantity: editQuantity.trim() === '' ? 1 : Number(editQuantity),
      color: editColor.trim() === '' ? 'Default Color' : editColor,
      year: editYear.trim() === '' ? 2024 : Number(editYear),
      mileage: editMileage.trim() === '' ? 0 : Number(editMileage),
      unsplashId: editUnsplashId.trim() === '' ? '1555215695-3004980ad54e' : editUnsplashId,
    };

    if (isNaN(payload.price) || payload.price < 0) {
      alert('Price must be a valid positive number');
      return;
    }
    if (isNaN(payload.quantity) || payload.quantity < 0 || !Number.isInteger(payload.quantity)) {
      alert('Quantity must be a valid non-negative integer');
      return;
    }
    if (isNaN(payload.year) || payload.year < 1900 || payload.year > 2100 || !Number.isInteger(payload.year)) {
      alert('Year must be a valid calendar year (e.g. 2024)');
      return;
    }
    if (isNaN(payload.mileage) || payload.mileage < 0 || !Number.isInteger(payload.mileage)) {
      alert('Mileage must be a valid non-negative integer');
      return;
    }

    editMutation.mutate(payload);
  };

  const getVehicleImage = (make: string = '', model: string = '', unsplashId?: string): string => {
    const customId = unsplashId?.trim();
    // If the user specified a custom Unsplash ID or full URL and it's not the default BMW one
    if (customId && customId !== '1555215695-3004980ad54e') {
      return customId.startsWith('http') ? customId : `https://images.unsplash.com/photo-${customId}?auto=format&fit=crop&q=80&w=800`;
    }

    const name = `${make} ${model}`.toLowerCase();
    let id = '1503376780353-7e6692767b70'; // Default Porsche 911 fallback

    if (name.includes('porsche') || name.includes('911')) {
      id = '1503376780353-7e6692767b70';
    } else if (name.includes('bentley') || name.includes('continental')) {
      id = '1580273916550-e323be2ae537';
    } else if (name.includes('lamborghini') || name.includes('huracan') || name.includes('urus') || name.includes('aventador')) {
      id = '1621135802920-133df287f89c';
    } else if (name.includes('ferrari') || name.includes('f8') || name.includes('roma') || name.includes('portofino')) {
      id = '1592853625597-7d17be820d0c';
    } else if (name.includes('mclaren') || name.includes('720s') || name.includes('570s') || name.includes('p1')) {
      id = '1562591176-b2b1bdf50744';
    } else if (name.includes('rolls-royce') || name.includes('ghost') || name.includes('phantom') || name.includes('wraith')) {
      id = '1632245889029-e406faaa34cd';
    } else if (name.includes('bmw') || name.includes('m3') || name.includes('m4') || name.includes('m5') || name.includes('i8')) {
      id = '1555215695-3004980ad54e';
    } else if (name.includes('tesla') || name.includes('model s') || name.includes('model 3') || name.includes('model x') || name.includes('model y')) {
      id = '1617788138017-80ad40651399';
    } else if (name.includes('range rover') || name.includes('sport svr') || name.includes('land rover') || name.includes('defender')) {
      id = '1606016159991-dfe4f2746ad5';
    } else if (name.includes('mercedes') || name.includes('amg') || name.includes('benz') || name.includes('g-wagon')) {
      id = '1618843479313-40f8afb4b4d6';
    } else if (name.includes('audi') || name.includes('r8') || name.includes('e-tron') || name.includes('rs')) {
      id = '1603584173870-7f23fdae1b7a';
    } else if (name.includes('ford') || name.includes('mustang') || name.includes('gt')) {
      id = '1551524559-8af4e6624178';
    } else if (name.includes('chevrolet') || name.includes('corvette') || name.includes('camaro')) {
      id = '1552519507-da3b142c6e3d';
    } else if (name.includes('toyota') || name.includes('supra')) {
      id = '1626847037657-fd3622613ce3';
    } else if (name.includes('nissan') || name.includes('gtr')) {
      id = '1611245789423-380d3f82215c';
    } else if (name.includes('bugatti') || name.includes('chiron') || name.includes('veyron')) {
      id = '1600706432502-75a0e271985e';
    } else if (name.includes('aston martin') || name.includes('vantage') || name.includes('db11')) {
      id = '1605558158382-95993a898509';
    } else if (name.includes('jaguar') || name.includes('f-type')) {
      id = '1566008889981-2292f7042562';
    } else if (name.includes('maserati') || name.includes('ghibli')) {
      id = '1614162692292-7ac56d7f7f1e';
    } else {
      id = unsplashId || '1555215695-3004980ad54e';
    }

    return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&q=80&w=800`;
  };

  // Details helper utilizing database entries first, falling back to deterministic ones
  const getVehicleMediaDetails = (vehicle: Vehicle) => {
    if (vehicle.unsplashId || vehicle.color || vehicle.year) {
      return {
        img: getVehicleImage(vehicle.make, vehicle.model, vehicle.unsplashId),
        year: vehicle.year || 2024,
        color: vehicle.color || 'Unknown Color',
        mileage: vehicle.mileage !== undefined ? (vehicle.mileage === '0' || Number(vehicle.mileage) === 0 ? 'NEW' : `${Number(vehicle.mileage).toLocaleString()} mi`) : 'NEW'
      };
    }

    const name = `${vehicle.make} ${vehicle.model}`.toLowerCase();
    const id = vehicle.id;
    if (name.includes('porsche') || name.includes('911')) {
      return {
        img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800',
        year: 2024,
        color: 'GT Silver Metallic',
        mileage: 'NEW'
      };
    }
    if (name.includes('bentley') || name.includes('continental')) {
      return {
        img: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=800',
        year: 2024,
        color: 'Barnato Green',
        mileage: 'NEW'
      };
    }
    if (name.includes('lamborghini') || name.includes('huracan')) {
      return {
        img: 'https://images.unsplash.com/photo-1621135802920-133df287f89c?auto=format&fit=crop&q=80&w=800',
        year: 2023,
        color: 'Giallo Orion',
        mileage: '1,200 mi'
      };
    }
    if (name.includes('ferrari') || name.includes('f8')) {
      return {
        img: 'https://images.unsplash.com/photo-1592853625597-7d17be820d0c?auto=format&fit=crop&q=80&w=800',
        year: 2023,
        color: 'Rosso Corsa',
        mileage: '850 mi'
      };
    }
    if (name.includes('mclaren') || name.includes('720s')) {
      return {
        img: 'https://images.unsplash.com/photo-1562591176-b2b1bdf50744?auto=format&fit=crop&q=80&w=800',
        year: 2023,
        color: 'Papaya Spark',
        mileage: '2,100 mi'
      };
    }
    if (name.includes('rolls-royce') || name.includes('ghost')) {
      return {
        img: 'https://images.unsplash.com/photo-1632245889029-e406faaa34cd?auto=format&fit=crop&q=80&w=800',
        year: 2024,
        color: 'English White',
        mileage: 'NEW'
      };
    }
    if (name.includes('bmw') || name.includes('m3')) {
      return {
        img: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=800',
        year: 2024,
        color: 'Alpine White',
        mileage: 'NEW'
      };
    }
    if (name.includes('tesla') || name.includes('model s')) {
      return {
        img: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=800',
        year: 2024,
        color: 'Midnight Silver',
        mileage: 'NEW'
      };
    }
    if (name.includes('range rover') || name.includes('sport svr') || name.includes('land rover')) {
      return {
        img: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?auto=format&fit=crop&q=80&w=800',
        year: 2024,
        color: 'Santorini Black',
        mileage: 'NEW'
      };
    }
    
    // Default fallbacks deterministically using vehicle ID hash
    const colors = ['San Marino Blue', 'Nardo Grey', 'Jet Black', 'Carbon Black'];
    const years = [2023, 2024];
    const charSum = Array.from(id || '').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    
    return {
      img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800',
      year: years[charSum % years.length],
      color: colors[charSum % colors.length],
      mileage: charSum % 2 === 0 ? 'NEW' : `${(charSum % 10) * 800 + 400} mi`
    };
  };

  // Perform search text filtering and dynamic sorting locally
  const filteredVehicles = vehicles
    .filter((v) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        v.make.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q) ||
        v.category.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sortBy === 'lowToHigh') return a.price - b.price;
      if (sortBy === 'highToLow') return b.price - a.price;
      return 0;
    });

  return (
    <div className="bg-[#fafafa] text-slate-800 font-sans min-h-screen pb-16">
      
      {/* Outer wrapper */}
      <div className="max-w-7xl mx-auto px-6 pt-12 space-y-8">
        
        {/* 1. Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-6">
          <div className="space-y-1">
            {/* Live inventory badge */}
            <div className="inline-flex items-center space-x-1.5 bg-red-50 border border-red-100 px-3 py-0.5 rounded-full text-[10px] font-extrabold text-red-600 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
              <span>Live inventory</span>
            </div>
            <h1 className="text-3xl font-black text-slate-950 tracking-tight">
              All Vehicles
            </h1>
            <p className="text-slate-400 text-xs font-semibold">
              {filteredVehicles.length} of {vehicles.length} vehicles available
            </p>
          </div>

          {/* Right Header Action Button */}
          {!isAuthenticated && (
            <Link
              to="/login"
              className="px-5 py-3 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl transition-all shadow-md shadow-red-600/10 active:scale-[0.98] flex items-center justify-center space-x-1.5 shrink-0 self-start sm:self-center"
            >
              <span>Sign in to purchase</span>
              <ArrowRight size={14} />
            </Link>
          )}
        </div>

        {/* 2. Search & Sort Actions Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Main Keyword Search */}
          <div className="relative w-full md:flex-grow">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-450">
              <Search size={15} />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search company, car name, year..."
              className="w-full bg-white border border-slate-250 rounded-full py-3 pl-11 pr-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/20 transition-all text-xs shadow-sm"
            />
          </div>

          {/* Sort By Selector & Advanced Filter Toggles */}
          <div className="flex items-center space-x-3 w-full md:w-auto">
            <div className="relative w-full md:w-48 bg-white border border-slate-250 rounded-xl shadow-sm text-xs text-slate-750 font-bold py-2.5 px-4 flex items-center justify-between select-none">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full"
              >
                <option value="default">Default Sort</option>
                <option value="lowToHigh">Price: Low to High</option>
                <option value="highToLow">Price: High to Low</option>
              </select>
              <span>
                {sortBy === 'default' && 'Default Sort'}
                {sortBy === 'lowToHigh' && 'Price: Low to High'}
                {sortBy === 'highToLow' && 'Price: High to Low'}
              </span>
              <ChevronDown size={14} className="text-slate-450 stroke-[2.5]" />
            </div>

            <button
              onClick={() => setShowFiltersDrawer(!showFiltersDrawer)}
              className={`py-2.5 px-4 rounded-xl border flex items-center justify-center space-x-2 text-xs font-bold transition-all shadow-sm cursor-pointer select-none ${
                showFiltersDrawer
                  ? 'bg-slate-100 border-slate-350 text-slate-900'
                  : 'bg-white border-slate-250 text-slate-750 hover:bg-slate-50'
              }`}
            >
              <SlidersHorizontal size={14} className="stroke-[2.5]" />
              <span>Filters</span>
            </button>

            {(make || model || year || minPrice || maxPrice) && (
              <button
                onClick={handleReset}
                className="text-xs text-slate-450 hover:text-red-600 transition-colors font-bold uppercase tracking-wider flex items-center space-x-1 cursor-pointer select-none"
                title="Clear Filters"
              >
                <RotateCcw size={12} />
              </button>
            )}
          </div>
        </div>

        {/* 3. Advanced Collapsible Filters Drawer */}
        {showFiltersDrawer && (
          <div className="p-5 bg-white border border-slate-250/70 rounded-2xl shadow-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 animate-fade-in">
            {/* Company Name */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Company Name</label>
              <input
                type="text"
                value={make}
                onChange={(e) => setMake(e.target.value)}
                placeholder="e.g. Company"
                className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/20 text-xs transition-all shadow-sm"
              />
            </div>

            {/* Car Name */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Car Name</label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="e.g. Car Name"
                className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/20 text-xs transition-all shadow-sm"
              />
            </div>

            {/* Year */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Year</label>
              <input
                type="text"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="e.g. 2024"
                className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/20 text-xs transition-all shadow-sm"
              />
            </div>

            {/* Min Price */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Min Price ($)</label>
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="e.g. 50000"
                className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/20 text-xs transition-all shadow-sm"
              />
            </div>

            {/* Max Price */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Max Price ($)</label>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="e.g. 250000"
                className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/20 text-xs transition-all shadow-sm"
              />
            </div>
          </div>
        )}

        {/* 4. Vehicles Listings Grid */}
        <div>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-2xl h-[360px] animate-pulse"></div>
              ))}
            </div>
          ) : filteredVehicles.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center flex flex-col items-center justify-center space-y-4 shadow-sm">
              <ShieldAlert className="text-slate-400" size={48} />
              <h4 className="text-base font-extrabold text-slate-900">No Vehicles Match Criteria</h4>
              <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                Try modifying your search keywords or price thresholds to view items in the dealership inventory.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredVehicles.map((vehicle) => {
                const isOutOfStock = vehicle.quantity <= 0;
                const details = getVehicleMediaDetails(vehicle);

                return (
                  <div
                    key={vehicle.id}
                    className="group bg-white rounded-2xl overflow-hidden flex flex-col h-full border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-300 relative"
                  >
                    {/* Visual Card Top Image */}
                    <div className="h-52 bg-slate-100 relative overflow-hidden">
                      <img
                        src={details.img}
                        alt={`${vehicle.make} ${vehicle.model}`}
                        className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-500"
                      />
                      
                      {/* Category Badge (Top-left) */}
                      <span className="absolute top-4 left-4 bg-white/95 backdrop-blur text-slate-800 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border border-slate-100 shadow-sm">
                        {vehicle.category}
                      </span>
                      
                      {/* Stock Indicator (Top-right) */}
                      {isOutOfStock ? (
                        <span className="absolute top-4 right-4 bg-slate-100/95 text-slate-550 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-slate-200 shadow-sm">
                          Sold out
                        </span>
                      ) : vehicle.quantity <= 2 ? (
                        <span className="absolute top-4 right-4 bg-amber-50/95 text-amber-700 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-amber-100/50 shadow-sm">
                          {vehicle.quantity} left
                        </span>
                      ) : (
                        <span className="absolute top-4 right-4 bg-emerald-50/90 text-emerald-700 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-emerald-100/50 shadow-sm">
                          In stock
                        </span>
                      )}
                    </div>

                    {/* Card details */}
                    <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                      <div className="space-y-1">
                        {/* Monospace style sub details */}
                        <div className="text-slate-400 text-[10px] font-extrabold tracking-wide uppercase">
                          {details.year} · {details.color}
                        </div>
                        
                        {/* Title & Price Line */}
                        <div className="flex items-start justify-between gap-2">
                          <h2 className="text-base font-extrabold text-slate-950 tracking-tight leading-snug line-clamp-1">
                            {vehicle.make} {vehicle.model}
                          </h2>
                          <span className="text-base font-black text-red-600 shrink-0">
                            ${vehicle.price.toLocaleString()}
                          </span>
                        </div>

                        {/* Status tags line: Quantity & Mileage details */}
                        <div className="flex items-center text-[10px] font-bold mt-1.5 select-none">
                          <span className="text-slate-400">QTY: {vehicle.quantity}</span>
                          {details.mileage === 'NEW' ? (
                            <span className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ml-2">
                              NEW
                            </span>
                          ) : (
                            <span className="text-slate-450 ml-2 font-medium">
                              {details.mileage}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Buy / Admin Buttons */}
                      {isAuthenticated && isAdmin ? (
                        <div className="flex items-center space-x-2 w-full pt-1">
                          {/* Edit Button */}
                          <button
                            onClick={() => openEditModal(vehicle)}
                            className="flex-grow py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs cursor-pointer shadow-sm transition-all select-none text-center"
                          >
                            Edit
                          </button>
                          
                          {/* Delete Button */}
                          <button
                            onClick={() => handleDeleteVehicle(vehicle.id)}
                            className="p-2.5 bg-white border border-red-100 hover:bg-red-50 text-red-500 rounded-xl cursor-pointer shadow-sm transition-all shrink-0 flex items-center justify-center"
                            title="Delete vehicle"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => openPurchaseModal(vehicle)}
                          disabled={isOutOfStock && isAuthenticated}
                          className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm select-none ${
                            !isAuthenticated
                              ? 'bg-[#f1f3f5] hover:bg-[#e9ecef] text-slate-500 border border-slate-200/50'
                              : isOutOfStock
                              ? 'bg-[#f1f3f5] text-slate-405 cursor-not-allowed border border-slate-200/50'
                              : 'bg-red-600 hover:bg-red-700 text-white font-extrabold'
                          }`}
                        >
                          {!isOutOfStock && <ShoppingCart size={13} className="stroke-[1.8]" />}
                          <span>
                            {isOutOfStock && isAuthenticated
                              ? 'Sold out'
                              : isAuthenticated
                              ? 'Purchase'
                              : 'Sign in to buy'}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 5. Purchase Confirmation Modal */}
      {selectedVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white border border-slate-100 rounded-3xl p-6 shadow-2xl space-y-5 text-slate-800 animate-scale-in">
            
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-950 flex items-center space-x-2">
                <ShoppingCart className="text-red-600" size={18} />
                <span>Confirm Buy</span>
              </h3>
              <p className="text-slate-500 text-xs mt-1 leading-normal">
                Selected: <span className="text-slate-850 font-bold">{selectedVehicle.make} {selectedVehicle.model}</span>
              </p>
            </div>

            {purchaseError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-xs flex items-center space-x-2">
                <ShieldAlert size={14} />
                <span>{purchaseError}</span>
              </div>
            )}

            {purchaseSuccess ? (
              <div className="p-6 text-center space-y-3 flex flex-col items-center justify-center">
                <CheckCircle2 size={44} className="text-emerald-500 animate-bounce" />
                <h4 className="font-extrabold text-slate-900">Order Processed!</h4>
                <p className="text-xs text-slate-400">Your vehicle inventory purchase log has been logged successfully.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Quantity Select */}
                <div className="flex items-center justify-between bg-slate-50 border border-slate-200/60 rounded-xl p-3">
                  <span className="text-xs font-bold text-slate-700 flex items-center space-x-2">
                    <Hash size={13} className="text-slate-400" />
                    <span>Purchase Quantity</span>
                  </span>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setPurchaseQty(Math.max(1, purchaseQty - 1))}
                      className="w-7 h-7 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-750 font-extrabold text-xs flex items-center justify-center transition-colors cursor-pointer"
                    >
                      -
                    </button>
                    <span className="text-xs font-bold w-6 text-center select-none">{purchaseQty}</span>
                    <button
                      onClick={() => setPurchaseQty(Math.min(selectedVehicle.quantity, purchaseQty + 1))}
                      className="w-7 h-7 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-750 font-extrabold text-xs flex items-center justify-center transition-colors cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Pricing Summary */}
                <div className="bg-slate-50/50 border border-slate-200/60 rounded-xl p-4 text-xs space-y-2">
                  <div className="flex justify-between text-slate-500">
                    <span>Unit Price:</span>
                    <span className="font-bold text-slate-700">${selectedVehicle.price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Quantity:</span>
                    <span className="font-bold text-slate-700">x {purchaseQty}</span>
                  </div>
                  <div className="border-t border-slate-200/80 pt-2 flex justify-between font-extrabold text-slate-900 text-sm">
                    <span>Total Cost:</span>
                    <span className="text-red-600 font-black">${(selectedVehicle.price * purchaseQty).toLocaleString()}</span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => setSelectedVehicle(null)}
                    className="py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 font-bold text-xs transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmPurchase}
                    disabled={purchaseMutation.isPending}
                    className="py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs flex items-center justify-center space-x-1.5 shadow-sm cursor-pointer select-none"
                  >
                    {purchaseMutation.isPending ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>
                    ) : (
                      <>
                        <ShoppingCart size={13} />
                        <span>Confirm Buy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* 6. Admin Modify Vehicle Modal Dialog Popover (Figma Grid Layout) */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white border border-slate-100 rounded-3xl p-8 shadow-2xl space-y-6 text-slate-800 animate-scale-in">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <h3 className="text-base font-black text-slate-900 tracking-tight">
                Modify vehicle
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer p-0.5 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Make */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Make</label>
                  <input
                    type="text"
                    required
                    value={editMake}
                    onChange={(e) => setEditMake(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/20 transition-all text-xs shadow-sm"
                  />
                </div>

                {/* Model */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Model</label>
                  <input
                    type="text"
                    required
                    value={editModel}
                    onChange={(e) => setEditModel(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/20 transition-all text-xs shadow-sm"
                  />
                </div>

                {/* Category Selection Dropdown */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Category</label>
                  <select
                    required
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3.5 text-slate-850 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/20 transition-all text-xs shadow-sm cursor-pointer"
                  >
                    <option value="Sedan">Sedan</option>
                    <option value="Coupe">Coupe</option>
                    <option value="SUV">SUV</option>
                    <option value="Sports">Sports</option>
                    <option value="Electric">Electric</option>
                  </select>
                </div>

                {/* Color */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Color</label>
                  <input
                    type="text"
                    required
                    value={editColor}
                    onChange={(e) => setEditColor(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/20 transition-all text-xs shadow-sm"
                  />
                </div>

                {/* Price */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Price ($)</label>
                  <input
                    type="text"
                    required
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/20 transition-all text-xs shadow-sm"
                  />
                </div>

                {/* Quantity */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Quantity</label>
                  <input
                    type="text"
                    required
                    value={editQuantity}
                    onChange={(e) => setEditQuantity(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/20 transition-all text-xs shadow-sm"
                  />
                </div>

                {/* Year */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Year</label>
                  <input
                    type="text"
                    required
                    value={editYear}
                    onChange={(e) => setEditYear(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/20 transition-all text-xs shadow-sm"
                  />
                </div>

                {/* Mileage */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Mileage</label>
                  <input
                    type="text"
                    required
                    value={editMileage}
                    onChange={(e) => setEditMileage(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/20 transition-all text-xs shadow-sm"
                  />
                </div>

                {/* Unsplash image ID */}
                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Unsplash image ID</label>
                  <input
                    type="text"
                    required
                    value={editUnsplashId}
                    onChange={(e) => setEditUnsplashId(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/20 transition-all text-xs shadow-sm font-mono"
                  />
                </div>
              </div>

              {/* Submit & Close Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-3.5">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs transition-all cursor-pointer shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editMutation.isPending}
                  className="py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs flex items-center justify-center space-x-1 transition-all shadow-md shadow-red-500/10 cursor-pointer select-none"
                >
                  {editMutation.isPending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>
                  ) : (
                    <span>Update vehicle</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
