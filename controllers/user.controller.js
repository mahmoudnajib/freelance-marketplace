const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('../utils/generateToken');
const statusText = require('../utils/statusText');
const appError = require('../middlewares/appError');
const asyncWrapper = require('../utils/asyncWrapper');



const getUsers = asyncWrapper (async (req, res, next)=>{
    const users = await User.find({}, {_id: 0, __v: 0, password: 0}); 
    res.json({status: statusText.SUCCESS, data: {users}});
});

const register = asyncWrapper (async (req, res, next)=>{
    const {firstName, lastName, age, email: clientEmail, password: clientPassword, role, avatar} = req.body;
    
    const oldUser = await User.findOne({email: clientEmail});
    if (oldUser){
        const error  = new appError("User is alreay registered", 400, statusText.FAIL);
        return next(error);
    }

    const hashedPassword = await bcrypt.hash(clientPassword, 10);

    const newUser = new User({
        firstName, 
        lastName, 
        age, 
        email: clientEmail, 
        password: hashedPassword,
        role,
        avatar
    });

    const token = jwt.generateToken({id: newUser._id, email: newUser.email, role: newUser.role});

    await newUser.save();
    res.status(201).json({status: statusText.SUCCESS, data: {user: newUser, token: token} });    
});

const login = asyncWrapper (async (req, res, next)=>{

    const {email: clientEmail, password: clientPassword} = req.body;
    if (!clientEmail || !clientPassword){
        const error = new appError("Email and password are required", 400, statusText.FAIL);
        return next(error);
    }

    const user = await User.findOne({email: clientEmail});
    if (!user){
        const error = new appError("User not found", 400, statusText.FAIL);
        return next(error);
    }

    const matchedPassword = await bcrypt.compare(clientPassword, user.password);

    if (user && matchedPassword){
        const token = jwt.generateToken({id: user._id, email: user.email, role: user.role});
        res.json({status: statusText.SUCCESS, data: {user, token} });    
    }
    else {
        const error = new appError("check email or password again", 400, statusText.FAIL);
        return next(error);
    }
});

module.exports = {
    getUsers,    
    register,
    login
};