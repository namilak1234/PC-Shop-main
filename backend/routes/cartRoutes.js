import express from 'express'; // Import Express framework
import { getUserCart, addItemToCart, updateItemInCart, removeItemFromCart, emptyCart } from '../controllers/cartController.js'; // Import cart controllers
import { authenticateUser } from '../middleware/authMiddleware.js'; // Middleware for user authentication

const router = express.Router(); // Create a new router instance

// Route to get user's cart items
router.get('/', authenticateUser, getUserCart);

// Route to add an item to the cart
router.post('/add', authenticateUser, addItemToCart);

// Route to update an item in the cart
router.put('/update', authenticateUser, updateItemInCart);

// Route to remove an item from the cart
router.delete('/remove', authenticateUser, removeItemFromCart);

// Route to empty the cart
router.post('/empty', authenticateUser, emptyCart);

// Route to empty the cart (alternative endpoint)
router.delete('/empty1', authenticateUser, emptyCart);


export default router; // Export the router