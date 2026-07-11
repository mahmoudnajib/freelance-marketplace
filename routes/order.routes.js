const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const {verifyToken, allowedTo} = require('../middlewares/verifyToken');

const validator = require('../middlewares/validator.middleware');
const {createOrderSchema, updateOrderSchema }= require('../validators/orderSchema');


router.route('/')
    .get(verifyToken, allowedTo('admin', 'buyer', 'seller'), orderController.getOrders)
    .post(verifyToken, allowedTo('buyer'), validator(createOrderSchema), orderController.createOrder);

router.route('/:id')
    .get(verifyToken, allowedTo('admin', 'buyer', 'seller'), orderController.getOrder)
    .patch(verifyToken, allowedTo('buyer', 'seller'), validator(updateOrderSchema), orderController.updateOrder)
    .delete(verifyToken, allowedTo('admin', 'buyer', 'seller'), orderController.deleteOrder);

module.exports = router;