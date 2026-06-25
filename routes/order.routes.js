const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const {verifyToken, allowedTo} = require('../middlewares/verifyToken');


router.route('/')
    .get(verifyToken, allowedTo('admin', 'buyer', 'seller'), orderController.getOrders);

router.route('/create/:id')    
    .post(verifyToken, allowedTo('buyer'), orderController.createOrder);

router.route('/:id')
    .patch(verifyToken, allowedTo('admin', 'buyer', 'seller'), orderController.updateOrder)
    .get(verifyToken, allowedTo('admin', 'buyer', 'seller'), orderController.getOrder)
    .delete(verifyToken, allowedTo('admin', 'buyer', 'seller'), orderController.deleteOrder);

module.exports = router;