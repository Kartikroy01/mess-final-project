import { Capacitor } from '@capacitor/core';

export const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  return Capacitor.getPlatform() === 'android' ? "http://10.0.2.2:5001" : "http://localhost:5001";
};

export const API_BASE_URL = `${getApiBaseUrl()}/api`;
