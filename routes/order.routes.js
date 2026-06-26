const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const {verifyToken, allowedTo} = require('../middlewares/verifyToken');


router.route('/')
    .get(verifyToken, allowedTo('admin', 'buyer', 'seller'), orderController.getOrders);

router.route('/:id')
    .get(verifyToken, allowedTo('admin', 'buyer', 'seller'), orderController.getOrder)
    .post(verifyToken, allowedTo('buyer'), orderController.createOrder)
    .patch(verifyToken, allowedTo('buyer', 'seller'), orderController.updateOrder)
    .delete(verifyToken, allowedTo('admin', 'buyer', 'seller'), orderController.deleteOrder);

module.exports = router;