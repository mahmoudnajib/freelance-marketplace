const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({

    buyer: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    service: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Service'
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Order'
    },
    comment:{
        type: String,
        required: false
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
},    
    { timestamps: true});
    
module.exports = mongoose.model('Review', reviewSchema);