import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaApple, FaMobileAlt, FaLaptop, FaCamera, FaTv } from 'react-icons/fa';
import { ImHeadphones } from "react-icons/im";
import { IoMdWatch } from "react-icons/io";
import { IoGameController } from "react-icons/io5";
import Notification from '../Components/Notification'; // Import Notification component

const ManageSlides = () => {
  const [slides, setSlides] = useState([]); // State to store the list of slides
  const [editingSlide, setEditingSlide] = useState(null); // State to track the slide being edited
  const [updatedSlide, setUpdatedSlide] = useState({
    icon: '',
    title: '',
    description: '',
    alt: '',
    image: null, // State to store the updated image
  });
  const [notification, setNotification] = useState({ message: '', type: '' }); // State for notifications

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
  };

  // Fetch slides from the backend when the component mounts
  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/slides'); // API call to fetch slides
        setSlides(response.data); // Update the state with the fetched slides
      } catch (error) {
        console.error('Error fetching slides:', error); // Log any errors
        setNotification({ message: 'Failed to fetch slides.', type: 'error' }); // Show error notification
      }
    };

    fetchSlides();
  }, []);

  // Handle delete slide
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/api/slides/${id}`); // API call to delete the slide
      setSlides(slides.filter((slide) => slide.id !== id)); // Remove the deleted slide from the state
      setNotification({ message: 'Slide deleted successfully.', type: 'success' }); // Show success notification
    } catch (error) {
      console.error('Error deleting slide:', error); // Log any errors
      setNotification({ message: 'Failed to delete slide.', type: 'error' }); // Show error notification
    }
  };

  // Handle edit slide
  const handleEdit = (slide) => {
    setEditingSlide(slide.id); // Set the slide being edited
    setUpdatedSlide({
      icon: slide.icon || '',
      title: slide.title || '',
      description: slide.description || '',
      alt: slide.alt || '',
      image: null, // Reset the image for editing
    });
  };

  // Handle save updated slide
  const handleSave = async (id) => {
    const formData = new FormData();
    formData.append('icon', updatedSlide.icon);
    formData.append('title', updatedSlide.title);
    formData.append('description', updatedSlide.description);
    formData.append('alt', updatedSlide.alt);
    if (updatedSlide.image) {
      formData.append('image', updatedSlide.image); // Add the updated image if provided
    }

    try {
      await axios.put(`http://localhost:3000/api/slides/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }); // API call to update the slide
      const updatedSlides = slides.map((slide) =>
        slide.id === id
          ? { ...slide, ...updatedSlide, image: updatedSlide.image ? URL.createObjectURL(updatedSlide.image) : slide.image }
          : slide
      );
      setSlides(updatedSlides); // Update the state with the updated slide
      setEditingSlide(null); // Exit editing mode
      setNotification({ message: 'Slide updated successfully.', type: 'success' }); // Show success notification
    } catch (error) {
      console.error('Error updating slide:', error); // Log any errors
      setNotification({ message: 'Failed to update slide.', type: 'error' }); // Show error notification
    }
  };

  // Handle input change for editing
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedSlide({
      ...updatedSlide,
      [name]: value, // Update the corresponding field in the state
    });
  };

  // Handle image change for editing
  const handleImageChange = (e) => {
    setUpdatedSlide({
      ...updatedSlide,
      image: e.target.files[0], // Update the image in the state
    });
  };

  return (
    <div className="p-4 bg-gray-100">
      {/* Notification */}
      <div className="sticky top-0 z-50">
        {notification.message && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification({ message: '', type: '' })} // Clear the notification on close
          />
        )}
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 gap-4">
        <h1 className="text-2xl font-bold mb-4">Manage Slides</h1>
        {slides.map((slide) => (
          <div key={slide.id} className="border rounded-lg p-4 bg-white shadow flex items-center">
            {editingSlide === slide.id ? (
              // Render the editing form if the slide is being edited
              <div className="flex flex-col w-full">
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Icon:</label>
                  <select
                    name="icon"
                    value={updatedSlide.icon}
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  >
                    <option value="apple">Apple</option>
                    <option value="laptop">Laptop</option>
                    <option value="camera">Camera</option>
                    <option value="tv">TV</option>
                    <option value="phone">Phone</option>
                    <option value="watch">Watch</option>
                    <option value="headphones">Headphones</option>
                    <option value="gaming">Gaming</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Title:</label>
                  <input
                    type="text"
                    name="title"
                    value={updatedSlide.title}
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Description:</label>
                  <input
                    type="text"
                    name="description"
                    value={updatedSlide.description}
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Alt Text:</label>
                  <input
                    type="text"
                    name="alt"
                    value={updatedSlide.alt}
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Image:</label>
                  <input
                    type="file"
                    name="image"
                    onChange={handleImageChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => handleSave(slide.id)}
                    className="bg-green-500 text-white px-4 py-2 rounded mr-2"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingSlide(null)}
                    className="bg-gray-500 text-white px-4 py-2 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              // Render the slide details if not in editing mode
              <div className="flex items-center w-full">
                <div className="flex-shrink-0 text-3xl mr-4">{iconMap[slide.icon]}</div>
                <div className="flex-grow">
                  <h3 className="text-lg font-bold">{slide.title}</h3>
                  <p className="text-gray-700">{slide.description}</p>
                  <p className="text-gray-500 text-sm">{slide.alt}</p>
                </div>
                <div className="flex-shrink-0">
                  <img src={slide.image} alt={slide.alt} className="max-h-20 object-contain mr-10" />
                </div>
                <div className="flex-shrink-0">
                  <button
                    onClick={() => handleEdit(slide)}
                    className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(slide.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageSlides;