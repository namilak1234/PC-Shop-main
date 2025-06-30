// Import express for creating the router
import express from 'express';
// Import controllers and middleware for handling product-related operations
import { addProductController, uploadMiddleware, getAllProducts, updateProductController, deleteProductController, getProductsForDisplayController, getProductByIdController, getProductsGroupedByCategoryController, getOtherProductsController } from '../controllers/productController.js';

// Create a new router instance
const router = express.Router();

// Route to get all products
router.get('/', getAllProducts);

// Route to get products for display
router.get('/display', getProductsForDisplayController);

// Route to add a new product with image upload middleware
router.post('/add', uploadMiddleware, addProductController);

// Route to update a product by ID
router.put('/:id', uploadMiddleware, updateProductController);

// Route to delete a product by ID
router.delete('/:id', deleteProductController);

// Route to get products grouped by category
router.get('/grouped-by-category', getProductsGroupedByCategoryController);

// Route to get other products
router.get('/other', getOtherProductsController);

// Route to get a product by ID
router.get('/:id', getProductByIdController);


// Export the router to be used in other parts of the application
export default router;
