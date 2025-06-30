// Import necessary functions from the Product model
import { addProduct, getProducts, updateProduct, deleteProduct, getProductsForDisplay, getProductById, getProductsGroupedByCategory, getOtherProducts } from '../models/Product.js';
// Import multer for handling file uploads
import multer from 'multer';

// Configure multer to store files in memory
const storage = multer.memoryStorage(); // Use memory storage for uploaded files
const upload = multer({ storage }); // Initialize multer with the configured storage
const uploadMiddleware = upload.fields([
  { name: 'image1', maxCount: 1 },
  { name: 'image2', maxCount: 1 },
  { name: 'image3', maxCount: 1 },
  { name: 'image4', maxCount: 1 }
]); // Middleware to handle multiple file uploads

// Controller to add a new product
const addProductController = async (req, res) => {
  try {
    const product = req.body;
    const images = [];
    const imageTypes = [];

    // Extract images and their MIME types
    for (let i = 1; i <= 4; i++) {
      if (req.files[`image${i}`]) {
        images.push(req.files[`image${i}`][0].buffer);
        imageTypes.push(req.files[`image${i}`][0].mimetype);
      } else {
        images.push(null);
        imageTypes.push(null);
      }
    }

    const formattedProduct = {
      title: product.title,
      category: product.category,
      supplyPrice: parseFloat(product.supplyPrice),
      retailPrice: parseFloat(product.retailPrice),
      availableQuantity: parseInt(product.availableQuantity),
      supplier: product.supplier,
      image1: images[0] ? images[0].toString('binary') : null,
      image2: images[1] ? images[1].toString('binary') : null,
      image3: images[2] ? images[2].toString('binary') : null,
      image4: images[3] ? images[3].toString('binary') : null,
      image1_type: imageTypes[0],
      image2_type: imageTypes[1],
      image3_type: imageTypes[2],
      image4_type: imageTypes[3]
    };

    const result = await addProduct(formattedProduct);
    res.status(201).json({
      success: true,
      message: 'Product added successfully',
      productId: result.insertId
    });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding product',
      error: error.message
    });
  }
};


// Controller to get all products
const getAllProducts = async (req, res) => {
  try {
    const products = await getProducts(); // Fetch all products from the database
    res.status(200).json(products); // Return the products
  } catch (error) {
    console.error('Error fetching products:', error); // Log error
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message // Return error message
    });
  }
};

// Controller to update a product
const updateProductController = async (req, res) => {
  try {
    const productId = req.params.id;
    const updatedProduct = req.body;

    const images = [];
    const imageTypes = [];

    // Extract images and their MIME types
    for (let i = 1; i <= 4; i++) {
      if (req.files[`image${i}`]) {
        images.push(req.files[`image${i}`][0].buffer);
        imageTypes.push(req.files[`image${i}`][0].mimetype);
      } else {
        images.push(null);
        imageTypes.push(null);
      }
    }

    const formattedProduct = {
      title: updatedProduct.title,
      category: updatedProduct.category,
      supplyPrice: parseFloat(updatedProduct.supplyPrice),
      retailPrice: parseFloat(updatedProduct.retailPrice),
      availableQuantity: parseInt(updatedProduct.availableQuantity),
      supplier: updatedProduct.supplier,
      image1: images[0] ? images[0].toString('binary') : null,
      image2: images[1] ? images[1].toString('binary') : null,
      image3: images[2] ? images[2].toString('binary') : null,
      image4: images[3] ? images[3].toString('binary') : null,
    };

    const result = await updateProduct(productId, formattedProduct);

    if (result.affectedRows > 0) {
      res.status(200).json({
        success: true,
        message: 'Product updated successfully',
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating product',
      error: error.message,
    });
  }
};

// Controller to delete a product
const deleteProductController = async (req, res) => {
  
    const productId = req.params.id; // Extract product ID from request parameters

    try {
      // Call the deleteProduct function from the model
      const result = await deleteProduct(productId);
  
      if (result.affectedRows > 0) {
        res.status(200).json({ message: 'Product deleted successfully' });
      } else {
        res.status(404).json({ message: 'Product not found' });
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({ message: 'Failed to delete product', error: error.message });
    }
  };
  
// Controller to get products for display
const getProductsForDisplayController = async (req, res) => {
  try {
    const products = await getProductsForDisplay(); // Fetch products for display from the database
    res.status(200).json(products); // Return the products
  } catch (error) {
    console.error('Error fetching products for display:', error); // Log error
    res.status(500).json({
      success: false,
      message: 'Error fetching products for display',
      error: error.message // Return error message
    });
  }
};

// Controller to get a specific product by ID
const getProductByIdController = async (req, res) => {
  try {
    const productId = req.params.id; // Extract product ID from request parameters
    const product = await getProductById(productId); // Fetch product by ID from the database
    
    if (product) {
      // Convert all images to Base64 format
      for (let i = 1; i <= 4; i++) {
        if (product[`image${i}`]) {
          product[`image${i}`] = Buffer.from(product[`image${i}`], 'binary').toString('base64');
        }
      }      
      res.status(200).json(product); // Return the product details
    } else {
      res.status(404).json({
        success: false,
        message: 'Product not found' // Return error if product not found
      });
    }
  } catch (error) {
    console.error('Error fetching product details:', error); // Log error
    res.status(500).json({
      success: false,
      message: 'Error fetching product details',
      error: error.message // Return error message
    });
  }
};

// Controller to get products grouped by category
const getProductsGroupedByCategoryController = async (req, res) => {
  try {
    const categories = await getProductsGroupedByCategory(); // Fetch products grouped by category from the database
    res.status(200).json(categories); // Return the grouped products
  } catch (error) {
    console.error('Error fetching products grouped by category:', error); // Log error
    if (error.message === 'Product not found') {
      res.status(404).json({
        success: false,
        message: 'Product not found' // Return error if no products found
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Error fetching products grouped by category',
        error: error.message // Return error message
      });
    }
  }
};

const getOtherProductsController = async (req, res) => {
  try {
    const { excludeId } = req.query; // Extract the product ID to exclude from the query parameters
    const limit = parseInt(req.query.limit) || 5; // Extract the limit or default to 5

    if (!excludeId) {
      return res.status(400).json({
        success: false,
        message: 'excludeId query parameter is required',
      });
    }

    const products = await getOtherProducts(excludeId, limit); // Fetch other products
    res.status(200).json(products); // Return the products
  } catch (error) {
    console.error('Error fetching other products:', error); // Log the error
    res.status(500).json({
      success: false,
      message: 'Error fetching other products',
      error: error.message, // Return the error message
    });
  }
};

// Export the controllers
export { 
  addProductController, 
  uploadMiddleware, 
  getAllProducts, 
  updateProductController, 
  deleteProductController, 
  getProductsForDisplayController,
  getProductByIdController,
  getProductsGroupedByCategoryController,
  getOtherProductsController
};