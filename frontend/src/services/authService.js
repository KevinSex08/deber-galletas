// Asegúrate de que apunte a tu backend (puerto 3000)
const API_URL = 'http://localhost:3000/api/auth'; 

export const authService = {
  // Registrar nuevo usuario
  register: async (email, password, name) => {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // ← IMPORTANTE: Permite recibir la cookie
      body: JSON.stringify({ email, password, name })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al registrar usuario');
    }

    const data = await response.json();
    // YA NO guardamos nada en localStorage
    return data;
  },

  // Iniciar sesión
  login: async (email, password) => {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // ← IMPORTANTE
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al iniciar sesión');
    }

    const data = await response.json();
    // YA NO guardamos nada en localStorage
    return data;
  },

  // Cerrar sesión
  logout: async () => {
    try {
      await fetch(`${API_URL}/logout`, {
        method: 'POST',
        credentials: 'include' // ← Para borrar la cookie específica
      });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
    // Ya no es necesario borrar localStorage manualmente
  },

  // Obtener perfil del servidor (Reemplaza a getCurrentUser síncrono)
  getProfile: async () => {
    const response = await fetch(`${API_URL}/me`, {
      credentials: 'include' // ← Envía la cookie automáticamente
      // Ya NO enviamos el header Authorization: Bearer
    });

    if (!response.ok) {
      throw new Error('Error al obtener perfil');
    }

    return response.json();
  },

  // Wrapper para peticiones autenticadas
  fetchWithAuth: async (url, options = {}) => {
    const config = {
      ...options,
      credentials: 'include', // ← Asegura que la cookie viaje
      headers: {
        ...options.headers,
        'Content-Type': 'application/json'
        // Eliminado Authorization: Bearer
      }
    };

    const response = await fetch(url, config);
    
    if (response.status === 401) {
      // Si falla, intentamos logout y redirigir
      await authService.logout();
      window.location.href = '/login';
      throw new Error('Sesión expirada');
    }

    return response;
  }
  
  // NOTA: Se eliminaron 'getToken', 'isAuthenticated' y 'getCurrentUser' 
  // porque ya no podemos leer el token ni el usuario de localStorage síncronamente.
};