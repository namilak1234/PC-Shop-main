import React, { useState } from 'react';
import axios from 'axios';
import { FaChevronDown, FaTimes, FaCloudUploadAlt } from 'react-icons/fa';
import Notification from '../Components/Notification';

// Set the base URL for axios requests
axios.defaults.baseURL = 'http://localhost:3000';

// AddProduct component definition
const AddProduct = ({ onSubmitSuccess, onCancel }) => {
  // State to manage product data
  const [productData, setProductData] = useState({
    title: '',
    category: '',
    supplyPrice: '',
    retailPrice: '',
    quantity: '',
    supplier: '',
    images: [null, null, null, null] // Initialize with 4 null values for 4 image fields
  });

  // State to manage notifications
  const [notification, setNotification] = useState({ message: '', type: '' });

  // State to manage form submission status
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductData({
      ...productData,
      [name]: value
    });
  };

  // Handle individual image file changes
const handleSingleImageChange = (e, index) => {
  const file = e.target.files[0];
  const newImages = [...productData.images];
  newImages[index] = file;
  setProductData({
    ...productData,
    images: newImages
  });
};

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setNotification({ message: '', type: '' });
    setIsSubmitting(true);

    try {
      // Data validation
      const supplyPrice = parseFloat(productData.supplyPrice.replace(/,/g, ''));
      const retailPrice = parseFloat(productData.retailPrice.replace(/,/g, ''));
      const quantity = parseInt(productData.quantity);

      if (isNaN(supplyPrice) || isNaN(retailPrice) || isNaN(quantity)) {
        setNotification({ message: 'Please enter valid numerical values for supply price, retail price, and quantity.', type: 'error' });
        setIsSubmitting(false);
        return;
      }

      // Prepare form data
      const formData = new FormData();
      formData.append('title', productData.title);
      formData.append('category', productData.category);
      formData.append('supplyPrice', supplyPrice);
      formData.append('retailPrice', retailPrice);
      formData.append('availableQuantity', quantity);
      formData.append('supplier', productData.supplier);

      // Append each image separately
      productData.images.forEach((image, index) => {
        formData.append(`image${index + 1}`, image);
      });

      // Send POST request to add product
      const response = await axios.post('/api/products/add', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success || response.status === 201) {
        setNotification({
          message: response.data.message || 'Product added successfully!',
          type: 'success'
        });

        // Reset form after successful submission
        handleReset();

        // Create a formatted product object to pass back to the parent component
        const newProduct = {
          id: response.data.productId,
          title: productData.title,
          category: productData.category,
          supplyPrice: supplyPrice,
          retailPrice: retailPrice,
          availableQuantity: quantity,
          supplier: productData.supplier,
          // Include any other fields that might come back from the API
          ...response.data.product
        };

        // Call the success callback with the new product data
        if (typeof onSubmitSuccess === 'function') {
          setTimeout(() => {
            onSubmitSuccess(newProduct);
          }, 1500); // Small delay to show the success notification
        }
      } else {
        // Some APIs might return 200 but with success: false
        throw new Error(response.data.message || 'Failed to add product');
      }
    } catch (error) {
      console.error('Error adding product:', error);

      let errorMessage = 'An error occurred while adding the product. Please try again.';

      if (error.response) {
        errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorMessage = 'No response received from server. Please check your connection.';
      } else {
        errorMessage = `Request error: ${error.message}`;
      }

      setNotification({ message: errorMessage, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form fields
  const handleReset = () => {
    setProductData({
      title: '',
      category: '',
      supplyPrice: '',
      retailPrice: '',
      quantity: '',
      supplier: '',
      images: [null, null, null, null] // Reset to an array of null values
    });
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded shadow-md p-6 relative">
      {/* Fixed notification positioning */}
      <div className="sticky top-0 z-50">
        {notification.message && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification({ message: '', type: '' })}
          />
        )}
      </div>

      <h1 className="text-2xl font-bold mb-4">Add Product</h1>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6">
          {/* Title field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              name="title"
              placeholder="JBL 510BT"
              value={productData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Category field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <div className="relative">
              <select
                name="category"
                value={productData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                required
              >
                <option value="" disabled>Select a category</option>
                <option value="Phones">Phones</option>
                <option value="Computers">Computers</option>
                <option value="Smart Watches">Smart Watches</option>
                <option value="Cameras">Cameras</option>
                <option value="Headphones">Headphones</option>
                <option value="Gaming">Gaming</option>
                <option value="Tv">Tv</option>
                <option value="Others">Others</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <FaChevronDown className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Supply Price field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Supply Price</label>
            <input
              type="text"
              name="supplyPrice"
              placeholder="10,000.00"
              value={productData.supplyPrice}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Retail Price field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Retail Price</label>
            <input
              type="text"
              name="retailPrice"
              placeholder="12,500.00"
              value={productData.retailPrice}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Quantity field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
            <input
              type="text"
              name="quantity"
              placeholder="43"
              value={productData.quantity}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Supplier field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
            <div className="relative">
              <select
                name="supplier"
                value={productData.supplier}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                required
              >
                <option value="" disabled>Select a supplier</option>
                <option value="Selix Computers">Selix Computers</option>
                <option value="Tech Solutions">Tech Solutions</option>
                <option value="Global Imports">Global Imports</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <FaChevronDown className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Image upload field */}
          <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Images</label>
              <div className="grid grid-cols-1 gap-4">
              {productData.images && productData.images.map((image, index) => (
              <div key={index} className="flex items-center space-x-4">
                <input
                  type="file"
                  onChange={(e) => handleSingleImageChange(e, index)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  accept="image/*"
                />
                {image && (
                  <div className="relative">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Preview ${index + 1}`}
                      className="h-16 w-16 object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => handleSingleImageChange({ target: { files: [null] } }, index)}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                    >
                      <FaTimes className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}
            </div>
          </div>
          


          {/* Form buttons */}
          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${isSubmitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              onClick={onCancel || handleReset}
              disabled={isSubmitting}
              className="flex-1 py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              {onCancel ? 'Cancel' : 'Reset'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
