// Requiring module
const express = require('express');
const bodyParser = require('body-parser');
const sql = require('mssql');
const jwt = require('jsonwebtoken'); // For generating authentication tokens

// Creating express object
const app = express();
app.use(bodyParser.json())

// SQL Server Configuration
const sqlConfig = require("./fooddeliveryazure.json");
const API_PREFIX = '/restaurant/';
const API_PREFIX_2 = '/api/delivery/';

const jwtSecret = 'your_jwt_secret';

// Connect to SQL Server
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

// LOGIN RESTAURANT MANAGER

app.get(API_PREFIX + 'login-restaurant-manager', async (req, res) => {
    try {
        const { restaurantname, username, password } = req.body;
        const result = await sql.query`EXEC GET_RESTAURANT_MANAGER @RestaurantName=${restaurantname}, @UserName=${username}, @Password=${password};`;
        const ifexists = JSON.stringify(result.recordset)[10];
        if (ifexists === "1") {
            // Generating JWT token
            const token = jwt.sign({ username: username }, jwtSecret);
            res.status(200).json({ token: token });
        }
        else {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (err) {
        console.error('Error executing query:', err);
        res.status(500).send('Server error');
    }
});

// MANAGE ORDERS

app.get(API_PREFIX + 'get-orders-by-restaurant-id/:restaurantid', verifyToken, async (req, res) => {
    try {
        const restaurantid = req.params['restaurantid']
        const result = await sql.query`EXEC GETORDERSBYRESTAURANTID @RestaurantID=${restaurantid};`;
        res.json(200, result.recordset); // Send the result set as JSON
    } catch (err) {
        console.error('Error executing query:', err);
        res.status(500).send('Server error');
    }
});

app.get(API_PREFIX + 'get-orders-by-restaurant-and-zone-id/:restaurantid', verifyToken, async (req, res) => {
    try {
        const { zoneid } = req.body;
        const restaurantid = req.params['restaurantid']
        const result = await sql.query`EXEC GETORDERSBYRESTAURANTZONEID @RestaurantID=${restaurantid}, @ZoneID=${zoneid};`;
        res.json(200, result.recordset); // Send the result set as JSON
    } catch (err) {
        console.error('Error executing query:', err);
        res.status(500).send('Server error');
    }
});

app.get(API_PREFIX + 'get-orders-by-order-id/:orderid', verifyToken, async (req, res) => {
    try {
        const orderid = req.params['orderid']
        const result = await sql.query`EXEC GETORDERSBYORDERID @OrderID=${orderid};`;
        res.json(200, result.recordset); // Send the result set as JSON
    } catch (err) {
        console.error('Error executing query:', err);
        res.status(500).send('Server error');
    }
});

app.patch(API_PREFIX + 'update-orders-by-order-id', verifyToken, async (req, res) => {
    try {
        const { orderid, totalamount, deliveryaddress, deliveryfee, paymentmethod, orderstatus, notes } = req.body;
        const result = await sql.query`EXEC UPDATEORDERSBYORDERID @OrderID=${orderid}, 
                                                                  @TotalAmount=${totalamount},
                                                                  @DeliveryAddress=${deliveryaddress},
                                                                  @DeliveryFee=${deliveryfee},
                                                                  @PaymentMethod=${paymentmethod},
                                                                  @OrderStatus=${orderstatus},
                                                                  @Notes=${notes};`;
        res.json(200, result.recordset); // Send the result set as JSON
    } catch (err) {
        console.error('Error executing query:', err);
        res.status(500).send('Server error');
    }
});

// MANAGE RESTAURANT MENU

app.get(API_PREFIX + 'get-menu', verifyToken, async (req, res) => {
    try {
        const result = await sql.query`EXEC GETMENU`;
        res.json(result.recordset); // Send the result set as JSON
    } catch (err) {
        console.error('Error executing query:', err);
        res.status(500).send('Server error');
    }
});

app.get(API_PREFIX + 'get-menu/:restaurantid', verifyToken, async (req, res) => {
    try {
        const restaurantid = req.params['restaurantid'];
        const result = await sql.query`EXEC GETMENUBYRESTAURANTID @RestaurantID=${restaurantid}`;
        res.json(result.recordset); // Send the result set as JSON
    } catch (err) {
        console.error('Error executing query:', err);
        res.status(500).send('Server error');
    }
});

app.put(API_PREFIX + 'add-food-item', verifyToken, async (req, res) => {
    const { restaurantid, foodname, price, type } = req.body;
    try {
        const query = `EXEC ADDFOODITEM @RestaurantID=${restaurantid}, 
                                        @FoodName = '${foodname}', 
                                        @Price=${price}, 
                                        @Type='${type}'`;
        const result = await sql.query(query);
        res.json(200);
    } catch (err) {
        console.error('Error executing query:', err);
        res.status(500).send('Server error');
    }
});

app.delete(API_PREFIX + 'delete-food-item', verifyToken, async (req, res) => {
    const { restaurantid, foodid } = req.body;
    try {
        const query = `EXEC REMOVEFOODITEMBYID @FoodID=${foodid}, 
                                        @RestaurantID = '${restaurantid}'`;
        const result = await sql.query(query);
        res.json(200);
    } catch (err) {
        console.error('Error executing query:', err);
        res.status(500).send('Server error');
    }
});

app.patch(API_PREFIX + 'update-food-item', verifyToken, async (req, res) => {
    const { restaurantid, foodid, foodname, price, type, availability } = req.body;
    try {
        const result = await sql.query`EXEC UPDATEMENU @RestaurantID=${restaurantid},
                                        @FoodID=${foodid}, 
                                        @FoodName = ${foodname}, 
                                        @Price=${price}, 
                                        @Type=${type},
                                        @Availability=${availability}`;
        res.json(200, result.recordset);
    } catch (err) {
        console.error('Error executing query:', err);
        res.status(500).send('Server error');
    }
});

// MANAGE RESTAURANT PROFILE

app.get(API_PREFIX + 'get-restaurant-profile-by-restaurant-id/:restaurantid', verifyToken, async (req, res) => {
    try {
        const restaurantid = req.params['restaurantid'];
        const result = await sql.query`EXEC GETRESTAURANTDETAILBYID @RestaurantID = ${restaurantid}`;
        res.json(200, result.recordset); // Send the result set as JSON
    } catch (err) {
        console.error('Error executing query:', err);
        res.status(500).send('Server error');
    }
});

app.put(API_PREFIX + 'create-restaurant-profile', async (req, res) => {
    try {
        const { restaurantname, mainphone } = req.body;
        const query = `EXEC CREATERESTAURANTDETAIL @RestaurantName='${restaurantname}', 
                                        @MainPhone=${mainphone}`;
        const result = await sql.query(query);
        res.json(200, result.recordset);
    } catch (err) {
        console.error('Error executing query:', err);
        res.status(500).send('Server error');
    }
});

app.delete(API_PREFIX + 'delete-restaurant-profile-by-restaurant-id/:restaurantid', verifyToken, async (req, res) => {
    try {
        const restaurantid = req.params['restaurantid']
        const result = await sql.query`EXEC DELETERESTAURANTDETAILBYID @RestaurantID = ${restaurantid}`;
        res.json(200); // Send the result set as JSON
    } catch (err) {
        console.error('Error executing query:', err);
        res.status(500).send('Server error');
    }
});

app.patch(API_PREFIX + 'update-restaurant-profile-by-restaurant-id/:restaurantid', verifyToken, async (req, res) => {
    try {
        const restaurantid = req.params['restaurantid']
        const { restaurantname, mainphone } = req.body;
        const result = await sql.query`EXEC UPDATERESTAURANTDETAILBYID @RestaurantID = ${restaurantid}, 
                                                                        @RestaurantName=${restaurantname}, 
                                                                        @MainPhone=${mainphone}`;
        res.json(200, result.recordset); // Send the result set as JSON
    } catch (err) {
        console.error('Error executing query:', err);
        res.status(500).send('Server error');
    }
});

//MANAGE ZONES

app.get(API_PREFIX + 'get-a-zone-detail/:restaurantid', verifyToken, async (req, res) => {
    try {
        const restaurantid = req.params['restaurantid'];
        const { zoneid } = req.body;
        const result = await sql.query`EXEC GETRESTAURANTZONEDETAILBYID @ZoneID=${zoneid}, @RestaurantID = ${restaurantid}`;
        res.json(200, result.recordset); // Send the result set as JSON
    } catch (err) {
        console.error('Error executing query:', err);
        res.status(500).send('Server error');
    }
});

app.put(API_PREFIX + 'add-a-zone-detail/:restaurantid', verifyToken, async (req, res) => {
    try {
        const restaurantid = req.params['restaurantid'];
        const { zonename, zonecity, phone } = req.body;

        const result = await sql.query`EXEC CREATERESTAURANTZONEDETAIL @RestaurantID=${restaurantid},
                                                                       @ZoneName=${zonename}, 
                                                                       @ZoneCity=${zonecity},
                                                                       @Phone=${phone};`;
        res.json(200, result.recordset); // Send the result set as JSON
    } catch (err) {
        console.error('Error executing query:', err);
        res.status(500).send('Server error');
    }
});

app.patch(API_PREFIX + 'update-a-zone-detail/:restaurantid', verifyToken, async (req, res) => {
    try {
        const restaurantid = req.params['restaurantid']
        const { zoneid, zonename, zonecity, zoneaddress, openingtime, closingtime, phone, status } = req.body;
        const result = await sql.query`EXEC UPDATERESTAURANTZONEDETAILBYID @ZoneID=${zoneid}, 
                                                                           @RestaurantID=${restaurantid}, 
                                                                           @ZoneName=${zonename}, 
                                                                           @ZoneCity = ${zonecity},
                                                                           @ZoneAddress = ${zoneaddress},
                                                                           @OpeningTime = ${openingtime},
                                                                           @ClosingTime = ${closingtime},
                                                                           @Phone = ${phone},
                                                                           @Status = ${status};`;
        res.json(200, result.recordset); // Send the result set as JSON
    } catch (err) {
        console.error('Error executing query:', err);
        res.status(500).send('Server error');
    }
});

app.delete(API_PREFIX + 'delete-a-zone-detail/:restaurantid', verifyToken, async (req, res) => {
    try {
        const restaurantid = req.params['restaurantid'];
        const { zoneid } = req.body;
        const result = await sql.query`EXEC DELETERESTAURANTZONEDETAILBYID @ZoneID=${zoneid}, @RestaurantID = ${restaurantid}`;
        res.json(200); // Send the result set as JSON
    } catch (err) {
        console.error('Error executing query:', err);
        res.status(500).send('Server error');
    }
});


// MANAGE RESTAURANT MANAGER DETAILS

app.put(API_PREFIX + 'create-restaurant-manager-detail', async (req, res) => {
    try {
        const { restaurantid, username, password } = req.body;
        console.log(restaurantid, username, password);
        const query = `EXEC CREATE_RESTAURANT_MANAGER @RestaurantID=${restaurantid}, @UserName='${username}', @Password = '${password}';`
        const result = await sql.query(query);
        res.json(200, result.recordset); // Send the result set as JSON
    } catch (err) {
        console.error('Error executing query:', err);
        res.status(500).send('Server error');
    }
});

app.delete(API_PREFIX + 'delete-restaurant-manager-detail', verifyToken, async (req, res) => {
    try {
        const { userid, restaurantid, username, password } = req.body;
        console.log(restaurantid, username, password);
        const query = `EXEC DELETE_RESTAURANT_MANAGER @UserID=${userid}, @RestaurantID=${restaurantid}, @UserName='${username}', @Password = '${password}';`
        const result = await sql.query(query);
        res.json(200, result.recordset); // Send the result set as JSON
    } catch (err) {
        console.error('Error executing query:', err);
        res.status(500).send('Server error');
    }
});

app.patch(API_PREFIX + 'update-restaurant-manager-detail', verifyToken, async (req, res) => {
    try {
        const { userid, restaurantid, username, password } = req.body;
        console.log(restaurantid, username, password);
        if (username == undefined && password != undefined) {
            const query = `EXEC UPDATE_RESTAURANT_MANAGER @UserID=${userid}, @RestaurantID=${restaurantid}, @Password = ${password};`
            const result = await sql.query(query);
            res.status(200).json(result.recordset); // Send the result set as JSON
        }
        else if (username != undefined && password == undefined) {
            const query = `EXEC UPDATE_RESTAURANT_MANAGER @UserID=${userid}, @RestaurantID=${restaurantid}, @UserName = ${username};`
            const result = await sql.query(query);
            res.status(200).json(result.recordset); // Send the result set as JSON
        }
        else if (username != undefined && password != undefined) {
            const query = `EXEC UPDATE_RESTAURANT_MANAGER @UserID=${userid}, @RestaurantID=${restaurantid}, @UserName = ${username}, @Password = ${password};`
            const result = await sql.query(query);
            res.status(200).json(result.recordset); // Send the result set as JSON
        }
        else {
            res.status(400).json("An Error Occured");
        }
    } catch (err) {
        console.error('Error executing query:', err);
        res.status(500).send('Server error');
    }
});

//#endregion

//#region Delivery Personnel Feature

// MANAGE DELIVERY PERSONNEL

//-create delivery personnel
app.post(API_PREFIX_2 + 'create', async (req, res) => {
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
app.put(API_PREFIX_2 + 'update', async (req, res) => {
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
app.delete(API_PREFIX_2 + 'delete', async (req, res) => {
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
app.get(API_PREFIX_2 + 'get', async (req, res) => {
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
app.get(API_PREFIX_2 + 'availability', async (req, res) => {
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
app.get(API_PREFIX_2 + 'order', async (req, res) => {
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
app.get(API_PREFIX_2 + 'personnel-orders', async (req, res) => {
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
app.put(API_PREFIX_2 + 'order-status', async (req, res) => {
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

//#endregion

// Port Number
const PORT = process.env.PORT || 5000;

// Server Setup
app.listen(PORT, console.log(
    `Server started on port ${PORT}`));