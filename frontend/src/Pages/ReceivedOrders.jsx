import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSearch } from 'react-icons/fa';
import Notification from '../Components/Notification';

const ReceivedOrders = () => {
  // State variables to manage orders, notifications, loading state, error state, and search term
  const [orders, setOrders] = useState([]);
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // useEffect hook to fetch received orders when the component mounts
  useEffect(() => {
    const fetchReceivedOrders = async () => {
      try {
        setLoading(true); // Set loading to true before fetching data
        const response = await axios.get('http://localhost:3000/api/orders/received');
        console.log('Response data:', response.data); // Log the response data for debugging
        // Filter orders to include only those received by the supplier
        const receivedOrders = response.data.filter(order => order.receivedToSupplier);
        setOrders(receivedOrders); // Update orders state with filtered data
        setError(null); // Clear any previous errors
      } catch (error) {
        console.error('Error fetching received orders:', error); // Log error to console
        setError('Failed to load received orders. Please try again later.'); // Set error message
        setNotification({ message: 'Failed to load received orders. Please try again later.', type: 'error' }); // Show notification
      } finally {
        setLoading(false); // Set loading to false after data fetch is complete
      }
    };

    fetchReceivedOrders(); // Call the fetch function
  }, []); // Empty dependency array means this effect runs once on mount

  // Filter received orders based on the search term
  const filteredOrders = orders.filter((order) =>
    order.product_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Received Orders</h1>

      {/* Notification component to display messages */}
      {notification.message && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification({ message: '', type: '' })}
        />
      )}

      {/* Search bar to filter received orders */}
      <div className="flex justify-between items-center mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Enter title or ID"
            className="px-4 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-56"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FaSearch className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="text-center py-8">
          <p className="text-gray-600">Loading received orders...</p>
        </div>
      )}

      {/* Error message */}
      {error && !loading && (
        <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">
          <p>{error}</p>
        </div>
      )}

      {/* Table to display received orders */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
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
                Date
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {/* Display filtered received orders */}
            {!loading && filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.id}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.product_title}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.quantity}
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
                    {order.created_at ? new Date(order.created_at).toLocaleString() : 'N/A'}
                  </td>
                </tr>
              ))
            ) : (
              !loading && (
                <tr>
                  <td colSpan="11" className="px-6 py-4 text-center text-sm text-gray-500">
                    No received orders available
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

export default ReceivedOrders;
