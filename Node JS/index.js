const express = require('express');
const sql = require('mssql');
const fs = require('fs');

// Load DB configuration from JSON file
const config = JSON.parse(fs.readFileSync('./fooddeliveryazure.json', 'utf-8'));

// Initialize Express
const app = express();
app.use(express.json());

// Database Connection
let pool;

const connectToDB = async () => {
  try {
    if (!pool) {
      pool = await sql.connect(config);
      console.log('Connected to MSSQL database');
    }
    return pool;
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
};

// Middleware for Error Handling
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  if (err instanceof sql.RequestError) {
    return res.status(500).json({ message: 'Database error', error: err.message });
  }
  res.status(500).json({ message: 'Internal server error', error: err.message });
};

// Middleware for Role-Based Access Control
const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access Denied' });

  // Dummy authentication for demo purposes
  try {
    const user = { id: 1, role: 'admin' }; // Replace with JWT verification logic
    req.user = user;
    next();
  } catch (err) {
    res.status(403).json({ message: 'Invalid token' });
  }
};

const authorizeRole = (role) => {
  return (req, res, next) => {
    if (req.user.role !== role) return res.status(403).json({ message: 'Forbidden' });
    next();
  };
};

// Admin APIs
app.post('/api/admin/users', authenticateToken, authorizeRole('admin'), async (req, res) => {
  const { role, name, email, password } = req.body;

  try {
    const pool = await connectToDB();
    const result = await pool
      .request()
      .input('role', sql.VarChar, role)
      .input('name', sql.VarChar, name)
      .input('email', sql.VarChar, email)
      .input('password', sql.VarChar, password)
      .query(`
        INSERT INTO Users (role, name, email, password)
        VALUES (@role, @name, @email, @password)
      `);

    res.status(201).json({ message: 'User created successfully', result: result.recordset });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error });
  }
});

app.put('/api/admin/users/:id', authenticateToken, authorizeRole('admin'), async (req, res) => {
  const userId = req.params.id;
  const updates = req.body;

  try {
    const pool = await connectToDB();
    const result = await pool
      .request()
      .input('userId', sql.Int, userId)
      .input('name', sql.VarChar, updates.name)
      .input('email', sql.VarChar, updates.email)
      .query(`
        UPDATE Users
        SET name = @name, email = @email
        WHERE id = @userId
      `);

    if (result.rowsAffected[0] === 0) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ message: 'User updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error });
  }
});

app.get('/api/admin/orders', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const pool = await connectToDB();
    const result = await pool
      .request()
      .query(`
        SELECT Orders.*, Restaurants.name AS restaurantName, Users.name AS customerName
        FROM Orders
        INNER JOIN Restaurants ON Orders.restaurantId = Restaurants.id
        INNER JOIN Users ON Orders.customerId = Users.id
      `);

    res.status(200).json({ orders: result.recordset });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error });
  }
});

app.get('/api/admin/reports', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const pool = await connectToDB();

    const report = {
      totalUsers: (await pool.request().query('SELECT COUNT(*) AS count FROM Users')).recordset[0].count,
      totalOrders: (await pool.request().query('SELECT COUNT(*) AS count FROM Orders')).recordset[0].count,
    };

    res.status(200).json({ report });
  } catch (error) {
    res.status(500).json({ message: 'Error generating report', error });
  }
});

// Error Handling Middleware
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
