import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import cookie from 'react-cookies';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';

// Create Axios instance
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

interface JwtPayload {
  exp?: number;
}

const isTokenExpired = (token: string): boolean => {
  try {
    const { exp } = jwtDecode<JwtPayload>(token);
    if (!exp) return false;
    return exp * 1000 < Date.now();
  } catch {
    return false;
  }
};

const refreshAuthToken = async () => {
  const refreshToken = cookie.load('refreshToken');
  if (!refreshToken) return null;
  try {
    const { data } = await axios.post(
      `${import.meta.env.VITE_API_URL}/auth/refresh`,
      { refreshToken }
    );
    const newToken = data?.accessToken;
    if (newToken) {
      cookie.save('token', newToken, { path: '/' });
      return newToken;
    }
    return null;
  } catch (error) {
    return null;
  }
};

apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  let token = cookie.load('token');
  if (token && isTokenExpired(token)) {
    const newToken = await refreshAuthToken();
    if (newToken) {
      token = newToken;
    } else {
      token = null;
    }
  }

  if (token) {
    config.headers = config.headers ?? {};
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  const lang = localStorage.getItem('i18nextLng') || 'en';
  config.headers = config.headers ?? {};
  config.headers['Accept-Language'] = lang.toUpperCase();

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const message =
      (error.response?.data as any)?.message || error.message || 'Unexpected error';
    toast.error(message);
    return Promise.reject(error);
  }
);

export default apiClient;
