import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios'; // Importing axios for making HTTP requests
import AddProduct from './AddProduct'; // Importing the AddProduct component for adding new products
import EditProduct from './EditProduct'; // Importing the EditProduct component for editing existing products
import Notification from '../Components/Notification'; // Importing the Notification component for displaying messages
import { FaSearch, FaTimes, FaChevronLeft, FaChevronRight, FaSortAlphaDown, FaSortAlphaUp, FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa'; // Importing icons for UI elements

axios.defaults.baseURL = 'http://localhost:3000'; // Setting the base URL for axios requests to the local server

const Inventory = () => {
  // State variables to manage the component's data and UI
  const [products, setProducts] = useState([]); // Holds the list of products fetched from the server
  const [showAddForm, setShowAddForm] = useState(false); // Controls the visibility of the add product form
  const [showEditForm, setShowEditForm] = useState(false); // Controls the visibility of the edit product form
  const [currentProduct, setCurrentProduct] = useState(null); // Holds the product currently being edited
  const [searchTerm, setSearchTerm] = useState(''); // Holds the search term for filtering products
  const [currentPage, setCurrentPage] = useState(1); // Holds the current page number for pagination
  const [notification, setNotification] = useState({ message: '', type: '' }); // Holds notification messages
  const [loading, setLoading] = useState(true); // Indicates whether data is being loaded
  const [error, setError] = useState(null); // Holds error messages
  const [sortConfig, setSortConfig] = useState({ key: 'title', direction: 'ascending' }); // Holds the sorting configuration
  const productsPerPage = 10; // Number of products displayed per page

  useEffect(() => {
    // Fetch products from the server when the component mounts
    const fetchProducts = async () => {
      try {
        setLoading(true); // Set loading to true before fetching data
        const response = await axios.get('/api/products'); // Fetch products from the server
        setProducts(response.data); // Update the products state with the fetched data
        setError(null); // Clear any previous errors
      } catch (error) {
        console.error('Error fetching products:', error); // Log the error to the console
        setError('Failed to load products. Please try again later.'); // Set an error message
        setNotification({ message: 'Failed to load products. Please try again later.', type: 'error' }); // Show a notification
      } finally {
        setLoading(false); // Set loading to false after data is fetched
      }
    };

    fetchProducts(); // Call the fetchProducts function
  }, []); // Empty dependency array means this effect runs once after the initial render

  // Memoized sorted products based on the sort configuration
  const sortedProducts = useMemo(() => {
    let sortableProducts = [...products]; // Create a copy of the products array
    if (sortConfig.key) {
      sortableProducts.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableProducts; // Return the sorted products
  }, [products, sortConfig]);

  // Filtered products based on the search term
  const filteredProducts = sortedProducts.filter(product =>
    product?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product?.id?.toString().includes(searchTerm)
  );

  // Pagination logic
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  // Function to handle editing a product
  const handleEdit = (product) => {
    setCurrentProduct(product); // Set the product to be edited
    setShowEditForm(true); // Show the edit product form
  };

  // Function to handle deleting a product
  const handleDelete = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await axios.delete(`/api/products/${productId}`); // Send a DELETE request to the server
        setProducts(products.filter(product => product.id !== productId)); // Remove the deleted product from the state
        setNotification({ message: "Product deleted successfully!", type: 'success' }); // Show a success notification
      } catch (error) {
        console.error('Error deleting product:', error); // Log the error to the console
        setNotification({ message: "Failed to delete product. Please try again.", type: 'error' }); // Show an error notification
      }
    }
  };

  
  // Function to handle updating a product
