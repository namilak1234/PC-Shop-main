import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Nav from '../Components/Nav';

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // Destructure cart and billing details from navigation state
  const { cartItems, subtotal, shippingCost, discount, billingDetails = {} } = location.state || {};

  // State for payment form fields
  const [formData, setFormData] = useState({
    cardholderName: '',
    cardNumber: '',
    expiry: '',
    cvc: ''
  });

  // Handle input changes and update formData state
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  // Validate card number (16 digits)
  const validateCardNumber = (number) => {
    const regex = /^\d{16}$/;
    return regex.test(number);
  };

  // Validate expiry date (MM / YY format)
  const validateExpiry = (expiry) => {
    const regex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    return regex.test(expiry);
  };

  // Validate CVC (3 digits)
  const validateCVC = (cvc) => {
    const regex = /^\d{3}$/;
    return regex.test(cvc);
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    const { cardholderName, cardNumber, expiry, cvc } = formData;

    // Check if all fields are filled
    if (!cardholderName || !cardNumber || !expiry || !cvc) {
      alert('Please fill in all fields.');
      return;
    }

    // Validate card number
    if (!validateCardNumber(cardNumber)) {
      alert('Please enter a valid card number.');
      return;
    }

    // Validate expiry date
    if (!validateExpiry(expiry)) {
      alert('Please enter a valid expiry date in MM / YY format.');
      return;
    }

    // Validate CVC
    if (!validateCVC(cvc)) {
      alert('Please enter a valid 3-digit CVC.');
      return;
    }

    const token = localStorage.getItem('token'); // Get token from local storage

    let user_id;
    try {
      // Get user ID from backend using token
      const response = await axios.get('http://localhost:3000/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      user_id = response.data.id;
    } catch (error) {
      // If unauthorized, redirect to login
      if (error.response && error.response.status === 401) {
        alert('Session expired. Please log in again.');
        navigate('/login', { state: { from: '/payment' } });
      } else {
        console.error('Failed to retrieve user ID:', error);
      }
      return;
    }

    // Check product stock before proceeding
    for (const item of cartItems) {
      if (item.quantity > item.availableQuantity) {
        alert(`Insufficient stock for ${item.title}. Available: ${item.availableQuantity}`);
        return;
      }
    }

    // Calculate total cost (subtotal + shipping - discount)
    const calculateTotal = () => {
      return subtotal + shippingCost - discount;
    };

    // Prepare order details payload
    const orderDetails = {
      user_id,
      product_title: cartItems.map(item => item.title),
      quantity: cartItems.map(item => item.quantity),
      total: calculateTotal(),
      name: formData.cardholderName,
      address: billingDetails
        ? `${billingDetails.streetAddress}, ${billingDetails.apartment}, ${billingDetails.city}`
        : 'N/A',
      phone: billingDetails?.phoneNumber || 'N/A',
      email: billingDetails?.email || 'N/A',
      payment_method: 'bank',
    };

    console.log('Order Details:', orderDetails); // Log the payload

    try {
      // Send order to backend
      await axios.post('http://localhost:3000/api/orders/add', orderDetails, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // Clear the cart on the backend
      await axios.post('http://localhost:3000/api/cart/empty', {}, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // Navigate to success page
      navigate('/success');
    } catch (error) {
      console.error('Failed to process payment:', error);
      alert('Payment failed. Please try again.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <Nav />
      <div className="w-full max-w-md p-6">
        <h1 className="text-center text-2xl font-bold mb-8">Pay Now</h1>
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Cardholder Name */}
          <div className="space-y-2">
            <label htmlFor="cardholderName" className="block text-sm text-gray-600">
              Cardholder's Name
            </label>
            <input
              type="text"
              id="cardholderName"
              className="w-full p-2 border border-gray-200 rounded bg-gray-100"
              placeholder="PAULINA CHIMAROKE"
              value={formData.cardholderName}
              onChange={handleChange}
            />
          </div>
          
          {/* Card Number */}
          <div className="space-y-2">
            <label htmlFor="cardNumber" className="block text-sm text-gray-600">
              Card Number
            </label>
            <div className="relative">
              <input
                type="text"
                id="cardNumber"
                className="w-full p-2 pl-20 border border-gray-200 rounded bg-gray-100"
                placeholder="9870 3456 7890 6473"
                value={formData.cardNumber}
                onChange={handleChange}
              />
              <div className="absolute left-2 top-2.5">
                <span className="inline-flex items-center">
                  <img src="/Images/visa.png" alt="Visa" className="h-6" />
                </span>
              </div>
            </div>
          </div>
          
          {/* Expiry and CVC */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="expiry" className="block text-sm text-gray-600">
                Expiry
              </label>
              <input
                type="text"
                id="expiry"
                className="w-full p-2 border border-gray-200 rounded bg-gray-100"
                placeholder="03 / 25"
                value={formData.expiry}
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="cvc" className="block text-sm text-gray-600">
                CVC
              </label>
              <input
                type="text"
                id="cvc"
                className="w-full p-2 border border-gray-200 rounded bg-gray-100"
                placeholder="654"
                value={formData.cvc}
                onChange={handleChange}
              />
            </div>
          </div>
          
          {/* Pay Button */}
          <button
            type="submit"
            className="w-full py-2 px-4 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded transition duration-200"
          >
            Pay
          </button>
        </form>
      </div>
    </div>
  );
};

export default Payment;