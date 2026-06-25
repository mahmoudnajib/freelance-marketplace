require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');

const url = process.env.DATABASE_URL;
const port = process.env.PORT || 4000;

mongoose.connect(url)
    .then(()=>{
        console.log("Database connected successfully");
    })
    .catch((err)=>{
        console.error("Database connection failed", err.message);
    });

app.use(express.json());

const usersRoutes = require('./routes/user.routes');
app.use('/api/users', usersRoutes);

const serviceRoutes = require('./routes/service.routes');
app.use('/api/services', serviceRoutes);

const orderRoutes = require('./routes/order.routes');
app.use('/api/orders', orderRoutes);

app.listen(port, ()=>{
    console.log(`listening on port ${port}`);
});