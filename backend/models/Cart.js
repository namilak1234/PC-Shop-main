import { db } from '../config/db.js'; // Import database configuration

// Function to get cart items for a user
export const getCartItems = (userId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT c.id, c.product_id, p.title, 
       CAST(p.retailPrice AS DECIMAL(10,2)) AS price, 
       p.image1 AS image, c.quantity, 
       (c.quantity * p.retailPrice) AS totalPrice
        FROM carts AS c
        JOIN products AS p ON c.product_id = p.id
        WHERE c.user_id = ?;
    `; // SQL query to get cart items for a user

    db.query(query, [userId], (err, results) => { // Execute the query
      if (err) {
        console.error("Error fetching cart items:", err); // Log error
        reject(err); // Reject the promise with error
      } else {
        // Convert image from binary to base64 for frontend display
        results.forEach(item => {
          if (item.image) {
            item.image = Buffer.from(item.image, 'binary').toString('base64');
          }
        });
        resolve(results); // Resolve the promise with results
      }
    });
  });
};

// Function to add an item to the cart
export const addToCart = (userId, productId, quantity) => {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO carts (user_id, product_id, quantity)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)
    `; // SQL query to add an item to the cart or update quantity if it already exists

    db.query(query, [userId, productId, quantity], (err, result) => { // Execute the query
      if (err) return reject(err); // Reject the promise with error
      resolve(result); // Resolve the promise with result
    });
  });
};

// Function to update an item in the cart
export const updateCartItem = (cartId, quantity) => {
  return new Promise((resolve, reject) => {
    const query = 'UPDATE carts SET quantity = ? WHERE id = ?'; // SQL query to update cart item quantity

    db.query(query, [quantity, cartId], (err, result) => { // Execute the query
      if (err) reject(err); // Reject the promise with error
      resolve(result); // Resolve the promise with result
    });
  });
};

// Function to delete an item from the cart
export const deleteCartItem = (cartId) => {
  return new Promise((resolve, reject) => {
    const query = 'DELETE FROM carts WHERE id = ?'; // SQL query to delete a cart item

    db.query(query, [cartId], (err, result) => { // Execute the query
      if (err) reject(err); // Reject the promise with error
      resolve(result); // Resolve the promise with result
    });
  });
};

// Function to empty the cart for a user
export const emptyCart = (userId) => {
  return new Promise((resolve, reject) => {
    const query = 'DELETE FROM carts WHERE user_id = ?'; // SQL query to delete all cart items for a user

    db.query(query, [userId], (err, result) => { // Execute the query
      if (err) reject(err); // Reject the promise with error
      resolve(result); // Resolve the promise with result
    });
  });
};