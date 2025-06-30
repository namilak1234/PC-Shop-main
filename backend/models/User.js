// Import bcrypt for hashing passwords
import bcrypt from 'bcryptjs';
// Import the database connection
import { db } from '../config/db.js';

// Function to create a new user
export const createUser = async (email, password, role = 'user') => {
  const hash = await bcrypt.hash(password, 10);
  return new Promise((resolve, reject) => {
    db.query('INSERT INTO users (email, password, role) VALUES (?, ?, ?)', [email, hash, role], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};


// Function to find a user by email
export const findUserByEmail = (email) => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
      if (err) return reject(err); // Reject the promise if there is an error
      resolve(results[0]); // Resolve the promise with the first result
    });
  });
};

// Function to block a user
export const blockUser = (userId) => {
  return new Promise((resolve, reject) => {
    db.query('UPDATE users SET isBlocked = TRUE WHERE id = ?', [userId], (err, result) => {
      if (err) return reject(err); // Reject the promise if there is an error
      resolve(result); // Resolve the promise with the result
    });
  });
};

// Function to unblock a user
export const unblockUser = (userId) => {
  return new Promise((resolve, reject) => {
    db.query('UPDATE users SET isBlocked = FALSE WHERE id = ?', [userId], (err, result) => {
      if (err) return reject(err); // Reject the promise if there is an error
      resolve(result); // Resolve the promise with the result
    });
  });
};

// Function to get all users
export const getAllUsers = () => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM users', (err, results) => {
      if (err) return reject(err); // Reject the promise if there is an error
      resolve(results); // Resolve the promise with the results
    });
  });
};

// Function to get all blocked users
export const getBlockedUsers = () => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM users WHERE isBlocked = TRUE', (err, results) => {
      if (err) return reject(err); // Reject the promise if there is an error
      resolve(results); // Resolve the promise with the results
    });
  });
};

// Function to get a user by ID
export const getUserById = (userId, callback) => {
  const query = 'SELECT id, email FROM users WHERE id = ?';
  db.query(query, [userId], (err, results) => {
    if (err) {
      return callback(err, null);
    }
    if (results.length === 0) {
      return callback(new Error('User not found'), null);
    }
    callback(null, results[0]);
  });
};