import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Nav from '../Components/Nav';
import { Search } from 'lucide-react';

const ProductList = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]); // State to store all products
  const [searchTerm, setSearchTerm] = useState(''); // State to store search term
  const [filteredProducts, setFilteredProducts] = useState([]); // State to store filtered products

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/products/display'); // Fetch products from API
        const formattedProducts = response.data.map(product => ({
          ...product,
          retailPrice: parseFloat(product.retailPrice) // Format retail price
        }));
        setProducts(formattedProducts); // Set products state
        setFilteredProducts(formattedProducts); // Set filtered products state
      } catch (error) {
        console.error('Error fetching products:', error); // Log error
      }
    };
    
    fetchProducts(); // Fetch products on component mount
  }, []);

  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term); // Set search term state
    
    if (term.trim() === '') {
      setFilteredProducts(products); // Reset filtered products if search term is empty
    } else {
      const filtered = products.filter(product => 
        product.title.toLowerCase().includes(term.toLowerCase()) // Filter products by title
      );
      setFilteredProducts(filtered); // Set filtered products state
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`); // Navigate to product details page
  };

  return (
    <div className="container mx-auto p-6">
      <Nav />
      <div className="flex justify-center items-center">
        <div className="relative w-80 mb-6">
          <input
            type="text"
            placeholder="Search"
            className="py-1 pl-10 pr-4 rounded-full bg-purple-100 text-sm w-full"
            value={searchTerm}
            onChange={handleSearchChange} // Handle search input change
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
            <Search size={16} />
          </div>
        </div>
      </div>
      
      {filteredProducts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No products found matching "{searchTerm}"
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map(product => (
            <div 
              key={product.id} 
              className="cursor-pointer transform transition-transform hover:scale-105"
              onClick={() => handleProductClick(product.id)} // Handle product click
            >
              <div className="border p-2 border-gray-200 rounded-lg overflow-hidden shadow-md bg-white">
                {product.image1 && (
                  <img
                    src={`data:${product.image1_type};base64,${product.image1}`}
                    alt={product.title}
                    className="w-2/3 h-48 object-contain mx-auto"
                  />
                )}
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold">{product.title}</h3>
                <p className="text-red-600 font-medium">Rs. {product.retailPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductList;