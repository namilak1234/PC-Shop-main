import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Nav from '../Components/Nav';
import Notification from '../Components/Notification'; // Import the Notification component
import { useAuth } from '../context/AuthContext'; // Import AuthContext for authentication

const MyOrders = () => {
  const [orders, setOrders] = useState([]); // State to store user's orders
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const [notification, setNotification] = useState(null); // State for notification messages
  const navigate = useNavigate();

  // Use AuthContext to get user and token
  const { user, token } = useAuth();

  // Protect the page: only allow logged-in users
  useEffect(() => {
    if (!token || !user) {
      navigate('/login');
    }
  }, [token, user, navigate]);

  // Function to navigate to the product list page
  const continueShopping = () => {
    navigate('/ProductList');
  };

  // Fetch orders when the component mounts
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        // Use token from AuthContext for authentication
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
        const response = await axios.get('http://localhost:3000/api/orders/user', config);
        // Filter out orders that have been marked as received
        const activeOrders = response.data.filter(order => !order.receivedToSupplier);
        setOrders(activeOrders);
        setError(null);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setError('Failed to load orders. Please try again later.');
        setNotification({ message: 'Failed to load orders. Please try again later.', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchOrders();
  }, [token]);

  // Handle marking an order as received
  const handleReceivedOrder = async (orderId) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      // Mark the order as received
      await axios.put(`http://localhost:3000/api/orders/${orderId}/received`, {}, config);
      setOrders(orders.filter(order => order.id !== orderId)); // Remove from current orders
      setNotification({ message: 'Order marked as received successfully.', type: 'success' });
    } catch (error) {
      console.error('Error updating order status:', error);
      setNotification({ message: 'Failed to update order status.', type: 'error' });
    }
  };

  // Handle canceling an order
  const handleCancelOrder = async (orderId) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      // Cancel the order
      await axios.delete(`http://localhost:3000/api/orders/${orderId}`, config);
      setOrders(orders.filter(order => order.id !== orderId));
      setNotification({ message: 'Order cancelled successfully.', type: 'success' });
    } catch (error) {
      console.error('Error canceling order:', error);
      setNotification({ message: 'Failed to cancel order.', type: 'error' });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Nav /> {/* Include the Nav component here */}
      <h1 className="text-2xl font-bold mb-4">Your Orders</h1>

      {/* Display notifications if any */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

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

      {/* Orders table */}
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
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
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
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    <button
                      onClick={() => handleReceivedOrder(order.id)}
                      className="bg-yellow-500 text-white px-2 py-1 rounded mr-2"
                    >
                      Received Order
                    </button>
                    <button
                      onClick={() => handleCancelOrder(order.id)}
                      className="bg-red-500 text-white px-2 py-1 rounded"
                    >
                      Cancel Order
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              !loading && (
                <tr>
                  <td colSpan="6" className="px-4 py-4 text-center text-sm text-gray-500">
                    No orders available
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      {/* Centered "Continue Shopping" button */}
      <div className="flex items-center justify-center mt-8">
        <button
          onClick={continueShopping}
          className="py-2 px-6 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
};

export default MyOrders;