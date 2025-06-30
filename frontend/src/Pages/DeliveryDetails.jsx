import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Nav from '../Components/Nav';
import Notification from '../Components/Notification'; // Import Notification component

const DeliveryDetails = () => {
  // State to store delivery details fetched from the server
  const [deliveryDetails, setDeliveryDetails] = useState([]);
  // State to track the detail being edited
  const [editingDetail, setEditingDetail] = useState(null);
  // State to manage form data for adding or editing delivery details
  const [formData, setFormData] = useState({
    fullName: '',
    streetAddress: '',
    apartment: '',
    city: '',
    phoneNumber: '',
    email: '',
  });
  // State to manage notifications (message and type)
  const [notification, setNotification] = useState({ message: '', type: '' });

  // Fetch delivery details from the server when the component mounts
  useEffect(() => {
    const fetchDeliveryDetails = async () => {
      try {
        const token = localStorage.getItem('token'); // Retrieve token from local storage
        const response = await axios.get('http://localhost:3000/api/orders/delivery-details', {
          headers: {
            Authorization: `Bearer ${token}`, // Pass token in the request headers
          },
        });
        setDeliveryDetails(response.data); // Update state with fetched delivery details
      } catch (error) {
        console.error('Failed to fetch delivery details:', error); // Log error to the console
      }
    };

    fetchDeliveryDetails(); // Call the function to fetch delivery details
  }, []);

  // Handle input changes in the form fields
  const handleInputChange = (e) => {
    const { name, value } = e.target; // Destructure name and value from the event target
    setFormData((prevData) => ({
      ...prevData, // Spread previous form data
      [name]: value, // Update the specific field with the new value
    }));
  };

  // Handle adding a new delivery detail
  const handleAdd = async () => {
    if (!formData.fullName || !formData.streetAddress || !formData.city || !formData.phoneNumber || !formData.email) {
      alert('Please fill in all required fields.');
      return;
    }

    // Validate phone number
  const phoneRegex = /^\d{10}$/;
  if (!phoneRegex.test(formData.phoneNumber)) {
    alert('Please enter a valid 10-digit phone number.');
    return;
  }

  // Validate email address
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(formData.email)) {
    alert('Please enter a valid email address.');
    return;
  }
    try {
      const token = localStorage.getItem('token'); // Retrieve token from local storage
      const response = await axios.post('http://localhost:3000/api/orders/delivery-details', formData, {
        headers: {
          Authorization: `Bearer ${token}`, // Pass token in the request headers
        },
      });
      setDeliveryDetails([...deliveryDetails, response.data]); // Add the new detail to the state
      resetForm(); // Reset the form after adding
      setNotification({ message: 'Delivery detail added successfully', type: 'success' }); // Show success notification
    } catch (error) {
      console.error('Failed to add delivery detail:', error); // Log error to the console
      setNotification({ message: 'Failed to add delivery detail', type: 'error' }); // Show error notification
    }
  };

  // Handle editing an existing delivery detail
  const handleEdit = (detail) => {
    setEditingDetail(detail); // Set the detail being edited
    setFormData(detail); // Populate the form with the detail's data
  };

  // Handle updating an existing delivery detail
  const handleUpdate = async () => {
    if (!formData.fullName || !formData.streetAddress || !formData.city || !formData.phoneNumber || !formData.email) {
      alert('Please fill in all required fields.');
      return;
    }

    // Validate phone number
  const phoneRegex = /^\d{10}$/;
  if (!phoneRegex.test(formData.phoneNumber)) {
    alert('Please enter a valid 10-digit phone number.');
    return;
  }

  // Validate email address
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(formData.email)) {
    alert('Please enter a valid email address.');
    return;
  }
    try {
      const token = localStorage.getItem('token'); // Retrieve token from local storage
      await axios.put(`http://localhost:3000/api/orders/delivery-details/${editingDetail.id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`, // Pass token in the request headers
        },
      });
      // Update the state with the updated detail
      setDeliveryDetails(deliveryDetails.map(detail => detail.id === editingDetail.id ? formData : detail));
      setEditingDetail(null); // Clear the editing state
      resetForm(); // Reset the form after updating
      setNotification({ message: 'Delivery detail updated successfully', type: 'success' }); // Show success notification
    } catch (error) {
      console.error('Failed to update delivery detail:', error); // Log error to the console
      setNotification({ message: 'Failed to update delivery detail', type: 'error' }); // Show error notification
    }
  };

  // Handle deleting a delivery detail
  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token'); // Retrieve token from local storage
      await axios.delete(`http://localhost:3000/api/orders/delivery-details/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`, // Pass token in the request headers
        },
      });
      // Remove the deleted detail from the state
      setDeliveryDetails(deliveryDetails.filter(detail => detail.id !== id));
      setNotification({ message: 'Delivery detail deleted successfully', type: 'success' }); // Show success notification
    } catch (error) {
      console.error('Failed to delete delivery detail:', error); // Log error to the console
      setNotification({ message: 'Failed to delete delivery detail', type: 'error' }); // Show error notification
    }
  };

  // Reset the form to its initial state
  const resetForm = () => {
    setFormData({
      fullName: '',
      streetAddress: '',
      apartment: '',
      city: '',
      phoneNumber: '',
      email: '',
    });
    setEditingDetail(null); // Clear the editing state
  };

  // Close the notification
  const closeNotification = () => {
    setNotification({ message: '', type: '' }); // Clear the notification state
  };

  return (
    <div className="container mx-auto p-6">
      <Nav /> {/* Navigation component */}
      <Notification
        message={notification.message} // Notification message
        type={notification.type} // Notification type (success or error)
        onClose={closeNotification} // Close notification handler
      />
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Form for adding or editing delivery details */}
        <div className="lg:w-1/2 bg-white rounded p-6">
          <h1 className="text-2xl font-bold mb-6">Delivery Details</h1>
          <form>
            {/* Input fields for delivery details */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Full Name*</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                required
                className="border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-1 focus:shadow-outline bg-gray-100"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Street Address*</label>
              <input
                type="text"
                name="streetAddress"
                value={formData.streetAddress}
                onChange={handleInputChange}
                required
                className="border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-1 focus:shadow-outline bg-gray-100"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Apartment, floor, etc. (optional)</label>
              <input
                type="text"
                name="apartment"
                value={formData.apartment}
                onChange={handleInputChange}
                className="border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-1 focus:shadow-outline bg-gray-100"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Town/City*</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                required
                className="border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-1 focus:shadow-outline bg-gray-100"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Phone Number*</label>
              <input
                type="text"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                required
                className="border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-1 focus:shadow-outline bg-gray-100"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Email Address*</label>
              <input
                type="text"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-1 focus:shadow-outline bg-gray-100"
              />
            </div>
            {/* Buttons for adding/updating and resetting the form */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={editingDetail ? handleUpdate : handleAdd}
                className="w-full mt-6 py-3 px-6 bg-green-600 text-white rounded hover:bg-green-500 transition-colors"
              >
                {editingDetail ? 'Update Details' : 'Add Details'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="w-full mt-6 py-3 px-6 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              >
                Clear All
              </button>
            </div>
          </form>
        </div>

        {/* Display saved delivery details */}
        <div className="lg:w-1/2 bg-white rounded p-6">
          <h2 className="text-xl font-bold mb-4">Saved Delivery Details</h2>
          {deliveryDetails.length > 0 ? (
            deliveryDetails.map(detail => (
              <div key={detail.id} className="border p-4 mb-4 rounded">
                <p><strong>Full Name:</strong> {detail.fullName}</p>
                <p><strong>Street Address:</strong> {detail.streetAddress}</p>
                <p><strong>Apartment:</strong> {detail.apartment}</p>
                <p><strong>City:</strong> {detail.city}</p>
                <p><strong>Phone Number:</strong> {detail.phoneNumber}</p>
                <p><strong>Email:</strong> {detail.email}</p>
                {/* Buttons for editing and deleting a delivery detail */}
                <button
                  type="button"
                  onClick={() => handleEdit(detail)}
                  className="mr-2 py-1 px-3 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(detail.id)}
                  className="py-1 px-3 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            ))
          ) : (
            <p>No details found. Please add a new delivery detail.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeliveryDetails;