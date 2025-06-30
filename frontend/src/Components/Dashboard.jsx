import React, { useState } from 'react';
import { Home, ShoppingCart, Clock, Truck, Edit, LogOut, ChevronDown } from 'lucide-react';
import { BiCategory } from "react-icons/bi";
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Dashboard component definition
const Dashboard = ({ isOpen }) => {
  // State to manage the expanded/collapsed state of menu sections
  const [expanded, setExpanded] = useState({
    products: true,
    orders: true,
    delivery: true
  });

  // Hook to navigate programmatically
  const navigate = useNavigate();

  // Function to toggle the expanded state of a menu section
  const toggleMenu = (menu) => {
    setExpanded({
      ...expanded,
      [menu]: !expanded[menu]
    });
  };

  // Function to handle user logout
  const { logout } = useAuth();

  return (
    <div
      className={`fixed top-0 left-0 w-64 bg-blue-800 text-white h-screen transition-transform duration-300 ease-in-out transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} z-20 shadow-lg pt-16`}
    >
      {/* Scrollable container for the menu items */}
      <div className="flex-1 overflow-y-auto">
        <ul>
          {/* Home menu item */}
          <Link to="/">
            <li className="px-4 py-3 flex items-center bg-blue-600">
              <Home size={20} className="mr-3" />
              <span>Home</span>
            </li>
          </Link>

          {/* Manage Products menu section */}
          <li>
            <div
              className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-blue-700"
              onClick={() => toggleMenu('products')}
            >
              <div className="flex items-center">
                <ShoppingCart size={20} className="mr-3" />
                <span>Manage Products</span>
              </div>
              <ChevronDown size={16} className={`transition-transform ${expanded.products ? 'rotate-180' : ''}`} />
            </div>
            {expanded.products && (
              <ul className="bg-blue-900">
                {/* Product List submenu item */}
                <Link to="/ProductList">
                  <li className="px-4 py-2 pl-12 hover:bg-blue-700">
                    <ShoppingCart size={16} className="mr-2 inline" />
                    <span>Product List</span>
                  </li>
                </Link>
                {/* Category submenu item */}
                <Link to="/Category">
                  <li className="px-4 py-2 pl-12 hover:bg-blue-700">
                    <BiCategory size={16} className="mr-2 inline" />
                    <span>Category</span>
                  </li>
                </Link>
              </ul>
            )}
          </li>

          {/* Manage Orders menu section */}
          <li>
            <div
              className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-blue-700"
              onClick={() => toggleMenu('orders')}
            >
              <div className="flex items-center">
                <ShoppingCart size={20} className="mr-3" />
                <span>Manage Orders</span>
              </div>
              <ChevronDown size={16} className={`transition-transform ${expanded.orders ? 'rotate-180' : ''}`} />
            </div>
            {expanded.orders && (
              <ul className="bg-blue-900">
                {/* Orders submenu item */}
                <Link to="/MyOrders">
                  <li className="px-4 py-2 pl-12 hover:bg-blue-700">
                    <ShoppingCart size={16} className="mr-2 inline" />
                    <span>Orders</span>
                  </li>
                </Link>
                {/* Order History submenu item */}
                <Link to="/OrderHistory">
                  <li className="px-4 py-2 pl-12 hover:bg-blue-700">
                    <Clock size={16} className="mr-2 inline" />
                    <span>Order History</span>
                  </li>
                </Link>
              </ul>
            )}
          </li>

          {/* Delivery menu section */}
          <li>
            <div
              className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-blue-700"
              onClick={() => toggleMenu('delivery')}
            >
              <div className="flex items-center">
                <Truck size={20} className="mr-3" />
                <span>Delivery</span>
              </div>
              <ChevronDown size={16} className={`transition-transform ${expanded.delivery ? 'rotate-180' : ''}`} />
            </div>
            {expanded.delivery && (
              <ul className="bg-blue-900">
                {/* Edit Details submenu item */}
                <Link to="/DeliveryDetails">
                  <li className="px-4 py-2 pl-12 hover:bg-blue-700">
                    <Edit size={16} className="mr-2 inline" />
                    <span>Edit Details</span>
                  </li>
                </Link>
              </ul>
            )}
          </li>

          {/* Logout menu item */}
          <li
            className="px-4 py-3 flex items-center hover:bg-blue-700 cursor-pointer"
            onClick={logout}
          >
            <LogOut size={20} className="mr-3" />
            <span>Log out</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
