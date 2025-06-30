// Import express for creating the router
import express from 'express';
// Import controllers for handling authentication and user management
import { signup, signin, blockUserController, unblockUserController, getAllUsersController, getBlockedUsersController, getUserDetails} from '../controllers/authController.js';

// Create a new router instance
const router = express.Router();

// Route for user signup
router.post('/signup', signup);

// Route for user signin
router.post('/signin', signin);

// Route to block a user by userId
router.put('/users/block/:userId', blockUserController);

// Route to unblock a user by userId
router.put('/users/unblock/:userId', unblockUserController);

// Route to get all users
router.get('/users', getAllUsersController);

// Route to get all blocked users
router.get('/users/blocked', getBlockedUsersController);

// Route to get user details
router.get('/me', getUserDetails);

// Export the router to be used in other parts of the application
export default router;
