import { db } from '../config/db.js'; // Import database configuration

// Function to generate a 6-character order ID
const generateOrderId = () => {
  return Math.random().toString(36).substr(2, 6).toUpperCase();
};

// Function to create a new order
const createOrder = (orderDetails, callback) => {
  const orderId = generateOrderId(); // Generate a new order ID
  const query = `
    INSERT INTO orders (id, user_id, product_title, quantity, total, name, address, phone, email, payment_method, receivedToSupplier)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `; // SQL query to insert a new order into the orders table
  // Store product titles and quantities as comma-separated strings
  const productTitleStr = Array.isArray(orderDetails.product_title) 
    ? orderDetails.product_title.join(', ') 
    : orderDetails.product_title;
    
  const quantityStr = Array.isArray(orderDetails.quantity) 
    ? orderDetails.quantity.join(', ') 
    : orderDetails.quantity;
  
  const values = [
    orderId, // Order ID
    orderDetails.user_id, // User ID
    productTitleStr, // Product titles as a string
    quantityStr, // Quantities as a string
    orderDetails.total, // Total price
    orderDetails.name, // Customer name
    orderDetails.address, // Customer address
    orderDetails.phone, // Customer phone number
    orderDetails.email, // Customer email
    orderDetails.payment_method, // Payment method
    orderDetails.receivedToSupplier || false // Received to supplier status
  ];

  db.query(query, values, (err, results) => { // Execute the query
    if (err) {
      return callback(err); // Return error through callback if query fails
    }
    callback(null, { orderId, ...results }); // Return results through callback if query succeeds
  });
};

// Function to get all orders
const getAllOrders = (callback) => {
  const query = 'SELECT * FROM orders WHERE receivedToSupplier = FALSE';
  db.query(query, (err, results) => {
    if (err) {
      return callback(err);
    }
    callback(null, results);
  });
};

// Function to get all received orders
const getAllReceivedOrders = (callback) => {
  const query = 'SELECT * FROM orders WHERE receivedToSupplier = TRUE';
  db.query(query, (err, results) => {
    if (err) {
      return callback(err);
    }
    callback(null, results);
  });
};

// Helper function to parse product titles and quantities from an order
const parseOrderItems = (order) => {
  const titles = order.product_title.split(',').map(title => title.trim());
  const quantities = order.quantity.split(',').map(qty => parseInt(qty.trim(), 10));
  
  return titles.map((title, index) => ({
    title,
    quantity: quantities[index] || 0
  }));
};

// Function to update the receivedToSupplier status of an order
const updateReceivedToSupplier = (orderId, receivedToSupplier, callback) => {
  // First, get the order details to know which product and quantity
  const getOrderQuery = 'SELECT product_title, quantity FROM orders WHERE id = ?';
  
  db.query(getOrderQuery, [orderId], (err, orderResults) => {
    if (err) {
      return callback(err);
    }
    
    // Check if there are any results
    if (orderResults.length === 0) {
      return callback(new Error('Order not found'));
    }
    
    // If marking as received, update the product quantities
    if (receivedToSupplier) {
      const orderItems = parseOrderItems(orderResults[0]);
      
      // Track completed updates
      let updatedCount = 0;
      let updateErrors = [];
      
      // Update each product's quantity
      orderItems.forEach(item => {
        // Find the product by title and update its quantity
        const updateProductQuery = 'UPDATE products SET availableQuantity = availableQuantity - ? WHERE title = ?';
        
        db.query(updateProductQuery, [item.quantity, item.title], (productErr) => {
          updatedCount++;
          
          if (productErr) {
            console.error(`Error updating quantity for ${item.title}:`, productErr);
            updateErrors.push(item.title);
          }
          
          // Once all updates are complete, update the order status
          if (updatedCount === orderItems.length) {
            // Update the order status
            const updateOrderQuery = 'UPDATE orders SET receivedToSupplier = ? WHERE id = ?';
            db.query(updateOrderQuery, [receivedToSupplier, orderId], (orderErr, results) => {
              if (orderErr) {
                console.error('Error updating order status:', orderErr);
                return callback(orderErr);
              }
              
              if (updateErrors.length > 0) {
                return callback(new Error(`Failed to update quantities for: ${updateErrors.join(', ')}`));
              }
              
              callback(null, results);
            });
          }
        });
      });
      
      // Handle case where there are no products to update
      if (orderItems.length === 0) {
        const updateOrderQuery = 'UPDATE orders SET receivedToSupplier = ? WHERE id = ?';
        db.query(updateOrderQuery, [receivedToSupplier, orderId], (orderErr, results) => {
          if (orderErr) {
            return callback(orderErr);
          }
          callback(null, results);
        });
      }
    } else {
      // Just update the order status without affecting product quantity
      const updateOrderQuery = 'UPDATE orders SET receivedToSupplier = ? WHERE id = ?';
      db.query(updateOrderQuery, [receivedToSupplier, orderId], (orderErr, results) => {
        if (orderErr) {
          return callback(orderErr);
        }
        callback(null, results);
      });
    }
  });
};


// Function to get orders for a specific user
const getUserOrders = (userId, callback) => {
  const query = 'SELECT * FROM orders WHERE user_id = ?';
  db.query(query, [userId], (err, results) => {
    if (err) {
      return callback(err);
    }
    callback(null, results);
  });
};

