import axios from 'axios';

const API_BASE = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT on every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ─── Auth ──────────────────────────────────────────────────────
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
};

// ─── Content ───────────────────────────────────────────────────
export const contentApi = {
  generate:       (data)            => api.post('/content/generate', data),
  getHistory:     (page = 0, size = 20) => api.get(`/content/history?page=${page}&size=${size}`),
  getById:        (id)              => api.get(`/content/${id}`),
  delete:         (id)              => api.delete(`/content/${id}`),
  download:       (id)              => api.get(`/content/${id}/download`, { responseType: 'blob' }),
  getDashboard:   ()                => api.get('/content/dashboard'),
  getOutputTypes: ()                => api.get('/content/output-types'),
};

// ─── User ──────────────────────────────────────────────────────
export const userApi = {
  getProfile:  ()     => api.get('/users/me'),
  updateName:  (name) => api.put('/users/me/name', { name }),
};

// ─── Payments ──────────────────────────────────────────────────
export const paymentApi = {
  createOrder: () =>
    api.post('/payment/create-order'),

  verifyPayment: (payload) =>
    api.post('/payment/verify', payload),

  // Keep for future global/Stripe use
  createCheckout:      (successUrl, cancelUrl) => api.post('/payments/checkout', { successUrl, cancelUrl }),
  cancelSubscription:  ()                      => api.post('/payments/cancel'),
};

export default api;