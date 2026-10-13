import axios from 'axios';
import { getApiBaseUrl } from '../lib/runtime-config';

export const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Si ya estamos en /login, el 401 vino de una request anónima: no hay
      // sesión que limpiar y redirigir acá recarga el documento en bucle
      // infinito (window.location.href recarga aunque la URL no cambie).
      if (window.location.pathname !== '/login') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
