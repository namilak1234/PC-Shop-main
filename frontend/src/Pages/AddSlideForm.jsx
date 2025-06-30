import React, { useState } from 'react';
import axios from 'axios';
import { FaApple, FaMobileAlt, FaLaptop, FaCamera, FaTv, FaCameraRetro } from 'react-icons/fa';
import { ImHeadphones } from "react-icons/im";
import { IoMdWatch } from "react-icons/io";
import { IoGameController } from "react-icons/io5";
import Notification from '../Components/Notification'; // Import Notification component

const AddSlideForm = ({ onSlideAdded }) => {
  // State to manage the new slide details
  const [newSlide, setNewSlide] = useState({
    icon: 'apple', // Default icon
    title: '', // Slide title
    description: '', // Slide description
    alt: '', // Alt text for the image
  });

  const [image, setImage] = useState(null); // State to manage the uploaded image
  const [notification, setNotification] = useState({ message: '', type: '' }); // State for notifications
  const [isSubmitting, setIsSubmitting] = useState(false); // State to track submission status

  // Map icon names to React icon components
  const iconMap = {
    apple: <FaApple />,
    laptop: <FaLaptop />,
    camera: <FaCamera />,
    tv: <FaTv />,
    phone: <FaMobileAlt />,
    watch: <IoMdWatch />,
    headphones: <ImHeadphones />,
    gaming: <IoGameController />,
    cameraRetro: <FaCameraRetro />,
  };

  // Handle input changes for text fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSlide({
      ...newSlide,
      [name]: value,
    });
  };

  // Handle icon selection changes
  const handleIconChange = (e) => {
    setNewSlide({
      ...newSlide,
      icon: e.target.value,
    });
  };

  // Handle image file selection
  const handleImageChange = (e) => {
    setImage(e.target.files[0]); // Store the selected file
  };

  // Handle form submission to add a new slide
  const handleAddSlide = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    // Custom validation to ensure required fields are filled
    if (!newSlide.title || !newSlide.description || !image) {
      setNotification({ message: 'Please fill in all required fields.', type: 'error' });
      return;
    }

    setNotification({ message: '', type: '' }); // Clear any existing notifications
    setIsSubmitting(true); // Set submission state to true

    // Create a FormData object to send the slide data
    const formData = new FormData();
    formData.append('icon', newSlide.icon);
    formData.append('title', newSlide.title);
    formData.append('description', newSlide.description);
    formData.append('alt', newSlide.alt);
    formData.append('image', image);

    try {
      // Send a POST request to the server to add the slide
      const response = await axios.post('http://localhost:3000/api/slides/add', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Trigger success notification
      setNotification({ message: 'Slide added successfully!', type: 'success' });

      // Notify the parent component about the new slide
      if (typeof onSlideAdded === 'function') {
        onSlideAdded(response.data);
      }

      // Reset the form fields
      setNewSlide({
        icon: 'apple',
        title: '',
        description: '',
        alt: '',
      });
      setImage(null); // Clear the image
    } catch (error) {
      console.error('Error adding slide:', error); // Log the error for debugging

      // Trigger error notification
      setNotification({ message: 'Failed to add slide. Please try again.', type: 'error' });
    } finally {
      setIsSubmitting(false); // Reset submission state
    }
  };

  // Handle form reset to clear all fields
  const handleReset = () => {
    setNewSlide({
      icon: 'apple',
      title: '',
      description: '',
      alt: '',
    });
    setImage(null); // Clear the image
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded shadow-md p-6 relative">
      {/* Display notification if there is a message */}
      <div className="sticky top-0 z-50">
        {notification.message && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification({ message: '', type: '' })} // Clear notification on close
          />
        )}
      </div>

      <h1 className="text-2xl font-bold mb-4">Add New Slide</h1>
      <form onSubmit={handleAddSlide}>
        <div className="grid grid-cols-1 gap-6">
          {/* Icon selection field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
            <select
              name="icon"
              value={newSlide.icon}
              onChange={handleIconChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="apple">Apple</option>
              <option value="laptop">Laptop</option>
              <option value="camera">Camera</option>
              <option value="tv">TV</option>
              <option value="phone">Phone</option>
              <option value="watch">Watch</option>
              <option value="headphones">Headphones</option>
              <option value="gaming">Gaming</option>
              <option value="cameraRetro">Camera Retro</option>
            </select>
          </div>

          {/* Display the selected icon */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Selected Icon:</label>
            <div className="text-3xl">{iconMap[newSlide.icon]}</div>
          </div>

          {/* Title input field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              name="title"
              value={newSlide.title}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Description input field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input
              type="text"
              name="description"
              value={newSlide.description}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Alt text input field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Alt Text</label>
            <input
              type="text"
              name="alt"
              value={newSlide.alt}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Image upload field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slide Image</label>
            <input
              type="file"
              onChange={handleImageChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
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
              onClick={handleReset}
              disabled={isSubmitting}
              className="flex-1 py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Reset
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddSlideForm;