const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API error: ${response.statusText}`);
  }

  // Handle 204 No Content or empty responses
  if (response.status === 204) return null;
  return response.json();
}

export const api = {
  // Authentication
  login: async (email, password) => {
    const data = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  },

  register: async (email, password, name) => {
    const data = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: async () => {
    try {
      const data = await request('/auth/me');
      localStorage.setItem('user', JSON.stringify(data.user));
      return data.user;
    } catch (e) {
      api.logout();
      return null;
    }
  },

  getUserFromStorage: () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  isAdmin: () => {
    const user = api.getUserFromStorage();
    return user && user.role === 'ADMIN';
  },

  // Services
  getServices: () => request('/services'),
  getAddons: () => request('/services/addons'),
  createService: (data) => request('/services', { method: 'POST', body: JSON.stringify(data) }),
  updateService: (id, data) => request(`/services/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteService: (id) => request(`/services/${id}`, { method: 'DELETE' }),
  
  createAddon: (data) => request('/services/addons', { method: 'POST', body: JSON.stringify(data) }),
  updateAddon: (id, data) => request(`/services/addons/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAddon: (id) => request(`/services/addons/${id}`, { method: 'DELETE' }),

  // Bookings
  getUnavailableSlots: (date) => request(`/bookings/unavailable-slots${date ? `?date=${date}` : ''}`),
  createBooking: (data) => request('/bookings', { method: 'POST', body: JSON.stringify(data) }),
  
  // Admin Bookings
  getBookings: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);
    const queryStr = params.toString() ? `?${params.toString()}` : '';
    return request(`/bookings${queryStr}`);
  },
  
  getBookingDetails: (id) => request(`/bookings/${id}`),
  updateBookingStatus: (id, status) => request(`/bookings/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),

  // Payments
  createCheckoutSession: (bookingId) => request('/payments/create-checkout-session', { method: 'POST', body: JSON.stringify({ bookingId }) }),
  verifyCheckoutSession: (sessionId, bookingId) => request('/payments/verify-checkout-session', { method: 'POST', body: JSON.stringify({ sessionId, bookingId }) }),
};
