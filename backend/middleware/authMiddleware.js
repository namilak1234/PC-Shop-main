import jwt from 'jsonwebtoken'; // Import JSON Web Token library
import { db } from '../config/db.js'; // Import database configuration

// Middleware to authenticate user
export const authenticateUser = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', ''); // Extract token from Authorization header

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' }); // Return error if no token is provided
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify and decode the token
    req.user = decoded; // Attach decoded token data to the request object

    const query = 'SELECT * FROM users WHERE id = ?'; // SQL query to find user by ID
    db.query(query, [decoded.id], (err, results) => { // Execute the query
      if (err) {
        return res.status(500).json({ error: 'Server error' }); // Return error if query fails
      }
      if (results.length === 0) {
        return res.status(401).json({ error: 'Invalid token' }); // Return error if no user is found
      }
      req.user = results[0]; // Attach user data to the request object
      next(); // Proceed to the next middleware or route handler
    });
  } catch (ex) {
    res.status(400).json({ error: 'Invalid token' }); // Return error if token is invalid
  }
};