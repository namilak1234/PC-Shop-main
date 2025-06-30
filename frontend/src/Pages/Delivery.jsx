import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSearch } from 'react-icons/fa';
import { LogOut } from 'lucide-react';
import Notification from '../Components/Notification';
import { useAuth } from '../context/AuthContext'; // Import AuthContext for authentication
import { useNavigate } from 'react-router-dom';

const Orders = () => {
  // State to store orders
  const [orders, setOrders] = useState([]);

  // State for notification messages
  const [notification, setNotification] = useState({ message: '', type: '' });

  // State for loading indicator
  const [loading, setLoading] = useState(true);

  // State for error messages
  const [error, setError] = useState(null);

  // State for search term
  const [searchTerm, setSearchTerm] = useState('');

  // Use AuthContext and navigation
  const { logout, user, token } = useAuth();
  const navigate = useNavigate();

  // Protect the delivery page: only allow delivery_partner users
  useEffect(() => {
    if (!token || !user || user.role !== 'delivery_partner') {
      navigate('/login');
    }
  }, [token, user, navigate]);

  // Fetch orders from the backend when the component mounts
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true); // Set loading to true before fetching
        // Pass token for authentication if required by backend
        const response = await axios.get('http://localhost:3000/api/orders', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrders(response.data); // Store fetched orders in state
        setError(null); // Clear any previous errors
      } catch (error) {
        console.error('Error fetching orders:', error);
        setError('Failed to load orders. Please try again later.'); // Set error message
        setNotification({ message: 'Failed to load orders. Please try again later.', type: 'error' }); // Show error notification
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    };

    if (token) fetchOrders();
  }, [token]);

  // Handle checkbox change to update order status
  const handleCheckboxChange = async (orderId, isChecked) => {
    try {
      // Send request to update order status
      await axios.put(
        'http://localhost:3000/api/orders/update-status',
        { orderId, receivedToSupplier: isChecked },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Remove the order from the list after updating
      setOrders((prevOrders) =>
        prevOrders.filter((order) => order.id !== orderId)
      );

      // Show success notification
      setNotification({ message: 'Order status updated successfully', type: 'success' });
    } catch (error) {
      console.error('Error updating order status:', error);
      // Show error notification if update fails
      setNotification({ message: 'Failed to update order status', type: 'error' });
    }
  };

  // Filter orders based on the search term
  const filteredOrders = orders.filter((order) =>
    order.product_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Function to handle user logout using AuthContext
  const handleLogout = () => {
    logout(); // This will clear auth and redirect to login
  };


  return (
    <div className="max-w-6xl mx-auto px-4 py-8 pt-24">
      {/* Navbar */}
      <nav className="bg-blue-800 text-white px-10 py-5 w-full flex justify-between items-center fixed top-0 left-0 right-0 z-30">
        {/* Application title */}
        <h1 className="text-xl font-bold">PC House - Delivery Updates</h1>
        {/* Logout Button */}
        <button
          className="flex items-center ml-auto px-4 font-semibold"
          onClick={handleLogout}
        >
          <LogOut size={20} className="mr-2" />
          Logout
        </button>
      </nav>

      {/* Page title */}
      <h2 className="text-2xl font-bold mb-4 mt-auto">Customer Orders</h2>

      {/* Notification component to display messages */}
      {notification.message && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification({ message: '', type: '' })} // Clear notification on close
        />
      )}

      {/* Search bar to filter orders */}
      <div className="flex justify-between items-center mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Enter title or ID"
            className="px-4 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-56"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} // Update search term on input change
          />
          <FaSearch className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="text-center py-8">
          <p className="text-gray-600">Loading orders...</p>
        </div>
      )}

      {/* Error message */}
      {error && !loading && (
        <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">
          <p>{error}</p>
        </div>
      )}

      {/* Table to display orders */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer Address
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer Phone
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer Email
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Payment Method
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Received to Customer
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {/* Display filtered orders */}
            {!loading && filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.id}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.name}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.address}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.phone}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.email}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.payment_method}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    <input
                      type="checkbox"
                      checked={order.receivedToSupplier}
                      onChange={(e) => handleCheckboxChange(order.id, e.target.checked)} // Update order status on checkbox change
                    />
                  </td>
                </tr>
              ))
            ) : (
              !loading && (
                <tr>
                  <td colSpan="11" className="px-6 py-4 text-center text-sm text-gray-500">
                    No orders available
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Orders;