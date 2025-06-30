// Import the database connection
import { db } from '../config/db.js';

// Function to add a new product to the database
const addProduct = (product) => {
  const { title, category, supplyPrice, retailPrice, availableQuantity, supplier, image1, image2, image3, image4 } = product;
  const query = `
    INSERT INTO products (title, category, supplyPrice, retailPrice, availableQuantity, supplier, image1, image2, image3, image4)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  return new Promise((resolve, reject) => {
    db.query(query, [title, category, supplyPrice, retailPrice, availableQuantity, supplier, image1, image2, image3, image4], (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
};

// Function to get all products from the database
const getProducts = () => {
  const query = `
    SELECT * FROM products
    ORDER BY id DESC
  `;
  return new Promise((resolve, reject) => {
    db.query(query, (err, results) => {
      if (err) reject(err); // Reject the promise if there is an error
      else resolve(results); // Resolve the promise with the results
    });
  });
};

// Function to update a product in the database
const updateProduct = (productId, updatedProduct) => {
  const {
    title,
    category,
    supplyPrice,
    retailPrice,
    availableQuantity,
    supplier,
    image1,
    image2,
    image3,
    image4,
  } = updatedProduct;

  const query = `
    UPDATE products
    SET title = ?, category = ?, supplyPrice = ?, retailPrice = ?, availableQuantity = ?, supplier = ?,
        image1 = COALESCE(?, image1), image2 = COALESCE(?, image2), 
        image3 = COALESCE(?, image3), image4 = COALESCE(?, image4)
    WHERE id = ?
  `;

  return new Promise((resolve, reject) => {
    db.query(
      query,
      [
        title,
        category,
        supplyPrice,
        retailPrice,
        availableQuantity,
        supplier,
        image1,
        image2,
        image3,
        image4,
        productId,
      ],
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }
    );
  });
};

// Function to delete a product from the database
const deleteProduct = async (productId) => {
  try {
    // Delete the product from the carts table
    await db.promise().query('DELETE FROM carts WHERE product_id = ?', [productId]);

    // Delete the product from the products table
    const [result] = await db.promise().query('DELETE FROM products WHERE id = ?', [productId]);

    return result; // Return the result of the deletion
  } catch (err) {
    throw err; // Throw the error to be handled by the controller
  }
};

// Function to get products for display from the database
const getProductsForDisplay = () => {
  const query = `
    SELECT id, title, category, retailPrice, image1 FROM products
    ORDER BY id DESC
  `;
  return new Promise((resolve, reject) => {
    db.query(query, (err, results) => {
      if (err) reject(err); // Reject the promise if there is an error
      else {
        results.forEach(product => {
          if (product.image1) {
            product.image1 = Buffer.from(product.image1, 'binary').toString('base64'); // Convert image to base64
          }
        });
        resolve(results); // Resolve the promise with the results
      }
    });
  });
};

// Function to get a product by ID from the database
const getProductById = (productId) => {
  const query = `
    SELECT id, title, category, retailPrice, availableQuantity, supplier,
           image1, image2, image3, image4
    FROM products
    WHERE id = ?
  `;
  return new Promise((resolve, reject) => {
    db.query(query, [productId], (err, results) => {
      if (err) reject(err); // Reject the promise if there is an error
      else resolve(results[0] || null); // Resolve with the product or null if not found
    });
  });
};

// Function to get products grouped by category
const getProductsGroupedByCategory = () => {
  const query = `
    SELECT category, id, title, retailPrice, image1
    FROM products
    ORDER BY category, id
  `;
  return new Promise((resolve, reject) => {
    db.query(query, (err, results) => {
      if (err) {
        reject(err); // Reject the promise if there is an error
      } else {
        if (results.length === 0) {
          reject(new Error('Product not found')); // Reject if no products are found
        } else {
          // Group products by category
          const groupedProducts = results.reduce((acc, product) => {
            if (!acc[product.category]) {
              acc[product.category] = [];
            }
            acc[product.category].push({
              id: product.id,
              title: product.title,
              retailPrice: product.retailPrice,
              image1: product.image1 ? Buffer.from(product.image1, 'binary').toString('base64') : null // Convert image to base64
            });
            return acc;
          }, {});

          // Format the grouped products into an array of categories
          const categories = Object.keys(groupedProducts).map(category => ({
            category,
            products: groupedProducts[category]
          }));

          resolve(categories); // Resolve the promise with the grouped categories
        }
        resolve(results[0] || null);
      }
    });
  });
};

const getOtherProducts = (excludeId, limit = 5) => {
  const query = `
    SELECT id, title, category, retailPrice, image1
    FROM products
    WHERE id != ?
    ORDER BY RAND() 
    LIMIT ?
  `;
  return new Promise((resolve, reject) => {
    db.query(query, [excludeId, limit], (err, results) => {
      if (err) reject(err); // Reject the promise if there is an error
      else {
        results.forEach(product => {
          if (product.image1) {
            product.image1 = Buffer.from(product.image1, 'binary').toString('base64'); // Convert image to base64
          }
        });
        resolve(results); // Resolve the promise with the results
      }
    });
  });
};

// Export the functions to be used in the controller
export { addProduct, getProducts, updateProduct, deleteProduct, getProductsForDisplay, getProductById, getProductsGroupedByCategory, getOtherProducts };