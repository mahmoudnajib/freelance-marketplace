const Order = require('../models/order.model');
const Service = require('../models/service.model');
const asyncWrapper = require('../utils/asyncWrapper');
const statusText = require('../utils/statusText');
const appError = require('../utils/appError');
const paymentService = require("../services/wallet.service"); 

const createOrder = asyncWrapper ( async (req, res, next)=>{

    const serviceId = req.body.service;
    const service = await Service.findById(serviceId); 
    
    if (!service){
        const error = new appError("Service is not available", 404, statusText.FAIL);
        return next(error);
    }   

    const buyerId = req.userData.id;
    const userRole = req.userData.role;
    const sellerId = service.seller.toString();

    if (userRole === 'seller'){
        const error = new appError("Sellers are not allowed to buy services", 400, statusText.FAIL);
        return next(error);
    }
    
    if (buyerId === sellerId ){
        const error = new appError("something went wrong", 400, statusText.FAIL);
        return next(error);
    }

    await paymentService.freezeFunds(buyerId, service.price);

    const orderNumber = `ORD-${Date.now()}`;
    const newOrder = new Order({
        orderNumber,
        buyer: buyerId,
        seller: sellerId,
        service: serviceId,
        price: service.price,    
    });

    await newOrder.save();

    res.status(201).json({status: statusText.SUCCESS, data: {newOrder} }); 
});

const getOrders = asyncWrapper(async (req, res, next) => {
    const userId = req.userData.id;
    const userRole = req.userData.role;

    const page = +req.query.page || 1;
    const limit = +req.query.limit || 10;
    const sanitizedPage = Math.max(page, 1); 
    const sanitizedLimit = Math.max(limit, 1);
    const skip = (sanitizedPage - 1) * sanitizedLimit;

    let filter = {};
    if (userRole !== 'admin') {
        filter = {
            $or: [
                { buyer: userId },
                { seller: userId }
            ]
        };
    }

    const [orders, totalOrders] = await Promise.all([
        Order.find(filter)
            .limit(sanitizedLimit)
            .skip(skip)
            .populate('service', 'title price') 
            .populate('buyer', 'firstName lastName') 
            .populate('seller', 'firstName lastName'),
        Order.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalOrders / sanitizedLimit);

    res.json({
        status: statusText.SUCCESS, 
        data: {
            meta: {
                totalItems: totalOrders,
                totalPages: totalPages,
                currentPage: sanitizedPage,
                limit: sanitizedLimit
            },
            orders
        }
    });
});


const getOrder = asyncWrapper (async (req, res, next) =>{

    const orderId = req.params.id;
    const userId = req.userData.id;
    const userRole = req.userData.role;
    

    const order = await Order.findById(orderId)
        .populate('service', 'title price') 
        .populate('buyer', 'firstName lastName') 
        .populate('seller', 'firstName lastName');
    
        if (!order){
        const error = new appError("Order not found", 404, statusText.FAIL);
        return next(error);
    }


    if (userRole === 'admin' || userId === order.buyer._id.toString() || userId === order.seller._id.toString()){
        res.json({status: statusText.SUCCESS, data: {order}});

    } else {
        const error = new appError("please sign up to have orders", 403, statusText.FAIL);
        return next(error);
    }
});

const updateOrder = asyncWrapper (async (req, res, next)=>{

    const orderId = req.params.id;
    const orderStatus = req.body.status;
    const userId = req.userData.id;
    const userRole = req.userData.role;
    
    const order = await Order.findById(orderId);

    if (!order) {
        const error = new appError("Order not found", 404, statusText.FAIL);
        return next(error);
    }

    
    if (orderStatus === "completed") {
        if (userId !== order.buyer.toString()) {
            const error = new appError("Only the buyer can complete this order", 403, statusText.FAIL);
            return next(error);
        }
        if (order.status !== "in progress") {
            const error = new appError("Order must be 'in progress' before it can be completed", 400, statusText.FAIL);
            return next(error);
        }

        await paymentService.releaseFunds(order.buyer, order.seller, order.price);
    }
    
    else if (orderStatus === "in progress") {
        if (userId !== order.seller.toString()) {
            const error = new appError("Only the seller can work on this order", 403, statusText.FAIL);
            return next(error);
        }
        if (order.status !== "pending") {
            const error = new appError("Order must be 'pending' before it can be started", 400, statusText.FAIL);
            return next(error);
        }
    }

    else if (orderStatus === "cancelled") {
        if (userId !== order.buyer.toString() && userId !== order.seller.toString() && userRole !== 'admin') {
            const error = new appError("You are not authorized to cancel this order", 403, statusText.FAIL);
            return next(error);
        }
        if (order.status === "completed") {
            const error = new appError("Cannot cancel an already completed order", 400, statusText.FAIL);
            return next(error);
        }

        await paymentService.refundFunds(order.buyer, order.price);
    }

    const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        {status: orderStatus},
        {new: true}
    );

    res.json({status: statusText.SUCCESS, data: {updatedOrder}});

});

const deleteOrder = asyncWrapper (async (req, res, next)=>{

    const orderId = req.params.id;
    const userId = req.userData.id;
    const userRole = req.userData.role;

    const order = await Order.findById(orderId)
    if (!order){
        const error = new appError("Order not found", 404, statusText.FAIL);
        return next(error);
    }

    if (userId !== order.buyer.toString() && userId !== order.seller.toString() && userRole !== 'admin'){
        const error = new appError("You are not authorized to delete this order", 403, statusText.FAIL);
        return next(error);
    }
    
    if (order.status === "pending" || order.status === "cancelled"){
        await Order.findByIdAndDelete(orderId); 
        res.json({status: statusText.SUCCESS, data: null}); 
    } else {
        const error = new appError("deleting this order now is not allowed", 403, statusText.FAIL);
        return next(error);
    }

});

module.exports = {
    createOrder,
    getOrders,
    getOrder,
    updateOrder,
    deleteOrder
};