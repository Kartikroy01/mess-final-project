import { Capacitor } from '@capacitor/core';

export const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  // Use the live Render backend for all platforms
  return "https://mess-management-api.onrender.com";
};

export const API_BASE_URL = `${getApiBaseUrl()}/api`;
