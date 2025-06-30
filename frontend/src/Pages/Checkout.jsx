import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Nav from '../Components/Nav';
import { useAuth } from '../context/AuthContext';


const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { orderItem } = location.state || {}; // Retrieve order item from navigation state
  const { cartItems: initialCartItems, subtotal: initialSubtotal, shippingCost: initialShippingCost, discount: initialDiscount } = location.state || {};

  // State to manage authentication token and user details
  const { token, isAuthenticated } = useAuth();
  // State to manage cart items
  const [cartItems, setCartItems] = useState(orderItem ? [orderItem] : initialCartItems || []);
  // State to manage subtotal
  const [subtotal, setSubtotal] = useState(orderItem ? orderItem.totalPrice : initialSubtotal || 0);
  // State to manage shipping cost
  const [shippingCost, setShippingCost] = useState(initialShippingCost || 0);
  // State to manage discount
  const [discount, setDiscount] = useState(initialDiscount || 0);
  // State to manage selected payment method
  const [paymentMethod, setPaymentMethod] = useState('bank');
  // State to store delivery details fetched from the server
  const [deliveryDetails, setDeliveryDetails] = useState([]);
  // State to track the selected delivery detail
  const [selectedDeliveryDetail, setSelectedDeliveryDetail] = useState(null);
  // State to manage form data for billing details
  const [formData, setFormData] = useState({
    fullName: '',
    streetAddress: '',
    apartment: '',
    city: '',
    phoneNumber: '',
    email: '',
  });
  
    useEffect(() => {
      if (!isAuthenticated()) {
        navigate('/login', { state: { from: '/checkout' } });
      }
    }, [isAuthenticated, navigate]);

  // Fetch cart items and delivery details when the component mounts
  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/cart', {
          headers: {
            Authorization: `Bearer ${token}`, // Pass token in the request headers
          },
        });
        setCartItems(response.data); // Update state with fetched cart items
        calculateSubtotal(response.data); // Calculate subtotal
      } catch (error) {
        console.error('Failed to fetch cart items:', error); // Log error to the console
      }
    };

    const fetchDeliveryDetails = async () => {
      try {
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

    if (!orderItem && !initialCartItems) {
      fetchCartItems(); // Fetch cart items if not provided in navigation state
    }
    fetchDeliveryDetails(); // Fetch delivery details
  }, [orderItem, initialCartItems]);

  // Calculate subtotal based on cart items
  const calculateSubtotal = (items) => {
    const total = items.reduce((sum, item) => sum + (Number(item.totalPrice) || 0), 0);
    setSubtotal(total);
  };

  // Calculate total cost (subtotal + shipping - discount)
  const calculateTotal = () => {
    return subtotal + shippingCost - discount;
  };

  // Handle input changes in the billing details form
  const handleInputChange = (e) => {
    const { name, value } = e.target; // Destructure name and value from the event target
    setFormData((prevData) => ({
      ...prevData, // Spread previous form data
      [name]: value, // Update the specific field with the new value
    }));
  };

  // Handle payment method selection
  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method); // Update selected payment method
  };

  // Handle checkout process
  const handleCheckout = async () => {
    if (!isAuthenticated()) {
    alert('Please log in to place an order.');
    navigate('/login', { state: { from: '/checkout' } });
    return;
  }
    // Validate required fields
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

    // Check product stock
  for (const item of cartItems) {
    if (item.quantity > item.availableQuantity) {
      alert(`Insufficient stock for ${item.title}. Available: ${item.availableQuantity}`);
      return;
    }
  }

    if (paymentMethod === 'cod') {

      let user_id;
      try {
        const response = await axios.get('http://localhost:3000/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`, // Pass token in the request headers
          },
        });
        user_id = response.data.id; // Retrieve user ID from the response
      } catch (error) {
        if (error.response && error.response.status === 401) {
          alert('Session expired. Please log in again.');
        navigate('/login', { state: { from: '/checkout' } });
        } else {
          console.error('Failed to retrieve user ID:', error);
        }
        return;
      }

      const orderDetails = {
        user_id,
        product_title: cartItems.map(item => item.title),
        quantity: cartItems.map(item => item.quantity),        
        total: calculateTotal(), // Calculate total cost
        name: formData.fullName,
        address: `${formData.streetAddress}, ${formData.apartment}, ${formData.city}`, // Combine address fields
        phone: formData.phoneNumber,
        email: formData.email,
        payment_method: paymentMethod,
      };

      console.log('Order Details:', orderDetails); // Log the payload

      try {
        await axios.post('http://localhost:3000/api/orders/add', orderDetails, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!orderItem) {
          // Empty the cart if the order is placed from the cart
          await axios.post('http://localhost:3000/api/cart/empty', {}, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
        }

        // Reset cart and navigate to success page
        setCartItems([]);
        setSubtotal(0);
        setShippingCost(0);
        setDiscount(0);
        localStorage.removeItem('cart');
        navigate('/success');
      } catch (error) {
        console.error('Failed to place order:', error);
        if (error.response) {
          console.error('Response data:', error.response.data);
          console.error('Response status:', error.response.status);
          console.error('Response headers:', error.response.headers);
        }
      }
    } else if (paymentMethod === 'bank') {
      // Navigate to payment page for bank payment
      navigate('/payment', {
        state: {
          cartItems,
          subtotal,
          shippingCost,
          discount,
          billingDetails: formData,
        },
      });
    }
  };

  // Handle selecting a delivery detail
  const handleSelectDeliveryDetail = (detail) => {
    setSelectedDeliveryDetail(detail); // Update selected delivery detail
    setFormData(detail); // Populate form with selected delivery detail
  };

  return (
    <div className="container mx-auto p-6">
      <Nav /> {/* Navigation component */}
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-1/2">
          <h1 className="text-2xl font-bold mb-6">Billing Details</h1>
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-4">Select Delivery Detail</h2>
            {deliveryDetails.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-2">
                {deliveryDetails.map(detail => (
                  <div
                    key={detail.id}
                    className={`border p-4 rounded cursor-pointer ${selectedDeliveryDetail?.id === detail.id ? 'bg-gray-200' : ''}`}
                    onClick={() => handleSelectDeliveryDetail(detail)}
                  >
                    <input
                      type="radio"
                      name="deliveryDetail"
                      checked={selectedDeliveryDetail?.id === detail.id}
                      onChange={() => handleSelectDeliveryDetail(detail)}
                      className="mr-2"
                    />
                    <div>
                      <p><strong>Full Name:</strong> {detail.fullName}</p>
                      <p><strong>Street Address:</strong> {detail.streetAddress}</p>
                      <p><strong>Apartment:</strong> {detail.apartment}</p>
                      <p><strong>City:</strong> {detail.city}</p>
                      <p><strong>Phone Number:</strong> {detail.phoneNumber}</p>
                      <p><strong>Email:</strong> {detail.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className='text-gray-500 text-sm'>No details found. Please add a new delivery detail.</p>
            )}
          </div>
          <form>
            {/* Billing details form */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Full Name*</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
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
                className="border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-1 focus:shadow-outline bg-gray-100"
              />
            </div>
          </form>
        </div>

        <div className="lg:w-1/2">
          <div className="bg-white rounded p-6">
            <div className="space-y-4">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">Rs. {subtotal > 0 ? subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ''}</span>
              </div>

              <div className="flex justify-between py-2">
                <span className="text-gray-600">Shipping:</span>
                <span className="font-medium">{shippingCost > 0 ? `Rs. ${shippingCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'Free'}</span>
              </div>

              <div className="flex justify-between py-2 border-t border-gray-200 mt-2">
                <span className="text-gray-600 font-bold">Total:</span>
                <span className="font-bold">Rs. {subtotal > 0 ? calculateTotal().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ''}</span>
              </div>

              <div className="mt-6">
                <div className="flex items-center mb-4">
                  <input
                    id="bank"
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'bank'}
                    onChange={() => handlePaymentMethodChange('bank')}
                    className="h-4 w-4 text-blue-600"
                  />
                  <label htmlFor="bank" className="ml-2 block text-sm font-medium text-gray-700">
                    Bank
                  </label>
                  <div className="ml-auto flex space-x-2">
                    <img src="/Images/visa.png" alt="Visa" className="h-6" />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    id="cod"
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'cod'}
                    onChange={() => handlePaymentMethodChange('cod')}
                    className="h-4 w-4 text-blue-600"
                  />
                  <label htmlFor="cod" className="ml-2 block text-sm font-medium text-gray-700">
                    Cash on delivery
                  </label>
                </div>
              </div>

              <button
                className="w-full mt-6 py-3 px-6 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                onClick={handleCheckout}
              >
                Place Order
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;