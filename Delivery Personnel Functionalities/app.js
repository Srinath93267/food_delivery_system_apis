// Import necessary packages
const express = require('express');
const sql = require('mssql');
const jwt = require('jsonwebtoken');
require('dotenv').config();


// Initialize express app
const app = express();
app.use(express.json());

// SQL Server configuration
//const sqlConfig = {
 //   user: 'sowmya', 
 //   password: 'sowmya23', 
  //  server: 'SMILE😃', // Your SQL Server address
  //  database: 'FOOD_DELIVERY', // Your database name
   // options: {
   //     encrypt: true, // Encryption option for Azure or secure connections
   //     trustServerCertificate: true, // Use for self-signed certificates
   //     trustedConnection: true, // Use Windows Authentication
   // }
//};
const sqlConfig = require("./fooddeliveryazure.json");
const API_PREFIX = '/api/delivery/';
const jwtSecret = 'your_jwt_secret';


//const API_PREFIX = '/restaurant/';
//const jwtSecret = 'your_jwt_secret';

// Establish the SQL connection pool
//sql.connect(sqlConfig)
  //  .then(() => {
    //    console.log('Connected to the database');
    //})
    //.catch(err => {
     //   console.error('SQL Connection Error:', err);
    //});

sql.connect(sqlConfig, (err) => {
    if (err) {
        console.error('Database connection failed:', err);
    } else {
        console.log('Connected to SQL Server');
    }
});

// Protected route (middleware to verify authorization token)
const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, jwtSecret);
        req.userId = decoded.userId; // Attach user ID to the request object
        next();
    } catch (error) {
        console.error(error);
        return res.status(401).json({ message: 'Unauthorized' });
    }
};

// MANAGE DELIVERY PERSONNEL

//-create delivery personnel
app.post(API_PREFIX + 'create', async (req, res) => {
    try {
        const { Username, PasswordHash, Name, ContactDetails, VehicleType, IsAvailable } = req.body;
        const result = await sql.query`
            EXEC CREATE_DELIVERY_PERSONNEL
            @Username = ${Username},
            @PasswordHash = ${PasswordHash},
            @Name = ${Name},
            @ContactDetails = ${ContactDetails},
            @VehicleType = ${VehicleType},
            @IsAvailable = ${IsAvailable};`;
        res.status(201).json({ message: 'Delivery personnel created successfully' });
    } catch (err) {
        console.error('Error executing CreateDeliveryPersonnel:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

//-update delivery personnel
app.put(API_PREFIX + 'update', async (req, res) => {
    try {
        const { DeliveryPersonnelID, Name, ContactDetails, VehicleType, IsAvailable } = req.body;
        const result = await sql.query`
            EXEC UPDATE_DELIVERY_PERSONNEL
            @DeliveryPersonnelID = ${DeliveryPersonnelID},
            @Name = ${Name},
            @ContactDetails = ${ContactDetails},
            @VehicleType = ${VehicleType},
            @IsAvailable = ${IsAvailable};`;
        res.status(200).json({ message: 'Delivery personnel updated successfully' });
    } catch (err) {
        console.error('Error executing UpdateDeliveryPersonnel:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

//-delete delivery personnel
app.delete(API_PREFIX + 'delete', async (req, res) => {
    try {
        const { DeliveryPersonnelID } = req.body;
        const result = await sql.query`
            EXEC DELETE_DELIVERY_PERSONNEL
            @DeliveryPersonnelID = ${DeliveryPersonnelID};`;
        res.status(200).json({ message: 'Delivery personnel deleted successfully' });
    } catch (err) {
        console.error('Error executing DeleteDeliveryPersonnel:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

//-get delivery personnel
app.get(API_PREFIX + 'get', async (req, res) => {
    try {
        const { DeliveryPersonnelID } = req.query;
        const result = await sql.query`
            EXEC GET_DELIVERY_PERSONNEL
            @DeliveryPersonnelID = ${DeliveryPersonnelID};`;
        res.status(200).json(result.recordset[0]);
    } catch (err) {
        console.error('Error executing GetDeliveryPersonnel:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

//-get availability
app.get(API_PREFIX + 'availability', async (req, res) => {
    try {
        const { DeliveryPersonnelID } = req.query;
        const result = await sql.query`
            EXEC GET_AVAILABILITY_STATUS
            @DeliveryPersonnelID = ${DeliveryPersonnelID};`;
        res.status(200).json({ availabilityStatus: result.recordset[0].AvailabilityStatus });
    } catch (err) {
        console.error('Error executing GetAvailabilityStatus:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// MANAGE DLEIVERY ORDERS

//-Get delivery orders by order ID
app.get(API_PREFIX + 'order', async (req, res) => {
    try {
        const { OrderID } = req.query;  // Fetch OrderID from query params
        const result = await sql.query`
            EXEC GETDELIVERYORDERSBYORDERID
            @OrderID = ${OrderID};`;
        res.status(200).json(result.recordset);
    } catch (err) {
        console.error('Error executing GetDeliveryOrdersByOrderId:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

//-Get Delivery Orders by Delivery Personnel ID
app.get(API_PREFIX + 'personnel-orders', async (req, res) => {
    try {
        const { DeliveryPersonnelID } = req.query;  // Fetch DeliveryPersonnelID from query params
        const result = await sql.query`
            EXEC GETDELIVERYORDERSBYDELIVERYPERSONNELID
            @DeliveryPersonnelID = ${DeliveryPersonnelID};`;
        res.status(200).json(result.recordset);
    } catch (err) {
        console.error('Error executing GetDeliveryOrdersByDeliveryPersonnelid:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

//-Update Delivery Order Status
app.put(API_PREFIX + 'order-status', async (req, res) => {
    try {
        const { OrderID, OrderStatus } = req.body;  // Fetch OrderID and Status from request body
        const result = await sql.query`
            EXEC UPDATEDELIVERYORDERSTATUS
            @OrderID = ${OrderID},
            @OrderStatus = ${OrderStatus};`;
        res.status(200).json({ message: 'Order status updated successfully' });
    } catch (err) {
        console.error('Error executing UpdateDeliveryOrderStatus:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Port Number
const PORT = process.env.PORT || 3000;

// Server Setup
app.listen(PORT, console.log(
    `Server started on port ${PORT}`));