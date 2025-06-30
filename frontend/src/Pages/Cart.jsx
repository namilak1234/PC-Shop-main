import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Nav from '../Components/Nav';
import { Trash2, Minus, Plus, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext'; // Import AuthContext for authentication

const Cart = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth(); // Use authentication context
  const [cartItems, setCartItems] = useState([]); // State to store cart items
  const [loading, setLoading] = useState(true); // State to manage loading state
  const [error, setError] = useState(null); // State to manage error messages
  const [subtotal, setSubtotal] = useState(0); // State to store subtotal
  const [shippingCost, setShippingCost] = useState(0); // State to store fixed shipping cost
  const [couponCode, setCouponCode] = useState(''); // State to store coupon code
  const [discount, setDiscount] = useState(0); // State to store discount amount

  // Fetch cart items on component mount
  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3000/api/cart', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setCartItems(response.data);
        calculateSubtotal(response.data);
        setLoading(false);
      } catch (error) {
        setError('Failed to fetch cart items. Please try again.');
        setLoading(false);
      }
    };

    fetchCartItems();
  }, []);

  // Recalculate subtotal when cart items change
  useEffect(() => {
    calculateSubtotal(cartItems);
  }, [cartItems]);

  // Calculate subtotal from cart items
  const calculateSubtotal = (items) => {
    const total = items.reduce((sum, item) => sum + (Number(item.totalPrice) || 0), 0);
    setSubtotal(total);
  };

  // Calculate total (subtotal + shipping - discount)
  const calculateTotal = () => {
    return subtotal + shippingCost - discount;
  };

  // Update quantity of a cart item
  const updateQuantity = async (index, newQuantity) => {
    if (newQuantity < 1) return;

    const token = localStorage.getItem('token');
    try {
      // Check available stock before updating
      const response = await axios.get(`http://localhost:3000/api/products/${cartItems[index].product_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const availableQuantity = response.data.availableQuantity;
      if (newQuantity > availableQuantity) {
        alert(`Cannot exceed only ${availableQuantity} items available.`);
        return;
      }

      const updatedCart = [...cartItems];
      updatedCart[index].quantity = newQuantity;
      updatedCart[index].totalPrice = updatedCart[index].price * newQuantity;

      setCartItems(updatedCart);
      calculateSubtotal(updatedCart);

      // Update the cart on the backend
      await axios.put(
        'http://localhost:3000/api/cart/update',
        {
          cartId: updatedCart[index].id,
          quantity: newQuantity,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
    } catch (error) {
      setError('Failed to update cart item. Please try again.');
    }
  };

  // Remove an item from the cart
  const removeItem = async (index) => {
    const updatedCart = cartItems.filter((_, i) => i !== index);
    setCartItems(updatedCart);
    calculateSubtotal(updatedCart);

    const token = localStorage.getItem('token');
    try {
      await axios.delete('http://localhost:3000/api/cart/remove', {
        data: { cartId: cartItems[index].id },
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      setError('Failed to remove cart item. Please try again.');
    }
  };

  // Apply coupon code for discount
  const applyCoupon = () => {
    if (couponCode.toUpperCase() === 'DISCOUNT10') {
      const discountAmount = subtotal * 0.1;
      setDiscount(discountAmount);
      alert('Coupon applied successfully!');
    } else {
      setDiscount(0);
      alert('Invalid coupon code');
    }
  };

  // Handle checkout button click
  const handleCheckout = () => {
    // Use context-based authentication check
    if (!isAuthenticated()) {
      navigate('/login', { state: { from: '/cart' } });
      return;
    }
    const formattedCartItems = cartItems.map(item => ({
      ...item,
      quantity: String(item.quantity),
    }));

    navigate('/checkout', {
      state: {
        cartItems: formattedCartItems,
        subtotal,
        shippingCost,
        discount,
      },
    });
  };

  // Continue shopping button
  const continueShopping = () => {
    navigate('/ProductList');
  };

  // Empty the cart
  const emptyCart = async () => {
    if (window.confirm('Are you sure you want to empty your cart?')) {
      const token = localStorage.getItem('token');
      try {
        await axios.delete('http://localhost:3000/api/cart/empty1', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        setCartItems([]);
        setSubtotal(0);
        alert('Cart emptied successfully.');
      } catch (error) {
        setError('Failed to empty cart. Please try again.');
      }
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <Nav />

      <div className="mt-6">
        <h1 className="text-2xl font-bold mb-6">Shopping Cart</h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag size={64} className="mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-medium mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-6">Looks like you haven't added anything to your cart yet.</p>
            <button
              onClick={continueShopping}
              className="py-2 px-6 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-2/3">
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subtotal
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {cartItems.map((item, index) => (
                      <tr key={`${item.id}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-16 w-16 mr-4 flex-shrink-0">
                              {item.image && (
                                <img
                                  src={`data:${item.image_type || 'image/jpeg'};base64,${item.image}`}
                                  alt={item.title}
                                  className="h-16 w-16 object-contain"
                                />
                              )}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{item.title}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">Rs. {(Number(item.price) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center border border-gray-300 rounded w-24">
                            <button
                              className="p-1 hover:bg-gray-100"
                              onClick={() => updateQuantity(index, item.quantity - 1)}
                              aria-label="Decrease quantity"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="px-2 flex-1 text-center">{item.quantity}</span>
                            <button
                              className="p-1 hover:bg-gray-100"
                              onClick={() => updateQuantity(index, item.quantity + 1)}
                              aria-label="Increase quantity"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            Rs. {(Number(item.totalPrice) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => removeItem(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex justify-between">
                <button
                  onClick={continueShopping}
                  className="flex items-center gap-2 py-2 px-4 border border-gray-300 rounded text-sm hover:bg-gray-50"
                >
                  <ArrowLeft size={16} />
                  Continue Shopping
                </button>

                <button
                  onClick={emptyCart}
                  className="flex items-center gap-2 py-2 px-4 border border-gray-300 rounded text-sm hover:bg-gray-50 text-red-500"
                >
                  <Trash2 size={16} />
                  Empty Cart
                </button>
              </div>
            </div>

            <div className="lg:w-1/3">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium mb-4">Order Summary</h2>

                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">Rs. {(Number(subtotal) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>

                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">{shippingCost > 0 ? `Rs. ${shippingCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'Free'}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Discount</span>
                    <span className="font-medium text-green-600">- Rs. {discount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                )}

                <div className="flex justify-between py-2 mt-2">
                  <span className="text-lg font-bold">Total</span>
                  <span className="text-lg font-bold">Rs. {calculateTotal().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>

        
                <button
                  className="w-full mt-6 py-3 px-6 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                  onClick={handleCheckout}
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;