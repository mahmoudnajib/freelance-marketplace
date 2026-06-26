const mongoose = require("mongoose");
    const userSchema = new mongoose.Schema({
    firstName : {
        type: String,
        required: true,
        trim: true,
    },
    lastName : {
        type: String,
        required: true,
        trim: true,
    },
    age : {
        type: Number,
        required: true,
        min: [1, "age cannot be negative"],
    },
    email : {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password : {
        type: String,
        required: true,
    },
    role : {
        type: String,       
        enum: ["admin" ,"seller", "buyer"],
        default: "buyer",
    },
    avatar : {
        type: String,
        default: "/uploads/picture.jpg",
    }
});

module.exports = mongoose.model("User", userSchema);