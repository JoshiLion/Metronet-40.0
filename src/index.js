import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import './index.css';
import App from './App';

// 🔁 Restaurar la última ruta si la app arranca en "/"
(function restoreLastPath() {
  try {
    const lastPath = localStorage.getItem('lastPath');
    const current = window.location.pathname + window.location.search + window.location.hash;

    // Solo redirige si estás en raíz "/" (evita romper deep links)
    if (lastPath && current === '/') {
      // Usa replace para no llenar el historial
      window.history.replaceState(null, '', lastPath);
    }
  } catch {
    // Si localStorage está bloqueado, ignora y sigue normal
  }
})();

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
      <App />
    </AuthProvider>
  </BrowserRouter>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
