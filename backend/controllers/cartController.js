// Import necessary functions from the Cart model
import { getCartItems, addToCart, updateCartItem, deleteCartItem, emptyCart as emptyCartModel } from '../models/Cart.js';

// Controller to get user's cart items
export const getUserCart = async (req, res) => {
  const userId = req.user.id; // Ensure user authentication is correctly handled

  try {
    const cartItems = await getCartItems(userId); // Get cart items for the user
    res.json(cartItems); // Return cart items
  } catch (err) {
    console.error('Error fetching cart items:', err); // Log error
    res.status(500).json({ message: 'Server error' }); // Return server error message
  }
};

// Controller to add an item to the cart
export const addItemToCart = async (req, res) => {
  const { productId, quantity } = req.body; // Extract item details from request body
  const userId = req.user.id; // Get user ID from request

  try {
    const result = await addToCart(userId, productId, quantity); // Add item to cart
    res.status(200).json({ message: 'Item added to cart successfully', result }); // Return success message
  } catch (error) {
    console.error('Error adding item to cart:', error); // Log error
    res.status(500).json({ message: 'Internal Server Error' }); // Return server error message
  }
};

// Controller to update an item in the cart
export const updateItemInCart = async (req, res) => {
  const { cartId, quantity } = req.body; // Extract cart item ID and new quantity from request body

  try {
    const result = await updateCartItem(cartId, quantity); // Update cart item quantity
    res.status(200).json({ message: 'Cart item updated successfully', result }); // Return success message
  } catch (error) {
    console.error('Error updating cart item:', error); // Log error
    res.status(500).json({ message: 'Internal Server Error' }); // Return server error message
  }
};

// Controller to remove an item from the cart
export const removeItemFromCart = async (req, res) => {
  const { cartId } = req.body; // Extract cart item ID from request body

  try {
    const result = await deleteCartItem(cartId); // Remove item from cart
    res.status(200).json({ message: 'Cart item removed successfully', result }); // Return success message
  } catch (error) {
    console.error('Error removing cart item:', error); // Log error
    res.status(500).json({ message: 'Internal Server Error' }); // Return server error message
  }
};

// Controller to empty the cart
export const emptyCart = async (req, res) => {
  try {
    const userId = req.user.id; // Get user ID from request
    await emptyCartModel(userId); // Empty the cart for the user
    res.status(200).json({ message: 'Cart emptied successfully.' }); // Return success message
  } catch (error) {
    console.error('Error emptying cart:', error); // Log error
    res.status(500).json({ message: 'Failed to empty cart. Please try again.' }); // Return error message
  }
};