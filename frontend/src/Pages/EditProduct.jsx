import React, { useState } from 'react';
import axios from 'axios'; // Import axios
import { FaChevronDown, FaTimes } from 'react-icons/fa';
import Notification from '../Components/Notification';

const EditProduct = ({ product, onSubmitSuccess, onCancel }) => {
  // State to manage the product data
  const [productData, setProductData] = useState({
    ...product,
    images: [product.image1 || null, product.image2 || null, product.image3 || null, product.image4 || null], // Initialize images
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
      [name]: value,
    });
  };

  // Handle individual image file changes
  const handleSingleImageChange = (e, index) => {
    const file = e.target.files[0];
    const newImages = [...productData.images];
    newImages[index] = file;
    setProductData({
      ...productData,
      images: newImages,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setNotification({ message: '', type: '' });
    setIsSubmitting(true);

    try {
      // Ensure numeric fields are properly sanitized and converted
      const updatedProduct = {
        ...productData,
        supplyPrice: parseFloat(productData.supplyPrice), // Convert to number
        retailPrice: parseFloat(productData.retailPrice), // Convert to number
        availableQuantity: parseInt(productData.availableQuantity, 10), // Convert to integer
      };

      // Validate numeric fields
      if (
        isNaN(updatedProduct.supplyPrice) ||
        isNaN(updatedProduct.retailPrice) ||
        isNaN(updatedProduct.availableQuantity)
      ) {
        setNotification({
          message: 'Please enter valid numerical values for supply price, retail price, and quantity.',
          type: 'error',
        });
        setIsSubmitting(false);
        return;
      }

      // Prepare form data
      const formData = new FormData();
      formData.append('title', updatedProduct.title);
      formData.append('category', updatedProduct.category);
      formData.append('supplyPrice', updatedProduct.supplyPrice);
      formData.append('retailPrice', updatedProduct.retailPrice);
      formData.append('availableQuantity', updatedProduct.availableQuantity);
      formData.append('supplier', updatedProduct.supplier);

      // Append each image separately
      productData.images.forEach((image, index) => {
        if (image instanceof File) {
          formData.append(`image${index + 1}`, image);
        }
      });

      // Send PUT request to update product
      const response = await axios.put(`http://localhost:3000/api/products/${product.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setNotification({
          message: response.data.message || 'Product updated successfully!',
          type: 'success',
        });

        // Call the success callback with the updated product data
        if (typeof onSubmitSuccess === 'function') {
          onSubmitSuccess({
            id: product.id,
            ...updatedProduct,
          });
        }
      } else {
        throw new Error(response.data.message || 'Failed to update product');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      setNotification({
        message: 'An error occurred while updating the product. Please try again.',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded shadow-md p-6 relative">
      {/* Notification component */}
      {notification.message && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification({ message: '', type: '' })}
        />
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6">
          {/* Title field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              name="title"
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
              name="availableQuantity"
              value={productData.availableQuantity}
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

          {/* Product Images field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Images</label>
            <div className="grid grid-cols-1 gap-4">
              {productData.images.map((image, index) => (
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
                        src={image instanceof File ? URL.createObjectURL(image) : image}
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
              className={`flex-1 py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                isSubmitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex-1 py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditProduct;