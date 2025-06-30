import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Nav from '../Components/Nav';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import AuthContext for authentication

const OrderHistory = () => {
  // State variables to manage orders, loading state, and error state
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const { user, token } = useAuth(); // Use AuthContext for authentication

  // Protect the page: only allow logged-in users
  useEffect(() => {
    if (!token || !user) {
      navigate('/login');
    }
  }, [token, user, navigate]);

  // useEffect hook to fetch order history when the component mounts
  useEffect(() => {
    const fetchOrderHistory = async () => {
      try {
        setLoading(true); // Set loading to true before fetching data
        // Use token from AuthContext for authentication
        const config = {
          headers: {
            Authorization: `Bearer ${token}`, // Set authorization header with token
          },
        };
        // Make a GET request to fetch order history
        const response = await axios.get('http://localhost:3000/api/orders/history', config);
        setOrders(response.data); // Update orders state with fetched data
        setError(null); // Clear any previous errors
      } catch (error) {
        console.error('Error fetching order history:', error); // Log error to console
        setError('Failed to load order history. Please try again later.'); // Set error message
      } finally {
        setLoading(false); // Set loading to false after data fetch is complete
      }
    };

    if (token) fetchOrderHistory(); // Only fetch if token exists
  }, [token]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Nav /> {/* Include the Nav component for navigation */}
      <h1 className="text-2xl font-bold mb-4">Order History</h1>

      {/* Display loading message while data is being fetched */}
      {loading && (
        <div className="text-center py-8">
          <p className="text-gray-600">Loading order history...</p>
        </div>
      )}

      {/* Display error message if there is an error and data is not loading */}
      {error && !loading && (
        <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">
          <p>{error}</p>
        </div>
      )}

      {/* Table to display order history */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order ID
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order Date
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order Price
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {/* Conditional rendering of order rows or a message if no orders are available */}
            {!loading && orders.length > 0 ? (
              orders.map((order) => (
                <tr key={order.id}>
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
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    Rs. {order.total}
                  </td>
                </tr>
              ))
            ) : (
              !loading && (
                <tr>
                  <td colSpan="5" className="px-4 py-4 text-center text-sm text-gray-500">
                    No order history available
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

export default OrderHistory;