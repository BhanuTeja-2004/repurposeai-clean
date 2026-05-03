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
  login: (data) => api["post"]("/auth/login", data),
  register: (data) => api["post"]("/auth/register", data),
};

export const contentApi = {
  generate: (data) => api["post"]("/content/generate", data),
  getHistory: (page, size) => api["get"]("/content/history?page=" + (page||0) + "&size=" + (size||10)),
  getById: (id) => api["get"]("/content/" + id),
  delete: (id) => api["delete"]("/content/" + id),
  getDashboard: () => api["get"]("/content/dashboard"),
  download: (id) => api["get"]("/content/" + id + "/download", { responseType: "blob" }),
  getOutputTypes: () => api["get"]("/content/output-types"),
};

export const userApi = {
  getProfile: () => api["get"]("/users/me"),
  updateName: (name) => api["put"]("/users/me/name", { name }),
};

export const paymentApi = {
  createOrder: () => api["post"]("/payment/create-order"),
  verifyPayment: (data) => api["post"]("/payment/verify", data),
};

export default api;
