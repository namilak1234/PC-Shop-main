import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from "../context/AuthContext";

// Spinner while checking auth/loading state
const LoadingScreen = () => (
  <div className="flex justify-center items-center h-screen">
    Loading...
  </div>
);

// Route for authenticated users only
export const ProtectedRoute = () => {
  const { user, token } = useAuth();
  const location = useLocation();

  // Redirect to login if not authenticated
  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  // Render child routes if authenticated
  return <Outlet />;
};

// Route for admin users only
export const AdminRoute = () => {
  const { isAuthenticated, hasRole, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking auth
  if (loading) return <LoadingScreen />;
  // Redirect to login if not authenticated
  if (!isAuthenticated()) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  // Redirect to home if not admin
  if (!hasRole('admin')) return <Navigate to="/" replace />;

  // Render child routes if admin
  return <Outlet />;
};

// Route for delivery partners only
export const DeliveryRoute = () => {
  const { isAuthenticated, hasRole, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking auth
  if (loading) return <LoadingScreen />;
  // Redirect to login if not authenticated
  if (!isAuthenticated()) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  // Redirect to home if not delivery partner
  if (!hasRole('delivery_partner')) return <Navigate to="/" replace />;

  // Render child routes if delivery partner
  return <Outlet />;
};

// Route for checkout process (must be logged in)
export const CheckoutRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking auth
  if (loading) return <LoadingScreen />;
  // Redirect to login if not authenticated
  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Render child routes if authenticated
  return <Outlet />;
};

// Public route, no restrictions (anyone can access)
export const PublicRoute = () => <Outlet />;