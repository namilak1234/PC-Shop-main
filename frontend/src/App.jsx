import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

// Pages
import Home from './Pages/Home';
import Login from './Pages/Login';
import Admin from './Pages/Admin';
import Delivery from './Pages/Delivery';
import ProductList from './Pages/ProductList';
import ProductDetail from './Pages/ProductDetail';
import Cart from './Pages/Cart';
import Checkout from './Pages/Checkout';
import Payment from './Pages/Payment';
import Success from './Pages/Success';
import MyOrders from './Pages/MyOrders';
import OrderHistory from './Pages/OrderHistory';
import Category from './Pages/Category';
import DeliveryDetails from './Pages/DeliveryDetails';
import NotFound from './Pages/NotFound';

// Auth Provider
import { AuthProvider } from './context/AuthContext';

// Protected Routes
import {
  ProtectedRoute,
  AdminRoute,
  DeliveryRoute,
  CheckoutRoute,
  PublicRoute
} from './Components/ProtectedRoute';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes - Anyone can access */}
          <Route element={<PublicRoute />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/productList" element={<ProductList />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/category" element={<Category />} />
          </Route>

          {/* User Account Routes - Authenticated users only */}
          <Route element={<ProtectedRoute />}>
            <Route path="/myOrders" element={<MyOrders />} />
            <Route path="/orderHistory" element={<OrderHistory />} />
          </Route>

          {/* Checkout Process Routes - Authenticated users only */}
          <Route element={<CheckoutRoute />}>
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/success" element={<Success />} />
            <Route path="/deliveryDetails" element={<DeliveryDetails />} />
          </Route>

          {/* Admin Routes - Only admin users can access */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<Admin />} />
          </Route>

          {/* Delivery Routes - Only delivery personnel can access */}
          <Route element={<DeliveryRoute />}>
            <Route path="/delivery" element={<Delivery />} />
          </Route>

          {/* 404 Route - Handle undefined routes */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
