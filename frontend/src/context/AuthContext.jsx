import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- CAMBIO 1: Verificar sesión con el servidor (Cookie) ---
  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        // Intentamos obtener el perfil usando la cookie
        const userData = await authService.getProfile();
        // Si el backend devuelve el objeto usuario directo:
        setUser(userData); 
      } catch (error) {
        // Si falla (401/403), no hay usuario logueado
        console.log("No hay sesión activa o expiró");
        setUser(null);
      } finally {
        // Terminó la verificación, mostramos la app
        setLoading(false);
      }
    };

    checkAuthentication();
  }, []);

  // Función de login
  const login = async (email, password) => {
    try {
      const data = await authService.login(email, password);
      setUser(data.user); // El login devuelve { message, user }
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Función de registro
  const register = async (email, password, name) => {
    try {
      const data = await authService.register(email, password, name);
      setUser(data.user);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // --- CAMBIO 2: Logout asíncrono ---
  const logout = async () => {
    try {
      await authService.logout(); // Avisar al backend para borrar cookie
    } catch (error) {
      console.error(error);
    }
    setUser(null); // Limpiar estado local
  };

  // Verificar si está autenticado
  const isAuthenticated = () => {
    return !!user;
  };

  const value = {
    user,
    login,
    register,
    logout,
    isAuthenticated,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};