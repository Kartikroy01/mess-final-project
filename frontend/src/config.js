import { Capacitor } from '@capacitor/core';

export const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  
  // Always use Render for Native Mobile App
  if (Capacitor.getPlatform() !== 'web') {
    return "https://mess-management-api.onrender.com";
  }

  // Check if running on localhost (browser)
  if (typeof window !== 'undefined' && 
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return "http://localhost:5001";
  }

  // Fallback to Render
  return "https://mess-management-api.onrender.com";
};

export const API_BASE_URL = `${getApiBaseUrl()}/api`;
