import multer from 'multer';
import { addSlide as addSlideModel, getSlides as getSlidesModel, deleteSlides as deleteSlideModel, updateSlides as updateSlideModel } from '../models/Slide.js';

// Configure multer to store files in memory
const storage = multer.memoryStorage(); // Use memory storage for uploaded files
const upload = multer({ storage }); // Initialize multer with the configured storage
const uploadMiddleware = upload.single('image'); // Middleware to handle single file upload with field name 'image'

// Controller to add a new slide
const addSlide = async (req, res) => {
  try {
    const slide = req.body; // Extract slide details from the request body
    const image = req.file ? req.file.buffer : null; // Extract image file buffer if available

    // Validate required fields
    if (!slide.title || !slide.description || !image) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Format the slide details for database insertion
    const formattedSlide = {
      icon: slide.icon, // Optional icon field
      title: slide.title, // Slide title
      description: slide.description, // Slide description
      image: image ? image.toString('binary') : null, // Convert image buffer to binary string
      alt: slide.alt, // Optional alt text for the image
    };

    // Add the slide using the model
    addSlideModel(formattedSlide, (err, results) => {
      if (err) {
        console.error('Error adding slide:', err); // Log error for debugging
        return res.status(500).json({ error: 'Failed to add slide' }); // Respond with error
      }
      // Respond with success message and slide ID
      res.status(201).json({
        success: true,
        message: 'Slide added successfully',
        slideId: results.insertId, // ID of the newly added slide
      });
    });
  } catch (error) {
    console.error('Error adding slide:', error); // Log unexpected errors
    res.status(500).json({
      success: false,
      message: 'Error adding slide',
      error: error.message, // Include error message in response
    });
  }
};

// Controller to get all slides
const getSlides = (req, res) => {
  getSlidesModel((err, results) => {
    if (err) {
      console.error('Error fetching slides:', err); // Log error for debugging
      return res.status(500).json({ error: 'Failed to fetch slides' }); // Respond with error
    }

    // Convert binary image data to base64 for frontend compatibility
    const slides = results.map((slide) => ({
      ...slide,
      image: slide.image ? `data:image/jpeg;base64,${Buffer.from(slide.image, 'binary').toString('base64')}` : null, // Convert binary to base64
    }));

    res.json(slides); // Respond with the list of slides
  });
};

// Controller to update a slide
const updateSlide = (req, res) => {
  const slideId = req.params.id; // Extract slide ID from request parameters
  const { icon, title, description, alt } = req.body; // Extract updated slide details from request body
  const image = req.file ? req.file.buffer : null; // Extract image file buffer if available

  // Validate required fields
  if (!icon || !title || !description) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Prepare the updated slide data
  const updatedSlide = {
    icon, // Updated icon
    title, // Updated title
    description, // Updated description
    alt: alt || null, // Optional alt text
    image: image ? image.toString('binary') : null, // Convert image buffer to binary string if provided
  };

  // Call the model to update the slide
  updateSlideModel(slideId, updatedSlide, (err, results) => {
    if (err) {
      console.error('Error updating slide:', err); // Log error for debugging
      return res.status(500).json({ error: 'Failed to update slide' }); // Respond with error
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Slide not found' }); // Respond if slide ID does not exist
    }

    res.status(200).json({ message: 'Slide updated successfully' }); // Respond with success message
  });
};

// Controller to delete a slide
const deleteSlide = (req, res) => {
  const slideId = req.params.id; // Extract slide ID from request parameters

  deleteSlideModel(slideId, (err, results) => {
    if (err) {
      console.error('Error deleting slide:', err); // Log error for debugging
      return res.status(500).json({ error: 'Failed to delete slide' }); // Respond with error
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Slide not found' }); // Respond if slide ID does not exist
    }

    res.status(200).json({ message: 'Slide deleted successfully' }); // Respond with success message
  });
};

// Export the controllers and middleware
export { addSlide, getSlides, deleteSlide, updateSlide, uploadMiddleware };