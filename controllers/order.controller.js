const Order = require('../models/order.model');
const Service = require('../models/service.model');
const asyncWrapper = require('../utils/asyncWrapper');
const statusText = require('../utils/statusText');
const appError = require('../middlewares/appError');


const createOrder = asyncWrapper ( async (req, res, next)=>{

    const serviceId = req.params.id;
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

    if (userRole === 'admin') {
        const orders = await Order.find({}) 
            .populate('service', 'title price') 
            .populate('buyer', 'firstName lastName') 
            .populate('seller', 'firstName lastName');

        return res.json({status: statusText.SUCCESS, data: {orders}});
    } 
    
    else {
        const orders = await Order.find({
            $or: [
                { buyer: userId },
                { seller: userId }
            ]
        })
        .populate('service', 'title price') 
        .populate('buyer', 'firstName lastName') 
        .populate('seller', 'firstName lastName');

        return res.json({ status: statusText.SUCCESS, data: { orders } });
    }
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
    }
    
    else if (orderStatus === "in progress") {
        if (userId !== order.seller.toString()) {
            const error = new appError("Only the seller can start this order", 403, statusText.FAIL);
            return next(error);
        }
    }

    else if (orderStatus === "cancelled") {
        if (userId !== order.buyer.toString() && userId !== order.seller.toString()) {
            const error = new appError("You are not authorized to cancel this order", 403, statusText.FAIL);
            return next(error);
        }
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

    const order = await Order.findById(orderId)
    if (!order){
        const error = new appError("Order not found", 404, statusText.FAIL);
        return next(error);
    }

    if (userId !== order.buyer.toString() && userId !== order.seller.toString()){
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