import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Hardcoded mock user to bypass login
  const [user, setUser] = useState({ name: 'Demo Admin', role: 'owner' });
  const [loading, setLoading] = useState(false);

  const login = async (username, password) => {
    // Mock login success
    setUser({ name: 'Demo Admin', role: 'owner' });
  };

  const register = async (name, email, password, role) => {
    // Mock register success
  };

  const logout = () => {
    // Optional: you can leave this empty if you don't want them to ever log out
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
