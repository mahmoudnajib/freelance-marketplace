const User = require("../models/user.model"); 
const appError = require('../utils/appError');
const statusText = require('../utils/statusText');

class Payment {

    constructor(){}
    
    async depositFunds(userId, amount){
        if (amount <= 0){
            throw new appError("Amount must be greater than zero", 400, statusText.FAIL);    
        }

        const updatedUser = await User.findByIdAndUpdate(userId,
            {$inc: {balance: amount}},
            {new: true}    
        );

        return updatedUser;
    }

    async freezeFunds(buyerId, amount) {
        if (amount <= 0) {
            throw new appError("Amount must be greater than zero", 400, statusText.FAIL);
        }
        
        const buyer = await User.findById(buyerId);
        if (!buyer){
            throw new appError("buyer not found", 404, statusText.FAIL);
        }

        if (buyer.balance < amount) {
            throw new appError("Insufficient balance. Please top up your wallet first.", 400, statusText.FAIL);
        }

        const updatedBuyer = await User.findByIdAndUpdate(buyerId,
            {
                $inc: {
                    balance: -amount,
                    frozenBalance: amount
                }
            },
            {new: true, runValidators: true}
        ).select("-password -__v")

        return updatedBuyer;
    }

    async releaseFunds(buyerId, sellerId, amount){
    
        const updatedBuyer = await User.findByIdAndUpdate(
            buyerId,
            {$inc: {frozenBalance: -amount}},
            {new: true}
        );        

        const updatedSeller = await User.findByIdAndUpdate(
            sellerId,
            {$inc: {balance: amount}},
            {new: true}
        );        

        if (!updatedBuyer || !updatedSeller){
            throw new appError("Buyer or Seller not found", 404, statusText.FAIL);
        }

        return {buyer: updatedBuyer, seller: updatedSeller};

    }

    async refundFunds(buyerId, amount){
        
        const updatedBuyer = await User.findByIdAndUpdate(buyerId,
            {
                $inc:{
                    frozenBalance: -amount,
                    balance: amount
                }
            }, {new: true}
        ).select("-password -__v");
        
        if (!updatedBuyer) {
            throw new appError("Buyer not found", 404, statusText.FAIL);
        }

        return updatedBuyer;
    }

}


module.exports = new Payment();