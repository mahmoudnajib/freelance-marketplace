const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({

    orderNumber: {
        type: String,
        required: true,
        unique: true
    },
    buyer: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    service: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Service"
    },
    price: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'in progress', 'completed', 'cancelled'],
        default: "pending"
    }
},
    {timestamps: true}
);

module.exports = mongoose.model("Order", orderSchema);