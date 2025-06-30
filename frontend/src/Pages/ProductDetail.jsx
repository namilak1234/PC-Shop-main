import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Nav from '../Components/Nav';
import Notification from '../Components/Notification'; // Import Notification component
import { Minus, Plus, ShoppingCart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ProductDetail = () => {
  const { id } = useParams(); // Get product ID from URL parameters
  const navigate = useNavigate(); // Hook for navigation
  const [product, setProduct] = useState(null); // State for product details
  const [loading, setLoading] = useState(true); // State for loading status
  const [error, setError] = useState(null); // State for error messages
  const [quantity, setQuantity] = useState(1); // State for product quantity
  const [notification, setNotification] = useState({ message: '', type: '' }); // Notification state
  const [otherProducts, setOtherProducts] = useState([]); // State for other products
  const [mainImage, setMainImage] = useState(null); // State for the main image
  const { user, token } = useAuth(); // Use your AuthContext

  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:3000/api/products/${id}`); // Fetch product details from API
        const productData = response.data;
        
        // Set the main image to the first image by default
        setMainImage(productData.image1 ? `data:${productData.image1_type};base64,${productData.image1}` : null);
        setProduct(productData);
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError('Failed to load product details. Please try again later.'); // Set error message
      } finally {
        setLoading(false); // Set loading to false
      }
    };

    if (id) {
      fetchProductDetail(); // Fetch product details if ID is available
    }
  }, [id]);

  useEffect(() => {
    const fetchOtherProducts = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/products/other', {
          params: { excludeId: id, limit: 5 }, // Exclude the current product and limit to 5
        });
        setOtherProducts(response.data); // Set other products
      } catch (err) {
        console.error('Error fetching other products:', err);
      }
    };
  
    if (id) {
      fetchOtherProducts(); // Fetch other products if ID is available
    }
  }, [id]);

  const handleThumbnailClick = (image, imageType) => {
    setMainImage(`data:${imageType};base64,${image}`);
  };
  

  const handleDecreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1); // Decrease quantity
    }
  };

  const handleIncreaseQuantity = () => {
    // You might want to limit this to available stock
    setQuantity(quantity + 1); // Increase quantity
  };


  const refreshProductDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/api/products/${product.id}`);
      setProduct(response.data);
    } catch (error) {
      console.error('Failed to refresh product details:', error);
    }
  };
  

  const handleOrderNow = async () => {
    if (!token) {
    navigate('/login', { state: { from: `/products/${product.id}` } });
    return;
  }

    if (!product || product.availableQuantity < quantity) {
      setNotification({ 
        message: product.availableQuantity === 0 
          ? 'This product is out of stock.' 
          : `Sorry, only ${product.availableQuantity} items available.`, 
        type: 'error' 
      });
      return;
    }  
    const orderItem = {
      productId: product.id,
      title: product.title,
      price: parseFloat(product.retailPrice),
      image: product.image,
      image_type: product.image_type || 'image/jpeg',
      quantity,
      totalPrice: parseFloat(product.retailPrice) * quantity, // Calculate total price
    };
  
    // Navigate to the checkout page with order details
    navigate('/checkout', { state: { orderItem } });
  };

  const handleAddToCart = async () => {
  if (!token) {
    navigate('/login', { state: { from: `/products/${product.id}` } });
    return;
  }

    if (product.availableQuantity < quantity) {
      setNotification({ 
        message: product.availableQuantity === 0 
          ? 'This product is out of stock.' 
          : `Sorry, only ${product.availableQuantity} items available.`, 
        type: 'error' 
      });
      return;
    }

    const cartItem = {
      productId: product.id,
      title: product.title,
      price: parseFloat(product.retailPrice),
      image: product.image,
      image_type: product.image_type || 'image/jpeg',
      quantity,
      totalPrice: parseFloat(product.retailPrice) * quantity
    };

    console.log('Cart Item:', cartItem); // Log the cart item to verify its contents


    try {
      const response = await axios.post('http://localhost:3000/api/cart/add', cartItem, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response:', response.data); // Log the response from the server
      setNotification({ message: `Added ${quantity} ${product.title} to cart!`, type: 'success' }); // Set notification
    } catch (error) {
      console.error('Failed to add item to cart:', error.response ? error.response.data : error.message);
      setNotification({ message: 'Failed to add item to cart. Please try again.', type: 'error' }); // Set notification
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Nav />
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Nav />
        <div className="text-center py-8 text-red-500">
          {error}
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto p-6">
        <Nav />
        <div className="text-center py-8 text-gray-500">
          Product not found
        </div>
      </div>
    );
  }

  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`); // Navigate to the product details page
  };

  return (
    <div className="container mx-auto p-6">
      <Nav />
      <Notification
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ message: '', type: '' })}
      />
      <div className="flex flex-col md:flex-row gap-8 mt-6">
        {/* Left column - Product Images */}
        <div className="md:w-1/2">
          <div className="mb-4">
          <div className="border border-gray-200 rounded-lg overflow-hidden bg-white p-4 h-96">
              {mainImage ? (
                <img
                  src={mainImage}
                  alt={product.title}
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="text-gray-500">No Image</span>
              )}
            </div>
          </div>

          {/* Thumbnail Images */}
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((index) => {
              const image = product[`image${index}`];
              const imageType = product[`image${index}_type`];
              return (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg overflow-hidden bg-white p-2 h-24 cursor-pointer"
                  onClick={() => handleThumbnailClick(image, imageType)}
                >
                  {image ? (
                    <img
                      src={`data:${imageType};base64,${image}`}
                      alt={`${product.title} view ${index}`}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span className="text-gray-500">No Image</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column - Product Details */}
        <div className="md:w-1/2">
          <h1 className="text-2xl font-bold mb-2">{product.title}</h1>


          {/* Price */}
          <div className="mb-6">
            <span className="text-2xl font-bold text-black">Rs. {parseFloat(product.retailPrice).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>

         
          {/* Quantity selection and Order/Cart buttons */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center border border-gray-300 rounded">
              <button
                className="p-2 hover:bg-gray-100"
                onClick={handleDecreaseQuantity}
                aria-label="Decrease quantity"
              >
                <Minus size={16} />
              </button>
              <span className="px-4">{quantity}</span>
              <button
                className="p-2 hover:bg-gray-100"
                onClick={handleIncreaseQuantity}
                aria-label="Increase quantity"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-medium mb-2">Availability:</h3>
            {product.availableQuantity > 0 ? (
              <p className="text-green-600">In Stock ({product.availableQuantity} available)</p>
            ) : (
              <p className="text-red-600">Out of Stock</p>
            )}
          </div>

          {/* Disable buttons if out of stock */}
          <div className="flex gap-4">
            <button
              className="py-2 px-6 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              onClick={handleOrderNow}
              disabled={product.availableQuantity === 0}
            >
              Order Now
            </button>

            <button
              className="py-2 px-6 flex items-center gap-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 transition-colors"
              onClick={handleAddToCart}
              disabled={product.availableQuantity === 0}
            >
              <ShoppingCart size={18} />
              Add to Cart
            </button>
          </div>
        </div>
      </div>

      {/* Other Products section */}
      <div className="mt-12">
        <h2 className="text-xl font-bold mb-4">Other Products</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {otherProducts.length > 0 ? (
            otherProducts.map((product) => (
              <div
                key={product.id}
                className="cursor-pointer transform transition-transform hover:scale-105" // Add hover effect
                onClick={() => handleProductClick(product.id)}
              >
                  <div className="border p-5 border-gray-200 rounded-lg overflow-hidden shadow-md bg-white">
                  {product.image1 ? (
                    <img
                      src={`data:${product.image1_type || 'image/jpeg'};base64,${product.image1}`}
                      alt={product.title}
                      className="h-2/3 w-full object-contain mx-auto"
                    />
                  ) : (
                    <span className="text-gray-500">No Image</span>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-medium">{product.title}</h3>
                  <p className="text-sm text-red-600">
                    Rs. {parseFloat(product.retailPrice).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No other products available.</p>
          )}
          </div>
          <Link to="/ProductList" className="text-blue-500 text-xl font-semibold hover:underline" >
          <h2>See More Products...</h2>
          </Link>
        </div>
    </div>
  );
};

export default ProductDetail;