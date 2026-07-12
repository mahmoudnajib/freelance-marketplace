const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('../utils/generateToken');
const statusText = require('../utils/statusText');
const appError = require('../utils/appError');
const asyncWrapper = require('../utils/asyncWrapper');


const register = asyncWrapper (async (req, res, next)=>{

    const {firstName, lastName, age, email, password, role, adminKey} = req.body;
    
    const oldUser = await User.findOne({email});
    if (oldUser){
        const error  = new appError("User is alreay registered", 400, statusText.FAIL);
        return next(error);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    if (role === 'admin' && (!adminKey || adminKey !== process.env.ADMIN_SECRET_KEY) ){
        const error = new appError("Invalid, could not register as an Admin", 403, statusText.FAIL);
        return next(error);
    }

    const newUser = new User({
        firstName, 
        lastName, 
        age, 
        email,
        password: hashedPassword,
        role
    });
    await newUser.save();

    const userResponse = newUser.toObject();
        delete userResponse.password;
        delete userResponse.__v;

    const token = jwt.generateToken({id: newUser._id, email: newUser.email, role: newUser.role});

    res.json({status: statusText.SUCCESS, data: {user: userResponse, token: token} });    
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
    
        const userResponse = user.toObject();
        delete userResponse.password;
        delete userResponse.__v;
        
        res.json({status: statusText.SUCCESS, data: {user: userResponse, token} });    
    }
    else {
        const error = new appError("check email or password again", 400, statusText.FAIL);
        return next(error);
    }
});

const getUsers = asyncWrapper(async (req, res, next) => {

    const page = +req.query.page || 1;
    const limit = +req.query.limit || 10;
    const sanitizedPage = Math.max(page, 1); 
    const sanitizedLimit = Math.max(limit, 1);
    const skip = (sanitizedPage - 1) * sanitizedLimit;

    const [users, totalUsers] = await Promise.all([
        User.find({}, { __v: 0, password: 0})
            .limit(sanitizedLimit)
            .skip(skip),
            User.countDocuments()
    ]);

    const totalPages = Math.ceil(totalUsers / sanitizedLimit);

    res.json({
        status: statusText.SUCCESS,
        data: {
            meta: {
                totalItems: totalUsers,
                totalPages: totalPages,
                currentPage: sanitizedPage,
                limit: sanitizedLimit
            },
            users
        }
    });
});

const getUser = asyncWrapper (async (req, res, next)=>{

    const userId = req.params.id;

    const user = await User.findById(userId, {__v: 0, password: 0});
    if (!user){
        const error = new appError("User not found", 404, statusText.FAIL);
        return next(error);
    }

    res.json({status: statusText.SUCCESS, data: {user} });

});

const getMe = asyncWrapper(async(req, res, next)=>{

    const userId = req.userData.id;
    const user = await User.findById(userId).select("-password -__v");

    if (!user){
        const error = new appError("User not found", 404, statusText.FAIL);
        return next(error);
    }

    res.json({status: statusText.SUCCESS, data: {user} });

});

const updateUser = asyncWrapper(async(req, res, next)=>{
    const {firstName, lastName, age, email, password, withdrawalAccount} = req.body
    const userId = req.userData.id;

    const currentUser = await User.findById(userId);

    let hashedPassword;
    if(password) {
        hashedPassword = await bcrypt.hash(password, 10);
    } else {        
        hashedPassword = currentUser.password;
    }

    let avatarName;
    if (req.file){
        avatarName = req.file.filename;    
    } else {
        
        avatarName = currentUser.avatar;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, {
        firstName, 
        lastName, 
        age, 
        email,
        password: hashedPassword,
        avatar: avatarName,
        withdrawalAccount
    },
    { new: true, runValidators: true }).select("-password -__v");

    res.json({status: statusText.SUCCESS, data: {updatedUser}});
});



module.exports = {
    register,
    login,
    getUsers,
    getUser,
    getMe,
    updateUser
};


// TODO: send welcome email
// TODO: إرسال كود تأكيد للإيميل الجديد قبل الحفظ في الداتابيز