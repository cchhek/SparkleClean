import { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { Calendar, Trash2, Edit3, Plus, Search, Filter, Loader2, DollarSign, Sparkles, CheckCircle, RefreshCw, XCircle, Clock } from 'lucide-react';

const MOCK_BOOKINGS = [
  {
    id: 'b1',
    bookingRef: 'SPK-783291',
    customerName: 'Sarah Jenkins',
    customerEmail: 'sarah@example.com',
    customerPhone: '+61 411 222 333',
    customerAddress: '12 George St, Sydney NSW',
    propertyType: 'apartment',
    bedrooms: 2,
    bathrooms: 1,
    date: new Date().toISOString(),
    timeSlot: '10:00 AM - 12:00 PM',
    totalPrice: 155.0,
    status: 'CONFIRMED',
    service: { name: 'Regular House Cleaning' },
    addons: [{ addon: { name: 'Oven Cleaning', price: 50 } }],
    payment: { status: 'PAID', amount: 155.0 }
  },
  {
    id: 'b2',
    bookingRef: 'SPK-921827',
    customerName: 'Robert Vance',
    customerEmail: 'robert@vance.com',
    customerPhone: '+61 499 888 777',
    customerAddress: '45 Park Rd, Sydney NSW',
    propertyType: 'house',
    bedrooms: 3,
    bathrooms: 2,
    date: new Date(Date.now() + 86400000).toISOString(),
    timeSlot: '08:00 AM - 10:00 AM',
    totalPrice: 315.0,
    status: 'PENDING',
    service: { name: 'Deep Cleaning' },
    addons: [],
    payment: null
  }
];

const MOCK_SERVICES = [
  { id: 'regular-house-cleaning', name: 'Regular House Cleaning', price: 120.0, duration: 120, description: 'Routine upkeep cleaning.' },
  { id: 'deep-cleaning', name: 'Deep Cleaning', price: 200.0, duration: 240, description: 'Detailed scrub of baseboards.' }
];

const MOCK_ADDONS = [
  { id: 'oven-cleaning', name: 'Oven Cleaning', price: 50.0, description: 'Clean inside oven' },
  { id: 'fridge-cleaning', name: 'Fridge Cleaning', price: 40.0, description: 'Clean inside fridge' }
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [addons, setAddons] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected details
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Modal / Form state
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showAddonModal, setShowAddonModal] = useState(false);
  const [serviceForm, setServiceForm] = useState({ id: '', name: '', description: '', price: '', duration: '', image: '' });
  const [addonForm, setAddonForm] = useState({ id: '', name: '', price: '', description: '' });

  useEffect(() => {
    fetchDashboardData();
  }, [activeTab, statusFilter]); // reload when tab or filter changes

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'bookings') {
        const data = await api.getBookings({ status: statusFilter, search: searchQuery }).catch(() => MOCK_BOOKINGS);
        setBookings(data || MOCK_BOOKINGS);
      } else if (activeTab === 'services') {
        const data = await api.getServices().catch(() => MOCK_SERVICES);
        setServices(data || MOCK_SERVICES);
      } else if (activeTab === 'addons') {
        const data = await api.getAddons().catch(() => MOCK_ADDONS);
        setAddons(data || MOCK_ADDONS);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDashboardData();
  };

  const handleUpdateBookingStatus = async (id, status) => {
    try {
      const updated = await api.updateBookingStatus(id, status);
      setBookings(prev => prev.map(b => (b.id === id ? { ...b, status: updated.status } : b)));
      if (selectedBooking && selectedBooking.id === id) {
        setSelectedBooking(prev => ({ ...prev, status: updated.status }));
      }
    } catch (err) {
      alert(`Failed to update status: ${err.message}`);
    }
  };

  // SERVICE CRUD
  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    try {
      if (serviceForm.id) {
        // Edit Mode
        const updated = await api.updateService(serviceForm.id, serviceForm);
        setServices(prev => prev.map(s => (s.id === serviceForm.id ? updated : s)));
      } else {
        // Create Mode
        const created = await api.createService(serviceForm);
        setServices(prev => [...prev, created]);
      }
      setShowServiceModal(false);
      resetServiceForm();
    } catch (err) {
      alert(`Error saving service: ${err.message}`);
    }
  };

  const handleEditService = (service) => {
    setServiceForm(service);
    setShowServiceModal(true);
  };

  const handleDeleteService = async (id) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    try {
      await api.deleteService(id);
      setServices(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      alert(`Error deleting service: ${err.message}`);
    }
  };

  const resetServiceForm = () => {
    setServiceForm({ id: '', name: '', description: '', price: '', duration: '', image: '' });
  };

  // ADDON CRUD
  const handleAddonSubmit = async (e) => {
    e.preventDefault();
    try {
      if (addonForm.id) {
        const updated = await api.updateAddon(addonForm.id, addonForm);
        setAddons(prev => prev.map(a => (a.id === addonForm.id ? updated : a)));
      } else {
        const created = await api.createAddon(addonForm);
        setAddons(prev => [...prev, created]);
      }
      setShowAddonModal(false);
      resetAddonForm();
    } catch (err) {
      alert(`Error saving addon: ${err.message}`);
    }
  };

  const handleEditAddon = (addon) => {
    setAddonForm(addon);
    setShowAddonModal(true);
  };

  const handleDeleteAddon = async (id) => {
    if (!confirm('Are you sure you want to delete this addon?')) return;
    try {
      await api.deleteAddon(id);
      setAddons(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      alert(`Error deleting addon: ${err.message}`);
    }
  };

  const resetAddonForm = () => {
    setAddonForm({ id: '', name: '', price: '', description: '' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left space-y-6">
      
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-5 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-0">Admin Dashboard</h1>
          <p className="text-slate-500 text-xs">Manage online customer bookings, services catalog, and extras.</p>
        </div>
        <div className="flex space-x-2">
          {activeTab === 'services' && (
            <button
              onClick={() => { resetServiceForm(); setShowServiceModal(true); }}
              className="flex items-center space-x-1.5 bg-sky-500 hover:bg-sky-600 text-white font-bold px-4 py-2.5 rounded-xl transition-all shadow-md text-xs cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add Service</span>
            </button>
          )}
          {activeTab === 'addons' && (
            <button
              onClick={() => { resetAddonForm(); setShowAddonModal(true); }}
              className="flex items-center space-x-1.5 bg-sky-500 hover:bg-sky-600 text-white font-bold px-4 py-2.5 rounded-xl transition-all shadow-md text-xs cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add Addon</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-slate-200 gap-6">
        {['bookings', 'services', 'addons'].map(tab => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setSelectedBooking(null); }}
            className={`pb-3 text-sm font-bold capitalize transition-colors focus:outline-none border-b-2 cursor-pointer ${
              activeTab === tab
                ? 'border-sky-500 text-sky-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ----------------------------------------------------
          TAB 1: BOOKINGS MANAGEMENT
          ---------------------------------------------------- */}
      {activeTab === 'bookings' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Main Bookings List Column */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Search and filter row */}
            <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 border border-slate-200 rounded-2xl">
              <form onSubmit={handleSearchSubmit} className="relative flex-grow">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search ref, customer, email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </form>
              <div className="flex gap-2 shrink-0">
                <div className="relative flex items-center">
                  <Filter className="absolute left-3 h-4 w-4 text-slate-400 pointer-events-none" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="pl-9 pr-6 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none"
                  >
                    <option value="">All Statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
                <button
                  onClick={fetchDashboardData}
                  className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* List */}
            {loading ? (
              <div className="flex justify-center py-20 bg-white border border-slate-200 rounded-2xl">
                <Loader2 className="h-8 w-8 text-sky-500 animate-spin" />
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl text-slate-400 text-sm">
                No bookings found matching the filters.
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse text-left">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th className="px-5 py-3.5">Ref / Client</th>
                        <th className="px-5 py-3.5">Date & Slot</th>
                        <th className="px-5 py-3.5 text-right">Price</th>
                        <th className="px-5 py-3.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {bookings.map(b => (
                        <tr
                          key={b.id}
                          onClick={() => setSelectedBooking(b)}
                          className={`hover:bg-slate-50/70 transition-colors cursor-pointer ${
                            selectedBooking?.id === b.id ? 'bg-sky-50/40' : ''
                          }`}
                        >
                          <td className="px-5 py-3.5">
                            <span className="font-bold text-slate-900 block">#{b.bookingRef}</span>
                            <span className="text-slate-500 text-xs">{b.customerName}</span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="font-semibold text-slate-800 block">
                              {new Date(b.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                            <span className="text-slate-500 text-xs block truncate max-w-[150px]">{b.timeSlot}</span>
                          </td>
                          <td className="px-5 py-3.5 text-right font-extrabold text-slate-900">
                            ${b.totalPrice.toFixed(2)}
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold uppercase ${
                              b.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-700' :
                              b.status === 'COMPLETED' ? 'bg-indigo-50 text-indigo-700' :
                              b.status === 'CANCELLED' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'
                            }`}>
                              {b.status.toLowerCase()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Details Sidebar Panel */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs min-h-[400px]">
            {selectedBooking ? (
              <div className="space-y-6">
                {/* Title */}
                <div className="border-b border-slate-100 pb-3 flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">Booking Details</h3>
                    <span className="text-xs font-mono text-slate-400">Ref: #{selectedBooking.bookingRef}</span>
                  </div>
                  <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-bold uppercase ${
                    selectedBooking.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-700' :
                    selectedBooking.status === 'COMPLETED' ? 'bg-indigo-50 text-indigo-700' :
                    selectedBooking.status === 'CANCELLED' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {selectedBooking.status}
                  </span>
                </div>

                {/* Details Section */}
                <div className="space-y-4 text-xs text-slate-600">
                  <div className="space-y-1">
                    <span className="text-slate-400 block">Service Type</span>
                    <span className="font-bold text-slate-900 text-sm">{selectedBooking.service?.name}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-slate-400 block">Date</span>
                      <span className="font-semibold text-slate-800">{new Date(selectedBooking.date).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Time Slot</span>
                      <span className="font-semibold text-slate-800">{selectedBooking.timeSlot}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-400 block">Property Details</span>
                    <span className="font-semibold text-slate-800 capitalize">
                      {selectedBooking.propertyType} ({selectedBooking.bedrooms} Bed, {selectedBooking.bathrooms} Bath)
                    </span>
                  </div>

                  <div className="space-y-1 border-t border-slate-100 pt-3">
                    <span className="text-slate-400 block font-bold">Client Contact</span>
                    <span className="font-semibold text-slate-900 block">{selectedBooking.customerName}</span>
                    <span className="block">{selectedBooking.customerEmail}</span>
                    <span className="block">{selectedBooking.customerPhone}</span>
                    <span className="block italic text-slate-500 mt-1">{selectedBooking.customerAddress}</span>
                  </div>

                  {selectedBooking.addons.length > 0 && (
                    <div className="space-y-1.5 border-t border-slate-100 pt-3">
                      <span className="text-slate-400 block font-bold">Addons Included</span>
                      <ul className="list-disc pl-5 space-y-0.5 text-slate-500">
                        {selectedBooking.addons.map((a, i) => (
                          <li key={i}>{a.addon.name} (${a.addon.price.toFixed(2)})</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex justify-between items-center border-t border-slate-100 pt-3 text-sm">
                    <span className="font-bold text-slate-900">Total Price:</span>
                    <span className="font-extrabold text-sky-600">${selectedBooking.totalPrice.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-500">Payment Status:</span>
                    <span className={`font-bold ${selectedBooking.payment?.status === 'PAID' ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {selectedBooking.payment?.status || 'UNPAID'}
                    </span>
                  </div>
                </div>

                {/* Actions Dropdown */}
                <div className="space-y-2 border-t border-slate-100 pt-4">
                  <span className="text-slate-400 block text-xs font-bold uppercase tracking-wider">Update Booking Status</span>
                  <select
                    value={selectedBooking.status}
                    onChange={(e) => handleUpdateBookingStatus(selectedBooking.id, e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none text-xs bg-white"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2 text-center pt-20">
                <Calendar className="h-10 w-10 text-slate-300" />
                <span className="text-sm">Select a booking from the list to view its details.</span>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ----------------------------------------------------
          TAB 2: SERVICE MANAGEMENT
          ---------------------------------------------------- */}
      {activeTab === 'services' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loading ? (
            <div className="col-span-2 flex justify-center py-20 bg-white border border-slate-200 rounded-2xl">
              <Loader2 className="h-8 w-8 text-sky-500 animate-spin" />
            </div>
          ) : (
            services.map(service => (
              <div
                key={service.id}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex justify-between items-start"
              >
                <div className="space-y-3 max-w-[75%]">
                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-900 text-lg">{service.name}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed truncate max-w-sm">{service.description}</p>
                  </div>
                  <div className="flex gap-4 text-xs font-semibold text-slate-600">
                    <span className="bg-slate-100 px-2 py-1 rounded">Price: ${service.price.toFixed(2)}</span>
                    <span className="bg-slate-100 px-2 py-1 rounded">Duration: {service.duration}m</span>
                  </div>
                </div>
                <div className="flex space-x-2 shrink-0">
                  <button
                    onClick={() => handleEditService(service)}
                    className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition-colors"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteService(service.id)}
                    className="p-2 border border-slate-200 rounded-xl hover:bg-rose-50 text-rose-600 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ----------------------------------------------------
          TAB 3: ADDONS MANAGEMENT
          ---------------------------------------------------- */}
      {activeTab === 'addons' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-3 flex justify-center py-20 bg-white border border-slate-200 rounded-2xl">
              <Loader2 className="h-8 w-8 text-sky-500 animate-spin" />
            </div>
          ) : (
            addons.map(addon => (
              <div
                key={addon.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex justify-between items-start"
              >
                <div className="space-y-2">
                  <h3 className="font-bold text-slate-900 text-base">{addon.name}</h3>
                  <span className="text-xs bg-slate-100 text-slate-700 font-bold px-2 py-1 rounded-md block w-fit">
                    +${addon.price.toFixed(2)}
                  </span>
                  {addon.description && <p className="text-[11px] text-slate-400 leading-normal">{addon.description}</p>}
                </div>
                <div className="flex space-x-1 shrink-0">
                  <button
                    onClick={() => handleEditAddon(addon)}
                    className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500 transition-colors"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteAddon(addon.id)}
                    className="p-1.5 border border-slate-200 rounded-lg hover:bg-rose-50 text-rose-500 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ==========================================
          SERVICE MODAL (Add/Edit Service)
          ========================================== */}
      {showServiceModal && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-lg text-left space-y-4">
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">
              {serviceForm.id ? 'Edit Service' : 'Add New Service'}
            </h3>
            <form onSubmit={handleServiceSubmit} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="block font-bold text-slate-700">Service Name</label>
                <input
                  type="text"
                  required
                  value={serviceForm.name}
                  onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none"
                  placeholder="Regular House Cleaning"
                />
              </div>
              <div className="space-y-1">
                <label className="block font-bold text-slate-700">Description</label>
                <textarea
                  required
                  rows="3"
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none"
                  placeholder="Routine cleaning details..."
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={serviceForm.price}
                    onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none"
                    placeholder="120.00"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Duration (Minutes)</label>
                  <input
                    type="number"
                    required
                    value={serviceForm.duration}
                    onChange={(e) => setServiceForm({ ...serviceForm, duration: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none"
                    placeholder="120"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="block font-bold text-slate-700">Image URL</label>
                <input
                  type="text"
                  value={serviceForm.image || ''}
                  onChange={(e) => setServiceForm({ ...serviceForm, image: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none"
                  placeholder="https://..."
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowServiceModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-lg shadow"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          ADDON MODAL (Add/Edit Addon)
          ========================================== */}
      {showAddonModal && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-lg text-left space-y-4">
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">
              {addonForm.id ? 'Edit Addon' : 'Add New Addon'}
            </h3>
            <form onSubmit={handleAddonSubmit} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="block font-bold text-slate-700">Addon Name</label>
                <input
                  type="text"
                  required
                  value={addonForm.name}
                  onChange={(e) => setAddonForm({ ...addonForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none"
                  placeholder="Oven Cleaning"
                />
              </div>
              <div className="space-y-1">
                <label className="block font-bold text-slate-700">Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={addonForm.price}
                  onChange={(e) => setAddonForm({ ...addonForm, price: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none"
                  placeholder="50.00"
                />
              </div>
              <div className="space-y-1">
                <label className="block font-bold text-slate-700">Description</label>
                <input
                  type="text"
                  value={addonForm.description || ''}
                  onChange={(e) => setAddonForm({ ...addonForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none"
                  placeholder="Clean inside oven"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddonModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-lg shadow"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
