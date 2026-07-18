require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');


const url = process.env.DATABASE_URL;
const port = process.env.PORT || 4000;

const statusText = require('./utils/statusText');
const appError = require('./utils/appError');


mongoose.connect(url)
.then(()=>{
    console.log("Database connected successfully");
        app.listen(port, ()=>{
            console.log(`listening on port ${port}`);
        });
    })
    .catch((err)=>{
        console.error("Database connection failed", err.message);
    });

app.use(express.json());

app.use(cors());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


const usersRouter = require('./routes/user.routes');
app.use('/api/users', usersRouter);

const serviceRouter = require('./routes/service.routes');
app.use('/api/services', serviceRouter);

const orderRouter = require('./routes/order.routes');
app.use('/api/orders', orderRouter);

const reviewRouter = require('./routes/review.routes');
app.use('/api/reviews', reviewRouter);

const walletRouter = require('./routes/wallet.routes');
app.use('/api/wallet', walletRouter);


const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const yaml = require('yaml');

const swaggerFileRaw = fs.readFileSync(path.join(__dirname, 'swagger.json'), 'utf8');
const swaggerDocument = yaml.parse(swaggerFileRaw);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


app.use((req, res, next) =>{
    const error = new appError(`Can't find ${req.originalUrl} on this server`, 404, statusText.FAIL);
    return next(error);
});

// global error handler
app.use((error, req, res, next)=>{ 

    const statusCode = error.statusCode || 500;
    const status = error.statusText || statusText.ERROR;

    res.status(statusCode).json({
        status,
        data: null,
        message: error.message || "Internal Server Error"
    });
});




