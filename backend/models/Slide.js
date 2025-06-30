import { db } from '../config/db.js'; // Import the database connection

// Function to add a new slide
export const addSlide = (slide, callback) => {
  const query = 'INSERT INTO slides (icon, title, description, image, alt) VALUES (?, ?, ?, ?, ?)';
  db.query(
    query,
    [slide.icon, slide.title, slide.description, slide.image, slide.alt], // Insert slide details into the database
    (err, results) => {
      if (err) {
        console.error('Database error:', err); // Log database errors for debugging
        return callback(err, null); // Return error to the callback
      }
      callback(null, results); // Return results to the callback
    }
  );
};

// Function to get all slides
export const getSlides = (callback) => {
  const query = 'SELECT id, icon, title, description, image, alt FROM slides'; // Query to fetch all slides
  db.query(query, callback); // Execute the query and return the results via callback
};

// Function to delete a slide
export const deleteSlides = (id, callback) => {
  const query = 'DELETE FROM slides WHERE id = ?'; // Query to delete a slide by ID
  db.query(query, [id], callback); // Execute the query with the provided ID
};

// Function to update a slide
export const updateSlides = (id, slideData, callback) => {
  const { icon, title, description, alt, image } = slideData; // Destructure slide data

  // If an image is provided, include it in the query; otherwise, skip updating the image
  const query = image
    ? `
      UPDATE slides 
      SET icon = ?, title = ?, description = ?, alt = ?, image = ? 
      WHERE id = ?
    ` // Query to update all fields including the image
    : `
      UPDATE slides 
      SET icon = ?, title = ?, description = ?, alt = ? 
      WHERE id = ?
    `; // Query to update fields excluding the image

  const params = image
    ? [icon, title, description, alt, image, id] // Parameters including the image
    : [icon, title, description, alt, id]; // Parameters excluding the image

  db.query(query, params, callback); // Execute the query with the appropriate parameters
};