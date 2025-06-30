// Import order-related functions from the Order model
import {
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
} from '../models/Order.js';

// Import database connection
import { db } from '../config/db.js';

// Controller function to add a new order
export const addOrder = (req, res) => {
  // Destructure order details from the request body
  const {
    user_id,
    product_title,
    quantity,
    total,
    name,
    address,
    phone,
    email,
    payment_method,
    receivedToSupplier
  } = req.body;

  // Validate required fields
  if (!user_id || !product_title || !total || !name || !address || !phone || !email || !payment_method) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Convert to arrays if not already
  const productTitles = Array.isArray(product_title) ? product_title : [product_title];
  const quantities = Array.isArray(quantity) ? quantity : [quantity];

  // Check product availability
  const stockIssues = [];
  
  // Create a Promise-based version for easier async handling
  const checkProductAvailability = (title, qty) => {
    return new Promise((resolve, reject) => {
      const checkProductQuery = 'SELECT availableQuantity FROM products WHERE title = ?';
      db.query(checkProductQuery, [title], (err, results) => {
        if (err) {
          reject(err);
          return;
        }
        
        if (results.length === 0 || results[0].availableQuantity < qty) {
          stockIssues.push({ 
            title, 
            requestedQuantity: qty,
            availableQuantity: results[0]?.availableQuantity || 0 
          });
        }
        resolve();
      });
    });
  };

  // Check all products in parallel
  const checkPromises = productTitles.map((title, index) => 
    checkProductAvailability(title, quantities[index])
  );

  // Process all availability checks
  Promise.all(checkPromises)
    .then(() => {
      // If any stock issues were found, return an error
      if (stockIssues.length > 0) {
        return res.status(400).json({ error: 'Insufficient stock', stockIssues });
      }
      
      // Format order details for database
      const orderDetails = {
        user_id,
        product_title: productTitles,
        quantity: quantities,
        total,
        name,
        address,
        phone,
        email,
        payment_method,
        receivedToSupplier: receivedToSupplier || 0 // Default to 0 if not provided
      };
      
      // Create the order in the database
      createOrder(orderDetails, (err, results) => {
        if (err) {
          console.error('Error creating order:', err);
          return res.status(500).json({ error: 'Failed to create order' });
        }
        
        // Return success response
        res.status(201).json({ 
          message: 'Order created successfully', 
          orderId: results.orderId 
        });
      });
    })
    .catch(error => {
      console.error('Error checking product availability:', error);
      res.status(500).json({ error: 'Failed to check product availability' });
    });
};

// Controller function to get all orders
export const getOrders = (req, res) => {
  // Call the getAllOrders function to fetch all orders from the database
  getAllOrders((err, orders) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch orders' });
    }
    res.json(orders);
  });
};

// Controller function to get all received orders
export const getReceivedOrders = (req, res) => {
  // Call the getAllReceivedOrders function to fetch all received orders from the database
  getAllReceivedOrders((err, orders) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch orders' });
    }
    res.json(orders);
  });
};

// Controller function to update the received status of an order
export const updateOrderStatusA = (req, res) => {
  const { orderId, receivedToSupplier } = req.body;

  // Validate required fields
  if (orderId == null || receivedToSupplier == null) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Call the updateReceivedToSupplier function to update the order status in the database
  updateReceivedToSupplier(orderId, receivedToSupplier, (err, results) => {
    if (err) {
      console.error('Error updating order status:', err);
      return res.status(500).json({ error: 'Failed to update order status: ' + err.message });
    }
    res.json({ message: 'Order status updated successfully' });
  });
};

// Controller function to get orders for a specific user
export const getUserOrdersA = (req, res) => {
  const userId = req.user.id; // Use the authenticated user's ID
  // Call the getUserOrders function to fetch the user's orders from the database
  getUserOrders(userId, (err, orders) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch orders' });
    }
    res.json(orders);
  });
};

// Controller function to mark an order as received
export const markOrderAsReceived = (req, res) => {
  const orderId = req.params.orderId; // Use route parameter to get the order ID
  
  // Call the updateOrderStatus function to update the order status to received (status 1)
  updateOrderStatus(orderId, 1, (err, results) => {
    if (err) {
      console.error('Error marking order as received:', err);
      return res.status(500).json({ error: 'Failed to mark order as received: ' + err.message });
    }
    
    res.json({ 
      message: 'Order marked as received successfully',
      affectedRows: results.affectedRows 
    });
  });
};

// Controller function to cancel an order
export const cancelOrder = (req, res) => {
  const orderId = req.params.orderId; // Use route parameter to get the order ID
  // Call the deleteOrder function to remove the order from the database
  deleteOrder(orderId, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to cancel order' });
    }
    res.json({ message: 'Order cancelled successfully' });
  });
};

// Controller function to get the order history for a specific user
export const getUserOrderHistory = (req, res) => {
  const userId = req.user.id; // Use the authenticated user's ID
  // Call the getUserPreviousOrders function to fetch the user's previous orders from the database
  getUserPreviousOrders(userId, (err, orders) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch order history' });
    }
    // Filter orders to include only those received by the supplier
    const receivedOrders = orders.filter(order => order.receivedToSupplier);
    res.json(receivedOrders);
  });
};

