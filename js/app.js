// js/app.js
(() => {
  // Recarrega header assim que a página abre (usa helper do auth.js)
  if (window.__auth?.refreshHeader) {
    window.__auth.refreshHeader();
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      window.__auth?.refreshHeader?.();
    });
  }
})();
