import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Nav from '../Components/Nav';
import { Link, useNavigate } from 'react-router-dom';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { FaApple, FaMobileAlt, FaLaptop, FaCamera, FaTv, FaCameraRetro } from 'react-icons/fa';
import { ImHeadphones } from "react-icons/im";
import { IoMdWatch } from "react-icons/io";
import { IoGameController } from "react-icons/io5";
import { ChevronRight, ChevronLeft, Eye } from 'lucide-react';

const Home = () => {
  // State to store slides for the hero banner
  const [slides, setSlides] = useState([]);
  // State to store top-selling products
  const [topSellingProducts, setTopSellingProducts] = useState([]);
  const navigate = useNavigate(); // Hook to navigate between routes

  // Map of icons for different categories
  const iconMap = {
    apple: <FaApple />,
    laptop: <FaLaptop />,
    camera: <FaCamera />,
    tv: <FaTv />,
    phone: <FaMobileAlt />,
    watch: <IoMdWatch />,
    headphones: <ImHeadphones />,
    gaming: <IoGameController />,
  };

  useEffect(() => {
    // Fetch slides for the hero banner
    const fetchSlides = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/slides');
        setSlides(response.data);
      } catch (error) {
        console.error('Error fetching slides:', error);
      }
    };

    // Fetch top-selling products
    const fetchTopSellingProducts = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/orders/top-selling');
        setTopSellingProducts(response.data);
      } catch (error) {
        console.error('Error fetching top-selling products:', error);
      }
    };

    // Call the fetch functions
    fetchSlides();
    fetchTopSellingProducts();
  }, []);

  // Slider settings for the hero banner
  const settings = {
    dots: true, // Show navigation dots
    infinite: slides.length > 1, // Enable infinite scrolling if there are multiple slides
    speed: 500, // Transition speed
    slidesToShow: Math.min(slides.length, 1), // Show one slide at a time
    slidesToScroll: 1, // Scroll one slide at a time
    autoplay: slides.length > 1, // Enable autoplay if there are multiple slides
    autoplaySpeed: 3000, // Autoplay interval
    arrows: slides.length > 1, // Show navigation arrows if there are multiple slides
  };

  // Navigate to the product details page when a product is clicked
  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`); // Navigate to the product details page
  };

  return (
    <Nav>
      <div className="flex flex-col min-h-screen bg-white">
        {/* Hero Banner with Promotion Slider */}
        <div className="relative bg-black text-white -mt-2">
          <Slider {...settings} className="w-full min-h-96">
            {slides.map((slide, index) => (
              <div key={index} className="w-full flex items-center justify-between px-10 py-6">
                {/* Slide content */}
                <div className="w-1/2 p-4">
                  <div className="flex items-center mb-2">
                    <div className="text-3xl">{iconMap[slide.icon]}</div>
                    <span className="text-base pl-3">{slide.title}</span>
                  </div>
                  <h2 className="text-5xl font-bold mb-2">{slide.description}</h2>
                  <Link to="/productList">
                    <div className="flex items-center mt-4">
                      <span className="mr-2">Shop Now</span>
                      <ChevronRight size={16} />
                    </div>
                  </Link>
                </div>
                {/* Slide image */}
                <div className="w-full flex justify-center">
                  <img src={slide.image} alt={slide.alt} className="max-h-64 object-contain" />
                </div>
              </div>
            ))}
          </Slider>
        </div>

        {/* Categories Section */}
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Browse By Category</h2>
            <div className="flex items-center space-x-2">
              {/* Search input */}
              <input
                type="text"
                placeholder="Search"
                className="py-1 px-4 rounded-full bg-purple-100 text-sm w-64"
              />
              {/* Navigation buttons */}
              <button className="p-1 rounded-full border border-gray-300">
                <ChevronLeft size={16} />
              </button>
              <button className="p-1 rounded-full border border-gray-300">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Category links */}
          <div className="grid grid-cols-7 gap-4">
            <Link to="/category?category=Phones" className="border rounded-lg p-4 flex flex-col items-center justify-center h-32">
              <div className="p-3">
                <FaMobileAlt size={30} />
              </div>
              <span className="text-sm mt-2">Phones</span>
            </Link>

            <Link to="/category?category=Computers" className="border rounded-lg p-4 flex flex-col items-center justify-center h-32">
              <div className="p-3">
                <FaLaptop size={30} />
              </div>
              <span className="text-sm mt-2">Computers</span>
            </Link>

            <Link to="/category?category=Smart Watches" className="border rounded-lg p-4 flex flex-col items-center justify-center h-32">
              <div className="p-3">
                <IoMdWatch size={30} />
              </div>
              <span className="text-sm mt-2">Smart Watches</span>
            </Link>

            <Link to="/category?category=Cameras" className="border rounded-lg p-4 flex flex-col items-center justify-center h-32">
              <div className="p-3">
                <FaCameraRetro size={30} />
              </div>
              <span className="text-sm mt-2">Cameras</span>
            </Link>

            <Link to="/category?category=Headphones" className="border rounded-lg p-4 flex flex-col items-center justify-center h-32">
              <div className="p-3">
                <ImHeadphones size={30} />
              </div>
              <span className="text-sm mt-2">Headphones</span>
            </Link>

            <Link to="/category?category=Gaming" className="border rounded-lg p-4 flex flex-col items-center justify-center h-32">
              <div className="p-3">
                <IoGameController size={30} />
              </div>
              <span className="text-sm mt-2">Gaming</span>
            </Link>

            <Link to="/category?category=Tv" className="border rounded-lg p-4 flex flex-col items-center justify-center h-32">
              <div className="p-3">
                <FaTv size={30} />
              </div>
              <span className="text-sm mt-2">TV</span>
            </Link>
          </div>
        </div>

        {/* Best Selling Products */}
        <div className="container mx-auto px-4 py-2">
          <div className="bg-red-100 inline-block px-3 py-1 text-sm mb-2">
            This Month
          </div>

          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Best Selling Products</h2>
            <Link to="/ProductList">
              <button className="bg-red-500 text-white px-4 py-2 rounded">
                View All
              </button>
            </Link>
          </div>

          {/* Top-selling products grid */}
          <div className="grid grid-cols-5 gap-4">
            {topSellingProducts.map((product) => (
              <div key={product.productId} className="border rounded relative group bg-gray-200">
                {/* View product button */}
                <button 
                  onClick={() => handleProductClick(product.productId)} // Navigate to the product details page
                  className="absolute top-2 right-2 p-1 rounded-full bg-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                  <Eye size={16} />
                </button>
                {/* Product image */}
                <div className="flex justify-center mb-2">
                  <img
                    src={
                      product.productImage
                        ? `data:image/png;base64,${product.productImage}` // Use Base64 image
                        : '/path/to/fallback-image.png' // Fallback image
                    }
                    alt={product.productName || 'Product'}
                    className="w-2/3 h-40 object-contain mx-auto"
                  />
                </div>
                {/* Product details */}
                <div className='p-2 bg-white'>
                  <h3 className="text-center text-lg font-bold">{product.productName || 'Unknown Product'}</h3>
                  <p className="text-center text-sm text-red-600">
                    Rs. {parseFloat(product.productPrice).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Nav>
  );
};

export default Home;
