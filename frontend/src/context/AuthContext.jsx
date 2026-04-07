import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { setToken } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // On mount, there's no memory token. 
  // We just set loading to false.
  useEffect(() => {
    setLoading(false);
  }, []);

  const login = (token, name) => {
    setToken(token); // Store in memory only
    const decoded = jwtDecode(token);
    setUser({ email: decoded.sub, name });
    navigate('/dashboard');
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
