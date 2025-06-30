// Import necessary libraries
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import slideRoutes from './routes/slideRoutes.js';
import { createTables } from './config/db.js';

// Load environment variables from the .env file
dotenv.config();

// Create an instance of the Express application
const app = express();
const PORT = process.env.PORT || 3000; // Set the port from environment variables or default to 3000

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
// Increase the payload limit to 5MB (or another appropriate size)
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));

// Routes
app.use('/api/auth', authRoutes); // Routes for authentication and user management
app.use('/api/products', productRoutes); // Routes for product management
app.use('/api/cart', cartRoutes); // Routes for cart management
app.use('/api/orders', orderRoutes); // Routes for order management
app.use('/api/slides', slideRoutes); // Routes for slide management

// Create Tables
createTables(); // Create necessary tables in the database

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`); // Log a message when the server starts
});