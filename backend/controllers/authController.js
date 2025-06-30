// Import necessary libraries and functions
import jwt from 'jsonwebtoken'; // Library for creating and verifying JSON Web Tokens
import bcrypt from 'bcryptjs'; // Library for hashing and comparing passwords
import { createUser, findUserByEmail, blockUser, unblockUser, getAllUsers, getBlockedUsers, getUserById } from '../models/User.js'; // Import user-related functions from the User model

// Controller for user signup
export const signup = async (req, res) => {
  const { email, password, role = 'user' } = req.body; // Extract email and password from the request body
  // Regular expression to enforce password policy
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  // Validate password length and complexity
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      message: 'Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.',
    });
  }

  try {
    const existingUser = await findUserByEmail(email); // Check if the email is already used
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already used' }); // Return error if email is already used
    }

    await createUser(email, password, role); // Create a new user
    res.status(200).json({ message: role === 'admin' ? 'Admin registered successfully!' : role === 'delivery_partner' ? 'Delivery Partner registered successfully!' : 'User registered successfully!' }); // Return success message
  } catch (err) {
    console.error('Error registering user:', err); // Log error
    res.status(500).json({ message: 'Server error' }); // Return server error message
  }
};

// Controller for user signin
export const signin = async (req, res) => {
  const { email, password } = req.body; // Extract email and password from the request body
  try {
    const user = await findUserByEmail(email); // Find user by email
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' }); // Return error if user not found
    }

    if (user.isBlocked) {
      return res.status(400).json({ message: 'Your account is blocked. Please contact support.' }); // Return error if user is blocked
    }

    const isMatch = await bcrypt.compare(password, user.password); // Compare provided password with stored password
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' }); // Return error if password does not match
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' }); // Generate JWT token

    res.status(200).json({ message: user.role === 'admin' ? 'Admin sign in successful!' : user.role === 'delivery_partner' ? 'Delivery Partner Sign in successful!' : 'Sign in successful!', token, role: user.role }); // Return success message for regular user
  } catch (err) {
    console.error('Error signing in:', err); // Log error
    res.status(500).json({ message: 'Server error' }); // Return server error message
  }
};

// Controller to block a user
export const blockUserController = async (req, res) => {
  const { userId } = req.params; // Extract userId from request parameters
  try {
    await blockUser(userId); // Block the user
    res.status(200).json({ message: 'User blocked successfully!' }); // Return success message
  } catch (err) {
    console.error('Error blocking user:', err); // Log error
    res.status(500).json({ message: 'Server error' }); // Return server error message
  }
};

// Controller to unblock a user
export const unblockUserController = async (req, res) => {
  const { userId } = req.params; // Extract userId from request parameters
  try {
    await unblockUser(userId); // Unblock the user
    res.status(200).json({ message: 'User unblocked successfully!' }); // Return success message
  } catch (err) {
    console.error('Error unblocking user:', err); // Log error
    res.status(500).json({ message: 'Server error' }); // Return server error message
  }
};

// Controller to get all users
export const getAllUsersController = async (req, res) => {
  try {
    const users = await getAllUsers(); // Get all users
    res.status(200).json(users); // Return users
  } catch (err) {
    console.error('Error fetching users:', err); // Log error
    res.status(500).json({ message: 'Server error' }); // Return server error message
  }
};

// Controller to get all blocked users
export const getBlockedUsersController = async (req, res) => {
  try {
    const users = await getBlockedUsers(); // Get all blocked users
    res.status(200).json(users); // Return blocked users
  } catch (err) {
    console.error('Error fetching blocked users:', err); // Log error
    res.status(500).json({ message: 'Server error' }); // Return server error message
  }
};

// Controller to get user details
export const getUserDetails = (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1]; // Extract token from authorization header
    // Decode the token to get the user ID (assuming you are using JWT)
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify and decode the token
    const userId = decoded.id; // Extract user ID from decoded token

    getUserById(userId, (err, user) => { // Get user details by ID
      if (err) {
        console.error('Error retrieving user details:', err); // Log error
        return res.status(500).json({ error: 'Failed to retrieve user details' }); // Return error message
      }
      res.status(200).json(user); // Return user details
    });
  } catch (error) {
    console.error('Error retrieving user details:', error); // Log error
    res.status(500).json({ error: 'Failed to retrieve user details' }); // Return error message
  }
};