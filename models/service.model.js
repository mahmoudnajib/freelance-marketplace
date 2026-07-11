const mongoose = require('mongoose');
const constants = require('../utils/constants');

const serviceSchema = new mongoose.Schema({
    title : {
        type : String,
        required : true,
        trim: true
    },
    category : {
        type: String,
        required : true,
        trim: true,
        enum : constants.CATEGORIES
    },
    description : {
        type : String,
        required : true,
        trim: true 
    },
    seller : {
        type : mongoose.Schema.ObjectId,
        required : true,
        ref : 'User' 
    },
    price : {
        type : Number,
        min : [0, "Price cannot be negative"],
        required : true,
        validate: { // more defense 
            validator: Number.isInteger,
            message: "{VALUE} is not an integer value"
        }
    },
    averageRating : {
        type: Number,
        default: 0
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    }
}); 

module.exports = mongoose.model("Service", serviceSchema);