import { Capacitor } from '@capacitor/core';

export const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  const platform = Capacitor.getPlatform();
  if (platform === 'android') return "http://10.0.2.2:5001";
  // Default to live Render backend for web
  return "https://mess-management-api.onrender.com";
};

export const API_BASE_URL = `${getApiBaseUrl()}/api`;