// Function to update the status of an order
const updateOrderStatus = (orderId, receivedToSupplier, callback) => {
  // Similar to updateReceivedToSupplier, but specifically for the status
  // First, get the order details to know which product and quantity
  const getOrderQuery = 'SELECT product_title, quantity FROM orders WHERE id = ?';
  
  db.query(getOrderQuery, [orderId], (err, orderResults) => {
    if (err) {
      return callback(err);
    }
    
    // Check if there are any results
    if (orderResults.length === 0) {
      return callback(new Error('Order not found'));
    }
    
    const order = orderResults[0];
    
    // Check if order is already marked as received - avoid double updates
    if (order.receivedToSupplier == 1) {
      return callback(null, { affectedRows: 0, message: 'Order already marked as received' });
    }
    
    // If marking as received, update the product quantities
    if (receivedToSupplier === 1) {
      const orderItems = parseOrderItems(order);
      
      // Track completed updates
      let updatedCount = 0;
      let updateErrors = [];
      
      // If no products to update, just update the order status
      if (orderItems.length === 0) {
        const updateOrderQuery = 'UPDATE orders SET receivedToSupplier = ? WHERE id = ?';
        db.query(updateOrderQuery, [receivedToSupplier, orderId], (orderErr, results) => {
          if (orderErr) {
            return callback(orderErr);
          }
          callback(null, results);
        });
        return;
      }
      
      // Update each product's quantity
      orderItems.forEach(item => {
        // console.log(`Updating quantity for ${item.title} by ${item.quantity}`);
        
        // Find the product by title and update its quantity
        const updateProductQuery = 'UPDATE products SET availableQuantity = availableQuantity - ? WHERE title = ?';
        
        db.query(updateProductQuery, [item.quantity, item.title], (productErr) => {
          updatedCount++;
          
          if (productErr) {
            console.error(`Error updating quantity for ${item.title}:`, productErr);
            updateErrors.push(item.title);
          }
          
          // Once all updates are complete, update the order status
          if (updatedCount === orderItems.length) {
            // Update the order status
            const updateOrderQuery = 'UPDATE orders SET receivedToSupplier = ? WHERE id = ?';
            db.query(updateOrderQuery, [receivedToSupplier, orderId], (orderErr, results) => {
              if (orderErr) {
                return callback(orderErr);
              }
              
              if (updateErrors.length > 0) {
                return callback(new Error(`Order status updated, but failed to update quantities for: ${updateErrors.join(', ')}`));
              }
              
              callback(null, results);
            });
          }
        });
      });
    } else {
      // Just update the order status without affecting product quantity
      const updateOrderQuery = 'UPDATE orders SET receivedToSupplier = ? WHERE id = ?';
      db.query(updateOrderQuery, [receivedToSupplier, orderId], (orderErr, results) => {
        if (orderErr) {
          return callback(orderErr);
        }
        callback(null, results);
      });
    }
  });
};

// Function to delete an order
const deleteOrder = (orderId, callback) => {
  const query = 'DELETE FROM orders WHERE id = ?';
  db.query(query, [orderId], (err, results) => {
    if (err) {
      return callback(err);
    }
    callback(null, results);
  });
};

// Function to get previous orders for a specific user
const getUserPreviousOrders = (userId, callback) => {
  const query = 'SELECT * FROM orders WHERE user_id = ? AND receivedToSupplier = TRUE';
  db.query(query, [userId], (err, results) => {
    if (err) {
      return callback(err);
    }
    callback(null, results);
  });
};

// Delivery detail functions (kept as is)
const getDeliveryDetailsFromDB = (userId, callback) => {
  const query = 'SELECT * FROM delivery_details WHERE user_id = ?';
  db.query(query, [userId], (err, results) => {
    if (err) {
      return callback(err);
    }
    callback(null, results);
  });
};

const getDeliveryDetailById = (id, callback) => {
  const query = 'SELECT * FROM delivery_details WHERE id = ?';
  db.query(query, [id], (err, results) => {
    if (err) {
      return callback(err);
    }
    callback(null, results[0]);
  });
};

const addDeliveryDetail = (details, callback) => {
  const query = `
    INSERT INTO delivery_details (user_id, fullName, streetAddress, apartment, city, phoneNumber, email)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [details.user_id, details.fullName, details.streetAddress, details.apartment, details.city, details.phoneNumber, details.email];
  db.query(query, values, (err, results) => {
    if (err) {
      return callback(err);
    }
    callback(null, results);
  });
};

const updateDeliveryDetail = (id, details, callback) => {
  const query = `
    UPDATE delivery_details
    SET fullName = ?, streetAddress = ?, apartment = ?, city = ?, phoneNumber = ?, email = ?
    WHERE id = ?
  `;
  const values = [details.fullName, details.streetAddress, details.apartment, details.city, details.phoneNumber, details.email, id];
  db.query(query, values, (err, results) => {
    if (err) {
      return callback(err);
    }
    callback(null, results);
  });
};

const deleteDeliveryDetail = (id, callback) => {
  const query = 'DELETE FROM delivery_details WHERE id = ?';
  db.query(query, [id], (err, results) => {
    if (err) {
      return callback(err);
    }
    callback(null, results);
  });
};

export { 
  createOrder,
  getAllOrders,
  getAllReceivedOrders,
  updateReceivedToSupplier,
  getUserOrders,
  updateOrderStatus,
  deleteOrder,
  getUserPreviousOrders,
  getDeliveryDetailsFromDB,
  getDeliveryDetailById,
  addDeliveryDetail,
  updateDeliveryDetail,
  deleteDeliveryDetail
};