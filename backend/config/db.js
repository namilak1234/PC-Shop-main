// Import the mysql2 library for MySQL database connection
import mysql from 'mysql2';
// Import the dotenv library to load environment variables from a .env file
import dotenv from 'dotenv';

// Load environment variables from the .env file
dotenv.config();

// Create a MySQL database connection using environment variables
const db = mysql.createConnection({
  host: process.env.DB_HOST,       // Database host
  user: process.env.DB_USER,       // Database user
  password: process.env.DB_PASS,   // Database password
  database: process.env.DB_NAME,   // Database name
});

// Connect to the MySQL database
db.connect((err) => {
  if (err) {
    // Log an error message if the connection fails
    console.error('Database connection failed:', err);
    return;
  }
  // Log a success message if the connection is successful
  console.log('MySQL Connected Successfully');
});

// Function to create necessary tables in the database
const createTables = () => {
  // SQL query to create the 'users' table if it does not exist
  const createTableQuery = `
  CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,  
    email VARCHAR(100) NOT NULL UNIQUE, 
    password VARCHAR(255) NOT NULL,     
    isBlocked BOOLEAN DEFAULT FALSE,    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 

  )`;
  
  // SQL query to create the 'products' table if it does not exist
  const createProductsTableQuery = `
  CREATE TABLE IF NOT EXISTS products (
    id INT PRIMARY KEY AUTO_INCREMENT,  
    title VARCHAR(255) NOT NULL,        
    category VARCHAR(255) NOT NULL,     
    supplyPrice DECIMAL(10, 2) NOT NULL,
    retailPrice DECIMAL(10, 2) NOT NULL,
    availableQuantity INT NOT NULL,     
    supplier VARCHAR(255) NOT NULL,     
    image1 MEDIUMTEXT,
    image2 MEDIUMTEXT,
    image3 MEDIUMTEXT,
    image4 MEDIUMTEXT,    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
  )`;
  
  // SQL query to create the 'cart' table if it does not exist
  const createCartTableQuery = `
  CREATE TABLE IF NOT EXISTS carts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (product_id) REFERENCES products(id),
  UNIQUE KEY unique_cart_item (user_id, product_id)
)
  `;

  // SQL query to create the 'orders' table if it does not exist
  const createOrdersTableQuery = `
  CREATE TABLE IF NOT EXISTS orders (
    id CHAR(6) PRIMARY KEY,
    user_id INT NOT NULL,
    product_title VARCHAR(255) NOT NULL,
    quantity VARCHAR(225) NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    receivedToSupplier BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`;

  // SQL query to create the 'slides_data' table if it does not exist
  const createSlidesDataTableQuery = `
  CREATE TABLE IF NOT EXISTS slides (
  id INT AUTO_INCREMENT PRIMARY KEY,
  icon TEXT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  image MEDIUMTEXT NOT NULL,
  alt VARCHAR(255)
)`;

  // SQL query to create the 'delivery_details' table if it does not exist
  const createDeliveryDetailsTableQuery = `
  CREATE TABLE IF NOT EXISTS delivery_details (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  fullName VARCHAR(255) NOT NULL,
  streetAddress VARCHAR(255) NOT NULL,
  apartment VARCHAR(255),
  city VARCHAR(255) NOT NULL,
  phoneNumber VARCHAR(20) NOT NULL,
  email VARCHAR(100) NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
)
`;

  // Execute the query to create the 'users' table
  db.query(createTableQuery, (err) => {
    if (err) {
      // Log an error message if the table creation fails
      console.error('Table creation failed:', err);
    } else {
      // Log a success message if the table is created or already exists
      console.log('MySQL User Table Checked');

      // Add the 'role' column to the 'users' table
      const alterUsersTableQuery = `
        ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(255) NOT NULL DEFAULT 'user'
      `;
      db.query(alterUsersTableQuery, (err) => {
        if (err) {
          // Log an error message if the column addition fails
          console.error('Failed to add role column:', err);
        } else {
          // Log a success message if the column is added successfully
          console.log('Role column added to users table');
        }
      });
    }
  });

  // Execute the query to create the 'products' table
  db.query(createProductsTableQuery, (err) => {
    if (err) {
      // Log an error message if the table creation fails
      console.error('Products table creation failed:', err);
    } else {
      // Log a success message if the table is created or already exists
      console.log('MySQL Products Table Checked');
    }
  });

  // Execute the query to create the 'cart' table
  db.query(createCartTableQuery, (err) => {
    if (err) {
      // Log an error message if the table creation fails
      console.error('Cart table creation failed:', err);
    } else {
      // Log a success message if the table is created or already exists
      console.log('MySQL Cart Table Checked');
    }
  });

  // Execute the query to create the 'orders' table
  db.query(createOrdersTableQuery, (err) => {
    if (err) {
      console.error('Orders table creation failed:', err);
    } else {
      console.log('MySQL Orders Table Checked');
    }
  });

  // Execute the query to create the 'slides_data' table
  db.query(createSlidesDataTableQuery, (err) => {
    if (err) {
      console.error('Slides table creation failed:', err);
    } else {
      console.log('MySQL Slides Table Checked');
    }
  });

  // Execute the query to create the 'delivery_details' table
  db.query(createDeliveryDetailsTableQuery, (err) => {
    if (err) {
      console.error('Delivery details table creation failed:', err);
    } else {
      console.log('MySQL Delivery Details Table Checked');
    }
  });
};

// Export the database connection and the createTables function
export { db, createTables };