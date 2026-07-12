import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { Plus, Trash2, ShieldAlert, CheckCircle2, Search, X, ShieldAlert as AlertIcon } from 'lucide-react';

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

export const AdminPanel: React.FC = () => {
  const queryClient = useQueryClient();

  // Search filter inside table list
  const [searchQuery, setSearchQuery] = useState('');

  // Form modal toggle state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);

  // Form inputs states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [category, setCategory] = useState('Sedan');
  const [color, setColor] = useState('');
  const [price, setPrice] = useState('0');
  const [quantity, setQuantity] = useState('1');
  const [year, setYear] = useState('2024');
  const [mileage, setMileage] = useState('0');
  const [unsplashId, setUnsplashId] = useState('1555215695-3004980ad54e');

  // Restock popover input states
  const [restockVehicleId, setRestockVehicleId] = useState<string | null>(null);
  const [restockQty, setRestockQty] = useState('');

  // Toast message states
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch hook
  const { data: vehicles = [], isLoading } = useQuery<Vehicle[]>({
    queryKey: ['admin-vehicles'],
    queryFn: async () => {
      const response = await api.get('/vehicles');
      return response.data;
    },
  });

  // Add / Edit mutation
  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (editingId) {
        const response = await api.put(`/vehicles/${editingId}`, payload);
        return response.data;
      } else {
        const response = await api.post('/vehicles', payload);
        return response.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      clearForm();
      setIsFormModalOpen(false); // Close Modal on Success
      showSuccess(editingId ? 'Vehicle updated successfully!' : 'Vehicle added successfully!');
    },
    onError: (err: any) => {
      showError(err.response?.data?.message || err.response?.data?.error || 'Failed to save vehicle details.');
    }
  });

  // Restock mutation
  const restockMutation = useMutation({
    mutationFn: async ({ vehicleId, qty }: { vehicleId: string; qty: number }) => {
      const response = await api.post(`/vehicles/${vehicleId}/restock`, null, {
        params: { quantity: qty }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      setRestockVehicleId(null);
      setRestockQty('');
      showSuccess('Inventory restocked successfully!');
    },
    onError: (err: any) => {
      showError(err.response?.data?.message || err.response?.data?.error || 'Restock action failed.');
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/vehicles/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      showSuccess('Vehicle deleted successfully.');
    },
    onError: (err: any) => {
      showError(err.response?.data?.message || err.response?.data?.error || 'Delete request failed.');
    }
  });

  const clearForm = () => {
    setEditingId(null);
    setMake('');
    setModel('');
    setCategory('Sedan');
    setColor('');
    setPrice('0');
    setQuantity('1');
    setYear('2024');
    setMileage('0');
    setUnsplashId('1555215695-3004980ad54e');
  };

  const openAddModal = () => {
    clearForm();
    setIsFormModalOpen(true);
  };

  const populateEditForm = (vehicle: Vehicle) => {
    setEditingId(vehicle.id);
    setMake(vehicle.make);
    setModel(vehicle.model);
    setCategory(vehicle.category || 'Sedan');
    setColor(vehicle.color || '');
    setPrice(vehicle.price.toString());
    setQuantity(vehicle.quantity.toString());
    setYear((vehicle.year || 2024).toString());
    setMileage(vehicle.mileage || '0');
    setUnsplashId(vehicle.unsplashId || '1555215695-3004980ad54e');
    setIsFormModalOpen(true); // Open Modal on Edit
  };

  const showSuccess = (msg: string) => {
    setStatusMessage(msg);
    setErrorMessage('');
    setTimeout(() => setStatusMessage(''), 3000);
  };

  const showError = (msg: string) => {
    setErrorMessage(msg);
    setStatusMessage('');
    setTimeout(() => setErrorMessage(''), 4500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!make || !model) {
      showError('Make and Model are required');
      return;
    }

    const payload = {
      make,
      model,
      category: category || 'Sedan',
      price: price.trim() === '' ? 0 : Number(price),
      quantity: quantity.trim() === '' ? 1 : Number(quantity),
      color: color.trim() === '' ? 'Default Color' : color,
      year: year.trim() === '' ? 2024 : Number(year),
      mileage: mileage.trim() === '' ? 0 : Number(mileage),
      unsplashId: unsplashId.trim() === '' ? '1555215695-3004980ad54e' : unsplashId,
    };

    if (isNaN(payload.price) || payload.price < 0) {
      showError('Price must be a valid positive number');
      return;
    }
    if (isNaN(payload.quantity) || payload.quantity < 0 || !Number.isInteger(payload.quantity)) {
      showError('Quantity must be a valid non-negative integer');
      return;
    }
    if (isNaN(payload.year) || payload.year < 1900 || payload.year > 2100 || !Number.isInteger(payload.year)) {
      showError('Year must be a valid calendar year (e.g. 2024)');
      return;
    }
    if (isNaN(payload.mileage) || payload.mileage < 0 || !Number.isInteger(payload.mileage)) {
      showError('Mileage must be a valid non-negative integer');
      return;
    }

    saveMutation.mutate(payload);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      deleteMutation.mutate(id);
    }
  };

  const handleRestockSubmit = (vehicleId: string) => {
    const qty = Number(restockQty);
    if (!restockQty || isNaN(qty) || qty <= 0 || !Number.isInteger(qty)) {
      showError('Restock quantity must be a positive integer');
      return;
    }
    restockMutation.mutate({ vehicleId, qty });
  };

  // Dynamic portfolio value formatting helper (e.g. $3.5M)
  const formatPortfolioValue = (value: number) => {
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(0)}K`;
    return `$${value}`;
  };

  const getVehicleImage = (make: string = '', model: string = '', unsplashId?: string): string => {
    const customId = unsplashId?.trim();
    // If the user specified a custom Unsplash ID or full URL and it's not the default BMW one
    if (customId && customId !== '1555215695-3004980ad54e') {
      return customId.startsWith('http') ? customId : `https://images.unsplash.com/photo-${customId}?auto=format&fit=crop&q=80&w=300`;
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

    return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&q=80&w=300`;
  };

  // Details helper utilizing database entries first, falling back to deterministic ones
  const getVehicleMediaDetails = (vehicle: Vehicle) => {
    if (vehicle.unsplashId || vehicle.color || vehicle.year) {
      return {
        img: getVehicleImage(vehicle.make, vehicle.model, vehicle.unsplashId),
        year: vehicle.year || 2024,
        color: vehicle.color || 'Unknown Color'
      };
    }

    const name = `${vehicle.make} ${vehicle.model}`.toLowerCase();
    if (name.includes('porsche') || name.includes('911')) {
      return {
        img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=300',
        year: 2024,
        color: 'GT Silver Metallic'
      };
    }
    if (name.includes('bentley') || name.includes('continental')) {
      return {
        img: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=300',
        year: 2024,
        color: 'Barnato Green'
      };
    }
    if (name.includes('lamborghini') || name.includes('huracan')) {
      return {
        img: 'https://images.unsplash.com/photo-1621135802920-133df287f89c?auto=format&fit=crop&q=80&w=300',
        year: 2023,
        color: 'Giallo Orion'
      };
    }
    if (name.includes('ferrari') || name.includes('f8')) {
      return {
        img: 'https://images.unsplash.com/photo-1592853625597-7d17be820d0c?auto=format&fit=crop&q=80&w=300',
        year: 2023,
        color: 'Rosso Corsa'
      };
    }
    if (name.includes('mclaren') || name.includes('720s')) {
      return {
        img: 'https://images.unsplash.com/photo-1562591176-b2b1bdf50744?auto=format&fit=crop&q=80&w=300',
        year: 2023,
        color: 'Papaya Spark'
      };
    }
    if (name.includes('rolls-royce') || name.includes('ghost')) {
      return {
        img: 'https://images.unsplash.com/photo-1632245889029-e406faaa34cd?auto=format&fit=crop&q=80&w=300',
        year: 2024,
        color: 'English White'
      };
    }
    if (name.includes('bmw') || name.includes('m3')) {
      return {
        img: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=300',
        year: 2024,
        color: 'Alpine White'
      };
    }
    if (name.includes('tesla') || name.includes('model s')) {
      return {
        img: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=300',
        year: 2024,
        color: 'Midnight Silver'
      };
    }
    if (name.includes('range rover') || name.includes('sport svr') || name.includes('land rover')) {
      return {
        img: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?auto=format&fit=crop&q=80&w=300',
        year: 2024,
        color: 'Santorini Black'
      };
    }
    
    // Default fallback deterministically
    const colors = ['San Marino Blue', 'Nardo Grey', 'Jet Black', 'Carbon Black'];
    const years = [2023, 2024];
    const charSum = Array.from(vehicle.id || '').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    
    return {
      img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=300',
      year: years[charSum % years.length],
      color: colors[charSum % colors.length]
    };
  };

  // Metrics Calculations
  const totalVehicles = vehicles.length;
  const totalStock = vehicles.reduce((sum, v) => sum + v.quantity, 0);
  const soldOutCount = vehicles.filter((v) => v.quantity <= 0).length;
  const portfolioValue = vehicles.reduce((sum, v) => sum + v.price * v.quantity, 0);

  // Search keyword filtering
  const filteredVehicles = vehicles.filter((v) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      v.make.toLowerCase().includes(q) ||
      v.model.toLowerCase().includes(q) ||
      v.category.toLowerCase().includes(q)
    );
  });

  return (
    <div className="bg-[#fafafa] text-slate-800 font-sans min-h-screen pb-16">
      
      {/* Outer container */}
      <div className="max-w-7xl mx-auto px-6 pt-12 space-y-8">
        
        {/* 1. Header Control Panel Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-6">
          <div className="space-y-1">
            {/* Header Red Alert Tag */}
            <div className="inline-flex items-center space-x-1.5 bg-red-50 border border-red-100 px-3 py-0.5 rounded-full text-[10px] font-extrabold text-red-600 shadow-sm">
              <span>Admin - Inventory Management</span>
            </div>
            <h1 className="text-3xl font-black text-slate-950 tracking-tight">
              Control Panel
            </h1>
          </div>

          {/* Right Header Action Add Button */}
          <button
            onClick={openAddModal}
            className="px-5 py-3 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl transition-all shadow-md shadow-red-600/10 active:scale-[0.98] flex items-center justify-center space-x-1.5 cursor-pointer shrink-0 self-start sm:self-center select-none"
          >
            <Plus size={14} className="stroke-[2.5]" />
            <span>Add vehicle</span>
          </button>
        </div>

        {/* Operation Feedback Toasts */}
        {statusMessage && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 text-xs flex items-center space-x-2">
            <CheckCircle2 size={16} />
            <span>{statusMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs flex items-center space-x-2">
            <ShieldAlert size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 2. row of 4 visual stats cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total vehicles */}
          <div className="bg-white border border-slate-200/50 rounded-2xl p-5 shadow-sm flex items-center space-x-4">
            <div className="text-2xl select-none">🚗</div>
            <div className="flex flex-col">
              <span className="text-xl font-black text-slate-900 tracking-tight">{totalVehicles}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total vehicles</span>
            </div>
          </div>

          {/* Card 2: Total stock */}
          <div className="bg-emerald-50/20 border border-emerald-100/60 rounded-2xl p-5 shadow-sm flex items-center space-x-4">
            <div className="text-2xl select-none">📦</div>
            <div className="flex flex-col">
              <span className="text-xl font-black text-emerald-600 tracking-tight">{totalStock} units</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total stock</span>
            </div>
          </div>

          {/* Card 3: Sold out */}
          <div className="bg-red-50/20 border border-red-100/60 rounded-2xl p-5 shadow-sm flex items-center space-x-4">
            <div className="text-2xl select-none">⚠️</div>
            <div className="flex flex-col">
              <span className="text-xl font-black text-red-600 tracking-tight">{soldOutCount}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sold out</span>
            </div>
          </div>

          {/* Card 4: Portfolio value */}
          <div className="bg-amber-50/25 border border-amber-100/60 rounded-2xl p-5 shadow-sm flex items-center space-x-4">
            <div className="text-2xl select-none">💰</div>
            <div className="flex flex-col">
              <span className="text-xl font-black text-amber-600 tracking-tight">{formatPortfolioValue(portfolioValue)}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Portfolio value</span>
            </div>
          </div>
        </div>

        {/* 3. Search Bar */}
        <div className="relative w-full">
          <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-450">
            <Search size={15} />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search inventory..."
            className="w-full bg-white border border-slate-250 rounded-full py-3.5 pl-11 pr-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/20 transition-all text-xs shadow-sm"
          />
        </div>

        {/* 4. Vehicles Listings Inventory Table */}
        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
          {isLoading ? (
            <div className="p-8 text-center text-xs text-slate-550">Loading dealership inventory data...</div>
          ) : filteredVehicles.length === 0 ? (
            <div className="p-16 text-center flex flex-col items-center justify-center space-y-4">
              <AlertIcon className="text-slate-400" size={40} />
              <h4 className="text-sm font-extrabold text-slate-900">No Vehicles Logged</h4>
              <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                Add a new vehicle using the panel button or modify your search criteria parameters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold uppercase tracking-wider text-slate-450">
                    <th className="py-3 px-5">Vehicle</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Price</th>
                    <th className="py-3 px-3 text-center">Stock</th>
                    <th className="py-3 px-3 text-center">Year</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredVehicles.map((vehicle) => {
                    const details = getVehicleMediaDetails(vehicle);
                    const isOutOfStock = vehicle.quantity <= 0;

                    return (
                      <tr key={vehicle.id} className="hover:bg-slate-50/30 transition-colors">
                        {/* Vehicle Cell */}
                        <td className="py-4 px-5">
                          <div className="flex items-center space-x-3.5">
                            {/* Rounded Thumbnail */}
                            <img
                              src={details.img}
                              alt={vehicle.make}
                              className="w-10 h-10 object-cover rounded-lg border border-slate-200/60 bg-slate-50 shrink-0"
                            />
                            <div className="flex flex-col">
                              <span className="font-extrabold text-slate-950 leading-tight">
                                {vehicle.make} {vehicle.model}
                              </span>
                              <span className="text-[10px] text-slate-400 font-semibold mt-0.5 leading-none">
                                {details.color}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Category Badge */}
                        <td className="py-4 px-3">
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-extrabold uppercase tracking-wide">
                            {vehicle.category}
                          </span>
                        </td>

                        {/* Price */}
                        <td className="py-4 px-3 font-extrabold text-slate-900">
                          ${vehicle.price.toLocaleString()}
                        </td>

                        {/* Stock Counter & Restock */}
                        <td className="py-4 px-3">
                          {restockVehicleId === vehicle.id ? (
                            <div className="flex items-center space-x-1 justify-center max-w-[95px] mx-auto bg-slate-100 p-1 rounded-lg border border-slate-200">
                              <input
                                type="text"
                                placeholder="Qty"
                                value={restockQty}
                                onChange={(e) => setRestockQty(e.target.value)}
                                className="w-8 bg-transparent text-slate-800 border-none outline-none focus:ring-0 text-center text-[10px] font-bold"
                              />
                              <button
                                onClick={() => handleRestockSubmit(vehicle.id)}
                                className="p-0.5 text-emerald-600 hover:bg-emerald-100 rounded transition-colors cursor-pointer"
                              >
                                <CheckCircle2 size={12} />
                              </button>
                              <button
                                onClick={() => setRestockVehicleId(null)}
                                className="p-0.5 text-slate-400 hover:bg-slate-200 rounded transition-colors cursor-pointer"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center space-x-1.5">
                              <span className={`font-black text-sm ${isOutOfStock ? 'text-red-500' : 'text-slate-850'}`}>
                                {vehicle.quantity}
                              </span>
                              <button
                                onClick={() => {
                                  setRestockVehicleId(vehicle.id);
                                  setRestockQty('');
                                }}
                                className="w-4.5 h-4.5 rounded bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 text-emerald-600 font-extrabold text-xs flex items-center justify-center transition-colors cursor-pointer select-none"
                                title="Restock Stock"
                              >
                                +
                              </button>
                            </div>
                          )}
                        </td>

                        {/* Year */}
                        <td className="py-4 px-3 text-center text-slate-450 font-bold">
                          {details.year}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end space-x-2">
                            {/* Edit Button */}
                            <button
                              onClick={() => populateEditForm(vehicle)}
                              className="py-1 px-3 bg-white border border-slate-200 hover:border-slate-350 text-slate-600 font-bold rounded-lg text-[10px] cursor-pointer shadow-sm transition-colors"
                            >
                              Edit
                            </button>
                            {/* Delete Button */}
                            <button
                              onClick={() => handleDelete(vehicle.id)}
                              className="p-1.5 border border-red-100 hover:bg-red-50 text-red-500 rounded-lg transition-colors cursor-pointer"
                              title="Delete Listing"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* 5. Add / Edit Vehicle Modal Dialog Popover (Figma Grid Layout) */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-955/40 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white border border-slate-100 rounded-3xl p-8 shadow-2xl space-y-6 text-slate-800 animate-scale-in">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <h3 className="text-base font-black text-slate-950 tracking-tight">
                {editingId ? 'Modify vehicle' : 'Add new vehicle'}
              </h3>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer p-0.5 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Make */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Make</label>
                  <input
                    type="text"
                    required
                    value={make}
                    onChange={(e) => setMake(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/20 transition-all text-xs shadow-sm"
                  />
                </div>

                {/* Model */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Model</label>
                  <input
                    type="text"
                    required
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/20 transition-all text-xs shadow-sm"
                  />
                </div>

                {/* Category Selection Dropdown */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Category</label>
                  <select
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
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
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/20 transition-all text-xs shadow-sm"
                  />
                </div>

                {/* Price */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Price ($)</label>
                  <input
                    type="text"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/20 transition-all text-xs shadow-sm"
                  />
                </div>

                {/* Quantity */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Quantity</label>
                  <input
                    type="text"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/20 transition-all text-xs shadow-sm"
                  />
                </div>

                {/* Year */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Year</label>
                  <input
                    type="text"
                    required
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/20 transition-all text-xs shadow-sm"
                  />
                </div>

                {/* Mileage */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Mileage</label>
                  <input
                    type="text"
                    required
                    value={mileage}
                    onChange={(e) => setMileage(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/20 transition-all text-xs shadow-sm"
                  />
                </div>

                {/* Unsplash image ID */}
                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Unsplash image ID (Optional)</label>
                  <input
                    type="text"
                    value={unsplashId}
                    onChange={(e) => setUnsplashId(e.target.value)}
                    placeholder="e.g. 1503376780353 (optional - auto-matched if empty)"
                    className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/20 transition-all text-xs shadow-sm font-mono"
                  />
                </div>
              </div>

              {/* Submit & Close Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-3.5">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs transition-all cursor-pointer shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs flex items-center justify-center space-x-1 transition-all shadow-md shadow-red-500/10 cursor-pointer select-none"
                >
                  {saveMutation.isPending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>
                  ) : (
                    <span>{editingId ? 'Update vehicle' : 'Add vehicle'}</span>
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
