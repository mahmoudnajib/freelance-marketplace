const Review = require('../models/review.model');
const Order = require('../models/order.model');
const statusText = require('../utils/statusText');
const appError = require('../middlewares/appError');
const asyncWrapper = require('../utils/asyncWrapper');

const createReview = asyncWrapper (async (req, res, next)=>{
    
    const buyerId = req.userData.id;

    const {seller, service, order, comment, rating} = req.body;
    
    const targetOrder = await Order.findById(order);
    
    if (!targetOrder) {
        const error = new appError("Order not found", 404, statusText.FAIL);
        return next(error);
    }

    if (targetOrder.status !== 'completed' || targetOrder.buyer.toString() !== buyerId){
        const error = new appError("Order cannot be reviewd", 404, statusText.FAIL);
        return next(error);
    }

    const newReview = new Review({
        buyer: buyerId,
        seller, 
        service, 
        order, 
        comment, 
        rating
    });
    await newReview.save();

    res.status(201).json({status: statusText.SUCCESS, data: {newReview} });
});


const getReviews = asyncWrapper (async (req, res, next)=>{

    const {serviceId, sellerId} = req.query;

    const filter = {};
    if(serviceId)
        filter.service = serviceId;
    
    if(sellerId)
        filter.seller = sellerId;

    const reviews = await Review.find(filter, {__v: 0})
            .populate('seller', 'firstName lastName avatar')
            .populate('buyer', 'firstName lastName avatar')
            .populate('service', 'title price')  
            
    res.json({status: statusText.SUCCESS, data: {reviews}});


});


const getReview = asyncWrapper (async (req, res, next)=>{

    const reviewId = req.params.id;
    const review = await Review.findById(reviewId, {__v: 0})
        .populate('seller', 'firstName lastName avatar')
        .populate('buyer', 'firstName lastName avatar')
        .populate('service', 'title price');  
             
        if (!review){
            const error = new appError("Review not found", 404, statusText.FAIL);
            return next(error);
        }
        res.json({status: statusText.SUCCESS, data: {review}});
});


const updateReview = asyncWrapper (async (req, res, next)=>{
    const reviewId = req.params.id;
    const buyerId = req.userData.id;
    const reviewRating = req.body.rating;
    const reviewComment = req.body.comment;


    const review = await Review.findById(reviewId, {__v: 0});
    if (!review){
        const error = new appError("Review not found", 404, statusText.FAIL);
        return next(error);
    }

    if (buyerId === review.buyer.toString()){
        const updatedReview = await Review.findByIdAndUpdate(
            reviewId,
            {rating: reviewRating, comment: reviewComment},
            {new: true, runValidators: true}
        );

        res.json({status: statusText.SUCCESS, data: {updatedReview}});
    
    } else {
        const error = new appError("Not allowed", 403, statusText.FAIL);
        return next(error);
    }
});

const deleteReview = asyncWrapper (async (req, res, next)=>{
    const reviewId = req.params.id;
    const buyerId = req.userData.id;
    const userRole = req.userData.role;

    const review = await Review.findById(reviewId);
    if (!review){
        const error = new appError("Review not found", 404, statusText.FAIL);
        return next(error);
    }

    if (buyerId === review.buyer.toString() || userRole === 'admin'){
        await Review.findByIdAndDelete(reviewId);

        res.json({status: statusText.SUCCESS, data: null});
    
    } else {
        const error = new appError("Not allowed", 403, statusText.FAIL);
        return next(error);
    }
}); 

module.exports = {
    createReview,
    getReviews,
    getReview,
    updateReview,
    deleteReview
};
