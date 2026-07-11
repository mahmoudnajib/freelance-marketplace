const Service = require('../models/service.model');
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({

    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    comment:{
        type: String,
        required: false
    },
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
},    
    { timestamps: true});
    
reviewSchema.statics.calculateAverageRatings = async function(serviceId) {
    
    const stats = await this.aggregate([
        {
            $match: { service: serviceId } 
        },
        {
            $group: {
                _id: '$service',
                nRating: { $sum: 1 }, // nom of Reviews
                avgRating: { $avg: '$rating' }  
            }
        }
    ]);

    if (stats.length > 0) {
        await Service.findByIdAndUpdate(serviceId, {
            ratingsQuantity: stats[0].nRating,
            averageRating: stats[0].avgRating
        });
    
    } else {
        await Service.findByIdAndUpdate(serviceId, {
            ratingsQuantity: 0,
            averageRating: 0
        });
    }
};


reviewSchema.post('save', function() {
    this.constructor.calculateAverageRatings(this.service);
});

module.exports = mongoose.model('Review', reviewSchema);