const paymentService = require("../services/wallet.service"); 
const Transaction = require("../models/transaction.model");
const asyncWrapper = require('../utils/asyncWrapper');
const statusText = require('../utils/statusText');
const appError = require('../utils/appError');

const deposit = asyncWrapper(async (req, res, next) => {
    const userId = req.userData.id;
    const { amount } = req.body;
    
    if (!amount) return next(new appError("Amount is required", 400, statusText.FAIL));

    const updatedUser = await paymentService.depositFunds(userId, Number(amount));
    res.json({ status: statusText.SUCCESS, data: { balance: updatedUser.balance, frozenBalance: updatedUser.frozenBalance } });
});


const withdraw = asyncWrapper(async (req, res, next) => {
    const userId = req.userData.id;
    const { amount } = req.body;
    if (!amount) return next(new appError("Amount is required", 400, statusText.FAIL));

    const updatedUser = await paymentService.withdrawFunds(userId, Number(amount));
    res.json({ status: statusText.SUCCESS, data: { balance: updatedUser.balance } });
});


const getHistory = asyncWrapper(async (req, res, next) => {
    const userId = req.userData.id;
    const history = await Transaction.find({ user: userId }).sort({ createdAt: -1 });
    res.json({ status: statusText.SUCCESS, data: { history } });
});


const createStripeSession = asyncWrapper(async (req, res, next) => {
    const userId = req.userData.id;
    const userEmail = req.userData.email; 
    const { amount } = req.body;

    if (!amount) return next(new appError("Amount is required", 400, statusText.FAIL));

    const checkoutUrl = await stripeService.createCheckoutSession(userId, userEmail, Number(amount));
    
    res.json({ status: statusText.SUCCESS, data: { url: checkoutUrl } });
});


const stripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];

    try {
        await stripeService.handleWebhook(sig, req.body);
        res.json({ received: true });
    } catch (err) {
        res.status(err.statusCode || 400).json({ status: statusText.FAIL, message: err.message });
    }
};

module.exports = { 
    deposit, 
    withdraw, 
    getHistory,
    createStripeSession,
    stripeWebhook 
};