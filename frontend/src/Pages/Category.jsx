import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import Nav from '../Components/Nav'; // Import the navigation component

export default function Category() {
  const navigate = useNavigate(); // Hook to navigate between routes
  const location = useLocation(); // Hook to access the current location
  const [categories, setCategories] = useState([]); // State to store categories and their products
  const categoryRefs = useRef({}); // Ref to store references to category sections for scrolling

  // Fetch categories and their products from the server when the component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/products/grouped-by-category'); // API call to fetch products grouped by category
        setCategories(response.data); // Update the state with the fetched categories
      } catch (error) {
        console.error('Error fetching categories:', error); // Log any errors
      }
    };

    fetchCategories();
  }, []);

  // Handle URL query parameters to scroll to a specific category if provided
  useEffect(() => {
    const params = new URLSearchParams(location.search); // Parse query parameters
    const category = params.get('category'); // Get the 'category' parameter
    if (category) {
      handleCategoryClick(category); // Scroll to the specified category
    }
  }, [location.search]);

  // Navigate to the product details page when a product is clicked
  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`); // Navigate to the product details page
  };

  // Scroll to the specified category section
  const handleCategoryClick = (category) => {
    if (categoryRefs.current[category]) {
      categoryRefs.current[category].scrollIntoView({ behavior: 'smooth' }); // Smooth scroll to the category section
    }
  };

  // Scroll to the top of the page
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Smooth scroll to the top
  };

  return (
    <div className="container mx-auto p-12">
      <Nav /> {/* Render the navigation bar */}
      <h1 className="text-3xl font-bold mb-4">Products by Category</h1>

      {/* Render category buttons for navigation */}
      <div className="flex space-x-4 overflow-x-auto mb-8">
        {['Phones', 'Computers', 'Smart Watches', 'Cameras', 'Headphones', 'Gaming', 'Tv', 'Others'].map((categoryName) => (
          <button
            key={categoryName}
            className="px-4 py-2 bg-gray-200 rounded-full text-gray-700 hover:bg-gray-300 transition-colors"
            onClick={() => handleCategoryClick(categoryName)} // Scroll to the selected category
          >
            {categoryName}
          </button>
        ))}
      </div>

      {/* Render products grouped by category */}
      {categories.map((category) => (
        <div
          key={category.category}
          ref={(el) => (categoryRefs.current[category.category] = el)} // Store a reference to the category section
          className="mb-8"
        >
          <h2 className="text-2xl font-semibold mb-4">{category.category}</h2>
          {category.products.length === 0 ? (
            // Display a message if no products are found in the category
            <div className="text-center py-8 text-gray-500">
              No products found in "{category.category}"
            </div>
          ) : (
            // Display products in a grid layout
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {category.products.map((product) => (
                <div
                  key={product.id}
                  className="cursor-pointer transform transition-transform hover:scale-105" // Add hover effect
                  onClick={() => handleProductClick(product.id)} // Navigate to the product details page
                >
                  <div className="border p-2 border-gray-200 rounded-lg overflow-hidden shadow-md bg-white">
                    {product.image1 && (
                      <img
                        src={`data:image1/jpeg;base64,${product.image1}`} // Display the product image
                        alt={product.title}
                        className="w-2/3 h-48 object-contain mx-auto"
                      />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold">{product.title}</h3> {/* Display the product title */}
                    <p className="text-red-600 font-medium">
                      Rs. {product.retailPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {/* Display the product price */}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Button to scroll to the top of the page */}
      <button
        className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-full shadow-md hover:bg-blue-600 transition-colors"
        onClick={scrollToTop}
      >
        Top of the Page
      </button>
    </div>
  );
}