import React, { useState } from 'react';
import { FaBars, FaShoppingCart, FaUser } from 'react-icons/fa'; // Import the cart icon
import { Link } from 'react-router-dom'; // Import Link for navigation
import Dashboard from './Dashboard';

// Nav component definition
const Nav = ({ children }) => {
  // State to manage the open/closed state of the Dashboard sidebar
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);

  // Function to toggle the Dashboard sidebar open/closed state
  const toggleDashboard = () => {
    setIsDashboardOpen(!isDashboardOpen);
  };

  return (
    <>
      {/* Navbar */}
      <nav className="bg-blue-800 text-white px-10 py-2 w-full flex items-center justify-between fixed top-0 left-0 right-0 z-30">
        <div className="flex items-center">
          {/* Button to toggle the Dashboard sidebar */}
          <button
            onClick={toggleDashboard}
            className="mr-4"
            aria-label="Toggle Dashboard"
          >
            <FaBars size={20} />
          </button>
          {/* Application title */}
          <h1 className="text-xl font-bold">PC House</h1>
        </div>

        <div className="flex items-center space-x-4">
          {/* Link to the cart page */}
          <Link to="/cart" aria-label="Cart">
            <FaShoppingCart size={25} /><span className='text-sm'>Cart</span>
          </Link>
          {/* Link to the cart page */}
          <Link to="/login" aria-label="Login">
            <FaUser className='ml-8' size={25} /><span className='text-sm ml-7'>Login</span>
          </Link>
        </div>
      </nav>

      {/* Dashboard sidebar component */}
      <Dashboard isOpen={isDashboardOpen} />

      {/* Main content area with padding for the fixed navbar */}
      <div className={`pt-16 transition-all duration-300 ${isDashboardOpen ? 'ml-64' : 'ml-0'}`}>
        {children}
      </div>

      {/* Optional overlay for mobile view to close the Dashboard when clicked outside */}
      {isDashboardOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={toggleDashboard}
        />
      )}
    </>
  );
};

export default Nav;
