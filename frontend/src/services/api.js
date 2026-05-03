import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = "Bearer " + token;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (data) => api["post"]("/api/auth/login", data),
  register: (data) => api["post"]("/api/auth/register", data),
};

export const contentApi = {
  generate: (data) => api["post"]("/api/content/generate", data),
  getHistory: (page, size) => api["get"]("/api/content/history?page=" + (page||0) + "&size=" + (size||10)),
  getById: (id) => api["get"]("/api/content/" + id),
  delete: (id) => api["delete"]("/api/content/" + id),
  getDashboard: () => api["get"]("/api/content/dashboard"),
  download: (id) => api["get"]("/api/content/" + id + "/download", { responseType: "blob" }),
  getOutputTypes: () => api["get"]("/api/content/output-types"),
};

export const userApi = {
  getProfile: () => api["get"]("/api/users/me"),
  updateName: (name) => api["put"]("/api/users/me/name", { name }),
};

export const paymentApi = {
  createOrder: () => api["post"]("/api/payment/create-order"),
  verifyPayment: (data) => api["post"]("/api/payment/verify", data),
};

export default api;
