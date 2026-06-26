const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const {verifyToken, allowedTo} = require('../middlewares/verifyToken');

router.route('/')
    .post(verifyToken, allowedTo("buyer"), reviewController.createReview)
    .get(reviewController.getReviews)

router.route('/:id')
    .get(reviewController.getReview)
    .patch(verifyToken, allowedTo("buyer"), reviewController.updateReview)
    .delete(verifyToken, allowedTo("admin", "buyer"), reviewController.deleteReview)

module.exports = router;