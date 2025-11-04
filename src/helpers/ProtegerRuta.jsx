import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Función simple para verificar si el usuario está autenticado.
 * (Cambia esta lógica si guardas tu token de otra forma)
 */
const isAuthenticated = () => {
  // Revisa si el token existe en localStorage
  const token = localStorage.getItem('token');
  // `!!token` convierte el resultado a un booleano (true si existe, false si no)
  return !!token;
};

/**
 * Este es el componente guardián.
 * Recibe 'children', que es el componente que queremos proteger (ej: <Home />).
 */
const ProtegerRuta = ({ children }) => {
  
  // Si el usuario NO está autenticado...
  if (!isAuthenticated()) {
    // Lo redirigimos a la página de login.
    // 'replace' evita que el usuario pueda "volver" a la ruta protegida
    // con el botón de atrás del navegador.
    return <Navigate to="/login" replace />;
  }

  // Si SÍ está autenticado, simplemente mostramos el componente
  // que estaba intentando cargar (los 'children').
  return children;
};

export default ProtegerRuta;