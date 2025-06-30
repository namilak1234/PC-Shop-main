import { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';
import Notification from '../Components/Notification';

// Create the AuthContext object
export const AuthContext = createContext();

// AuthProvider component to wrap the app and provide auth state
export const AuthProvider = ({ children }) => {
  // Initialize user state from token in localStorage (if available)
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        return jwtDecode(token); // Decode token to get user info
      } catch {
        // If token is invalid, clear storage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return null;
      }
    }
    return null;
  });

  // Initialize token state from localStorage
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  // Notification state for showing auth-related messages
  const [notification, setNotification] = useState({ message: '', type: '' });

  // Login function: set user and token, save to localStorage
  const login = (userData, token) => {
    setUser(userData);
    setToken(token);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
  };

  // Logout function: clear user and token, show notification, redirect
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setNotification({ message: 'Logged out successfully.', type: 'success' });
    setTimeout(() => {
      window.location.href = '/';
    }, 1000); // Show notification for 1.5 seconds before redirect
  };

  // Check if user is authenticated
  const isAuthenticated = () => !!token && !!user;

  // Check if user has a specific role
  const hasRole = (role) => {
    if (!user) return false;
    return user.role === role || (Array.isArray(user.roles) && user.roles.includes(role));
  };

  // Keep user state in sync with token changes
  useEffect(() => {
    if (token) {
      try {
        setUser(jwtDecode(token));
      } catch {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } else {
      setUser(null);
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      logout,
      isAuthenticated,
      hasRole,
    }}>
      {/* Show notification if present */}
      {notification.message && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification({ message: '', type: '' })}
        />
      )}
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for easy usage of AuthContext
export const useAuth = () => useContext(AuthContext);