import { Capacitor } from '@capacitor/core';

export const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  
  // Check if running on localhost (browser)
  if (typeof window !== 'undefined' && 
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return "http://localhost:5001";
  }

  // Use the live Render backend for all other platforms (including mobile)
  return "https://mess-management-api.onrender.com";
};

export const API_BASE_URL = `${getApiBaseUrl()}/api`;
