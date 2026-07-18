const User = require("../models/user.model"); 
const Transaction = require("../models/transaction.model");
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
        await Transaction.create({ user: userId, type: 'deposit', amount });
        return updatedUser;
    }

    async withdrawFunds(userId, amount) {
        if (amount <= 0){
            throw new appError("Amount must be greater than zero", 400, statusText.FAIL);    
        }
        const user = await User.findById(userId);
        if (user.balance < amount) {
            throw new appError("Insufficient balance for withdrawal", 400, statusText.FAIL);
        }
        const updatedUser = await User.findByIdAndUpdate(userId,
            {$inc: {balance: -amount}},
            {new: true}
        );
        await Transaction.create({ user: userId, type: 'withdraw', amount });
        return updatedUser;
    }

    async freezeFunds(buyerId, amount, orderId = null) {
        if (amount <= 0) {
            throw new appError("Amount must be greater than zero", 400, statusText.FAIL);
        }
        const buyer = await User.findById(buyerId);
        if (!buyer){
            throw new appError("Buyer not found", 404, statusText.FAIL);
        }
        if (buyer.balance < amount) {
            throw new appError("Insufficient balance. Please top up your wallet first.", 400, statusText.FAIL);
        }
        const updatedBuyer = await User.findByIdAndUpdate(buyerId,
            { $inc: { balance: -amount, frozenBalance: amount } },
            { new: true, runValidators: true }
        ).select("-password -__v");

        await Transaction.create({ user: buyerId, type: 'freeze', amount, order: orderId });
        return updatedBuyer;
    }

    async releaseFunds(buyerId, sellerId, amount, orderId = null){
        const updatedBuyer = await User.findByIdAndUpdate(buyerId,
            {$inc: {frozenBalance: -amount}},
            {new: true}
        );        
        const updatedSeller = await User.findByIdAndUpdate(sellerId,
            {$inc: {balance: amount}},
            {new: true}
        );        
        if (!updatedBuyer || !updatedSeller){
            throw new appError("Buyer or Seller not found", 404, statusText.FAIL);
        }
        await Transaction.create({ user: buyerId, type: 'release', amount, order: orderId });
        return {buyer: updatedBuyer, seller: updatedSeller};
    }

    async refundFunds(buyerId, amount, orderId = null){
        const updatedBuyer = await User.findByIdAndUpdate(buyerId,
            { $inc: { frozenBalance: -amount, balance: amount } }, 
            {new: true}
        ).select("-password -__v");
        if (!updatedBuyer) {
            throw new appError("Buyer not found", 404, statusText.FAIL);
        }
        await Transaction.create({ user: buyerId, type: 'refund', amount, order: orderId });
        return updatedBuyer;
    }
}

module.exports = new Payment();