const express = require('express');
const router = express.Router();
const walletController = require('../controllers/wallet.controller');
const { verifyToken, allowedTo } = require('../middlewares/verifyToken');


router.use(verifyToken);

router.route('/deposit')
    .post(allowedTo('buyer', 'seller'), walletController.deposit);

router.route('/withdraw')
    .post(allowedTo('seller'), walletController.withdraw);

router.route('/history')
    .get(allowedTo('buyer', 'seller', 'admin'), walletController.getHistory);

module.exports = router;