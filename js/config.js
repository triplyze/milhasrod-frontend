// js/config.js
// Valores visíveis no cliente (ok, são públicos mesmo).
// Se não tiver FRONTEND_URL injetado, usamos a origem atual.
window.APP_CONFIG = {
  API_BASE: 'https://milhasrod.vercel.app',
  SUPABASE_URL: 'https://fccdsfhsinwczrkpgnbw.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjY2RzZmhzaW53Y3pya3BnbmJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyOTUwMTUsImV4cCI6MjA3Mzg3MTAxNX0.HKH-qKlLJWUW6XevQnqXa82MpGfRSNFBBpLEls8fxXY'
};
window.FRONTEND_URL = (window.env && window.env.FRONTEND_URL) || window.location.origin;

// Debug rápido:
console.log('[config] FRONTEND_URL =', window.FRONTEND_URL);
console.log('[config] API_BASE =', window.APP_CONFIG.API_BASE);
