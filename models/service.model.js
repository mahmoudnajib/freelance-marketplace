const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    category : {
        type: String,
        required : true,
        trim: true,
        enum : ["Web Developement", "Mobile Application", "Cloud Computing", "Web Security", 
            "Graphic Design", "Video Editing"],
    },
    title : {
        type : String,
        required : true,
        trim: true,
    },
    description : {
        type : String,
        required : true,
        trim: true, 
    },
    seller : {
        type : mongoose.Schema.ObjectId,
        required : true,
        ref : 'User', 
    },
    price : {
        type : Number,
        min : [0, "Price cannot be negative"],
        required : true,
    }
}); 

module.exports = mongoose.model("Service", serviceSchema);