// Controller function to get delivery details
export const getDeliveryDetailsController = (req, res) => {
  const userId = req.user.id;
  getDeliveryDetailsFromDB(userId, (err, details) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch delivery details' });
    }
    res.json(details);
  });
};

// Controller function to get a single delivery detail by ID
export const getDeliveryDetailByIdController = (req, res) => {
  const id = req.params.id;
  getDeliveryDetailById(id, (err, detail) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch delivery detail' });
    }
    res.json(detail);
  });
};

// Controller function to add a new delivery detail
export const addDeliveryDetailController = (req, res) => {
  const userId = req.user.id;
  const { fullName, streetAddress, apartment, city, phoneNumber, email } = req.body;
  
  // Validate required fields
  if ( !fullName || !streetAddress || !city || !phoneNumber || !email) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  addDeliveryDetail({ user_id: userId, fullName, streetAddress, apartment, city, phoneNumber, email }, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to add delivery detail' });
    }
    // Return the newly added delivery detail in the response
    const newDetail = {
      id: results.insertId,
      user_id: userId,
      fullName,
      streetAddress,
      apartment,
      city,
      phoneNumber,
      email
    };
    res.status(201).json(newDetail);
  });
};

// Controller function to update a delivery detail
export const updateDeliveryDetailController = (req, res) => {
  const id = req.params.id;
  const { fullName, streetAddress, apartment, city, phoneNumber, email } = req.body;
  updateDeliveryDetail(id, { fullName, streetAddress, apartment, city, phoneNumber, email }, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to update delivery detail' });
    }
    res.json({ message: 'Delivery detail updated successfully' });
  });
};

// Controller function to delete a delivery detail
export const deleteDeliveryDetailController = (req, res) => {
  const id = req.params.id;
  deleteDeliveryDetail(id, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete delivery detail' });
    }
    res.json({ message: 'Delivery detail deleted successfully' });
  });
};

// Controller function to get top-selling products
export const getTopSellingProducts = (req, res) => {
  const query = `
    SELECT 
      p.id AS productId,
      p.title AS productName,
      p.image1 AS productImage,
      p.retailPrice AS productPrice,
      SUM(o.quantity) AS totalSold
    FROM 
      orders o
    JOIN 
      products p 
    ON 
      FIND_IN_SET(p.title, o.product_title) > 0
    GROUP BY 
      p.id
    ORDER BY 
      totalSold DESC
    LIMIT 5;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching top-selling products:', err);
      return res.status(500).json({ error: 'Failed to fetch top-selling products' });
    }
    // Convert binary image data to Base64 if necessary
    results.forEach((product) => {
      if (product.productImage) {
        product.productImage = Buffer.from(product.productImage, 'binary').toString('base64');
      }
    });

    res.json(results);
  });
};

// Updated getMonthlySalesReport function with better error handling
export const getMonthlySalesReport = (req, res) => {
  const { month, year } = req.query;

  if (!month || !year) {
    return res.status(400).json({ error: 'Month and year are required' });
  }

  // This approach uses a prepared statement to ensure all products in each order are counted
  const query = `
    WITH OrderProducts AS (
      SELECT 
        o.id AS order_id,
        o.created_at,
        SUBSTRING_INDEX(SUBSTRING_INDEX(o.product_title, ',', numbers.n), ',', -1) AS product_title,
        SUBSTRING_INDEX(SUBSTRING_INDEX(o.quantity, ',', numbers.n), ',', -1) AS quantity
      FROM 
        orders o
      CROSS JOIN (
        SELECT 1 AS n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 
        UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10
      ) AS numbers
      WHERE 
        CHAR_LENGTH(o.product_title) - CHAR_LENGTH(REPLACE(o.product_title, ',', '')) >= numbers.n - 1
        AND MONTH(o.created_at) = ?
        AND YEAR(o.created_at) = ?
    )
    
    SELECT 
      p.title AS productTitle,
      p.retailPrice AS price,
      SUM(CAST(op.quantity AS UNSIGNED)) AS quantity,
      SUM(CAST(op.quantity AS UNSIGNED) * p.retailPrice) AS total
    FROM 
      OrderProducts op
    JOIN 
      products p ON TRIM(op.product_title) = p.title
    GROUP BY 
      p.id
    ORDER BY 
      total DESC
  `;

  db.query(query, [month, year], (err, results) => {
    if (err) {
      console.error('Error fetching sales report:', err);
      return res.status(500).json({ error: 'Failed to fetch sales report: ' + err.message });
    }
    
    // Return an empty array instead of a 404 error when no data is found
    // This makes the API more consistent and easier to handle in the frontend
    if (results.length === 0) {
      return res.json([]);
    }
    
    // Ensure all numeric values are properly formatted as numbers
    const formattedResults = results.map(item => ({
      ...item,
      quantity: parseInt(item.quantity, 10),
      price: parseFloat(item.price),
      total: parseFloat(item.total)
    }));
    
    res.json(formattedResults);
  });
};