const handleUpdateProduct = async (updatedProduct) => {
  try {
    // Prepare form data
    const formData = new FormData();
    formData.append('title', updatedProduct.title);
    formData.append('category', updatedProduct.category);
    formData.append('supplyPrice', updatedProduct.supplyPrice);
    formData.append('retailPrice', updatedProduct.retailPrice);
    formData.append('availableQuantity', updatedProduct.availableQuantity);
    formData.append('supplier', updatedProduct.supplier);

    // Only append image if it exists
    if (updatedProduct.image instanceof File) {
      formData.append('image', updatedProduct.image);
    }

    // Log the form data for debugging
    for (let pair of formData.entries()) {
      console.log(pair[0] + ': ' + pair[1]);
    }

    // Send a PUT request to the server
    await axios.put(`/api/products/${updatedProduct.id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    setProducts(products.map(product =>
      product.id === updatedProduct.id ? updatedProduct : product
    )); // Update the product in the state
    setShowEditForm(false); // Hide the edit product form
    setNotification({ message: "Product updated successfully!", type: 'success' }); // Show a success notification
  } catch (error) {
    console.error('Error updating product:', error); // Log the error to the console
    setNotification({ message: "Failed to update product. Please try again.", type: 'error' }); // Show an error notification
  }
};

  // Function to handle adding a new product
  const handleAddProduct = (newProduct) => {
    setProducts((prevProducts) => [newProduct, ...prevProducts]); // Add the new product to the state
    setShowAddForm(false); // Hide the add product form
    setNotification({ message: "Product added successfully!", type: 'success' }); // Show a success notification
  };

  // Function to handle sorting the products
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction }); // Update the sort configuration
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Notification component to display messages */}
      {notification.message && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification({ message: '', type: '' })}
        />
      )}
      
      <h1 className="text-2xl font-bold mb-8">Product Inventory</h1>

      <div className="flex justify-between items-center mb-6">
        {/* Search bar for filtering products */}
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
        <div className="flex space-x-2">
          {/* Sort buttons for title and price */}
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
            onClick={() => requestSort('title')}
          >
            {sortConfig.key === 'title' ? (
              sortConfig.direction === 'ascending' ? (
                <FaSortAlphaDown className="mr-2" />
              ) : (
                <FaSortAlphaUp className="mr-2" />
              )
            ) : (
              <FaSortAlphaDown className="mr-2" />
            )}
            Title
          </button>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
            onClick={() => requestSort('supplyPrice')}
          >
            {sortConfig.key === 'supplyPrice' ? (
              sortConfig.direction === 'ascending' ? (
                <FaSortAmountDown className="mr-2" />
              ) : (
                <FaSortAmountUp className="mr-2" />
              )
            ) : (
              <FaSortAmountDown className="mr-2" />
            )}
            Price
          </button>
        </div>
        {/* Button to show the add product form */}
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          onClick={() => setShowAddForm(true)}
        >
          Add Product
        </button>
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="text-center py-8">
          <p className="text-gray-600">Loading products...</p>
        </div>
      )}

      {/* Error message display */}
      {error && !loading && (
        <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">
          <p>{error}</p>
        </div>
      )}

      {/* Table to display the list of products */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Available Quantity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Supply Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Retail Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {!loading && currentProducts.length > 0 ? (
              currentProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{product.title}</div>
                    <div className="text-xs text-gray-500">{product.category}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.availableQuantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {typeof product.supplyPrice === 'number'
                      ? product.supplyPrice.toLocaleString()
                      : product.supplyPrice}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {typeof product.retailPrice === 'number'
                      ? product.retailPrice.toLocaleString()
                      : product.retailPrice}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                    <button
                      onClick={() => handleEdit(product)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              !loading && (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                    {searchTerm ? "No products match your search" : "No products available"}
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      {!loading && filteredProducts.length > 0 && (
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`px-3 py-1 border rounded flex items-center ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
          >
            <FaChevronLeft className="mr-1" /> Previous
          </button>
          <span className="text-sm text-gray-700">
            Page {currentPage} of {totalPages || 1}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages || totalPages === 0}
            className={`px-3 py-1 border rounded flex items-center ${currentPage === totalPages || totalPages === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
          >
            Next <FaChevronRight className="ml-1" />
          </button>
        </div>
      )}

      {/* Add Product Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-screen overflow-y-auto relative">
            <button
              onClick={() => setShowAddForm(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <FaTimes className="h-6 w-6" />
            </button>

            <AddProduct
              onSubmitSuccess={handleAddProduct}
              onCancel={() => setShowAddForm(false)}
            />
          </div>
        </div>
      )}

      {/* Edit Product Form */}
      {showEditForm && currentProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-medium">Edit Product</h2>
              <button
                onClick={() => setShowEditForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes className="h-6 w-6" />
              </button>
            </div>
            <div className="">
              <EditProduct
                product={currentProduct}
                onSubmitSuccess={handleUpdateProduct}
                onCancel={() => setShowEditForm(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
