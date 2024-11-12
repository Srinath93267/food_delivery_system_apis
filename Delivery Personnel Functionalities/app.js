// Import necessary packages
const express = require('express');
const sql = require('mssql');
const jwt = require('jsonwebtoken');
require('dotenv').config();


// Initialize express app
const app = express();
app.use(express.json());

// SQL Server configuration
const sqlConfig = {
    user: '', 
    password: '', 
    server: 'SMILE😃', // Your SQL Server address
    database: 'FOOD_DELIVERY', // Your database name
    options: {
        encrypt: true, // Encryption option for Azure or secure connections
        trustServerCertificate: true, // Use for self-signed certificates
        trustedConnection: true, // Use Windows Authentication
    }
};
const API_PREFIX = '/restaurant/';
const jwtSecret = 'your_jwt_secret';

//const sqlConfig = require("./fooddeliveryazure.json");
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

//const API_PREFIX = '/api/delivery/';

// MANAGE DELIVERY PERSONNEL

//-create delivery personnel
app.post(API_PREFIX + 'create', async (req, res) => {
    try {
        const { Username, PasswordHash, Name, ContactDetails, VehicleType, IsAvailable } = req.body;
        const result = await sql.query`
            EXEC CreateDeliveryPersonnel
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
            EXEC UpdateDeliveryPersonnel
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
            EXEC DeleteDeliveryPersonnel
            @DeliveryPersonnelID = ${DeliveryPersonnelID};`;
        res.status(200).json({ message: 'Delivery personnel deleted successfully' });
    } catch (err) {
        console.error('Error executing DeleteDeliveryPersonnel:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

//-get delivery personnel by ID
app.get(API_PREFIX + 'get', async (req, res) => {
    try {
        const { DeliveryPersonnelID } = req.query;
        const result = await sql.query`
            EXEC GetDeliveryPersonnel
            @DeliveryPersonnelID = ${DeliveryPersonnelID};`;
        res.status(200).json(result.recordset[0]);
    } catch (err) {
        console.error('Error executing GetDeliveryPersonnel:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

//-get availability by ID
app.get(API_PREFIX + 'availability', async (req, res) => {
    try {
        const { DeliveryPersonnelID } = req.query;
        const result = await sql.query`
            EXEC GetAvailabilityStatus
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
            EXEC GetDeliveryOrdersByOrderId
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
            EXEC GetDeliveryOrdersByDeliveryPersonnelid
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
        const { OrderID, Status } = req.body;  // Fetch OrderID and Status from request body
        const result = await sql.query`
            EXEC UpdateDeliveryOrderStatus
            @OrderID = ${OrderID},
            @Status = ${Status};`;
        res.status(200).json({ message: 'Order status updated successfully' });
    } catch (err) {
        console.error('Error executing UpdateDeliveryOrderStatus:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

//-Get Delivery Order Status
app.get(API_PREFIX + 'order-status', async (req, res) => {
    try {
        const { OrderID } = req.query;  // Fetch OrderID from query params
        const result = await sql.query`
            EXEC GetDeliveryOrderStatus
            @OrderID = ${OrderID};`;
        res.status(200).json({ orderStatus: result.recordset[0].OrderStatus });
    } catch (err) {
        console.error('Error executing GetDeliveryOrderStatus:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Port Number
const PORT = process.env.PORT || 3000;

// Server Setup
app.listen(PORT, console.log(
    `Server started on port ${PORT}`));