import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSearch } from 'react-icons/fa';
import Notification from '../Components/Notification';

const Orders = () => {
  const [orders, setOrders] = useState([]); // State to store orders
  const [notification, setNotification] = useState({ message: '', type: '' }); // State for notification messages
  const [loading, setLoading] = useState(true); // State for loading indicator
  const [error, setError] = useState(null); // State for error messages
  const [searchTerm, setSearchTerm] = useState(''); // State for search term

  // Fetch orders from the backend when the component mounts
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:3000/api/orders');
        setOrders(response.data);
        setError(null);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setError('Failed to load orders. Please try again later.');
        setNotification({ message: 'Failed to load orders. Please try again later.', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Handle checkbox change to update order status
  const handleCheckboxChange = async (orderId, isChecked) => {
    try {
      await axios.put('http://localhost:3000/api/orders/update-status', { orderId, receivedToSupplier: isChecked });
      setOrders((prevOrders) =>
        prevOrders.filter((order) => order.id !== orderId) // Remove the order from the list
      );
      setNotification({ message: 'Order status updated successfully', type: 'success' });
    } catch (error) {
      console.error('Error updating order status:', error);
      setNotification({ message: 'Failed to update order status', type: 'error' });
    }
  };

  // Filter orders based on the search term
  const filteredOrders = orders.filter((order) =>
    order.product_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Customer Orders</h1>

      {/* Notification component to display messages */}
      {notification.message && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification({ message: '', type: '' })}
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
        onChange={(e) => setSearchTerm(e.target.value)}
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
                    <input
                      type="checkbox"
                      checked={order.receivedToSupplier}
                      onChange={(e) => handleCheckboxChange(order.id, e.target.checked)}
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

      {/* Button to add a new order */}
      {/* <div className="fixed bottom-4 right-4">
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium">
          Add to order
        </button>
      </div> */}
    </div>
  );
};

export default Orders;
