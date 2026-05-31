    const express = require('express');
    const Review  = require('../models/Review');
    const protect = require('../middleware/auth');
    const admin   = require('../middleware/admin');

    const router = express.Router();

    /* ════════════════════════════
    GET /api/reviews/:productId
    Public — get all reviews for a product
    ════════════════════════════ */
    router.get('/:productId', async (req, res) => {
    try {
        const reviews = await Review.find({ product: req.params.productId })
        .sort({ createdAt: -1 });

        const avg = reviews.length
        ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
        : 0;

        res.json({ success: true, count: reviews.length, average: avg.toFixed(1), reviews });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
    });

    /* ════════════════════════════
    POST /api/reviews/:productId
    Logged in — submit a review
    ════════════════════════════ */
    router.post('/:productId', protect, async (req, res) => {
    try {
        const { name, rating, title, body } = req.body;

        if (!name || !rating || !title || !body) {
        return res.status(400).json({ success: false, message: 'All fields required' });
        }

        /* check if user already reviewed this product */
        const existing = await Review.findOne({
        product: req.params.productId,
        user:    req.user._id,
        });
        if (existing) {
        return res.status(400).json({ success: false, message: 'You have already reviewed this product' });
        }

        const review = await Review.create({
        product: req.params.productId,
        user:    req.user._id,
        name, rating, title, body,
        });

        res.status(201).json({ success: true, review });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
    });

    /* ════════════════════════════
    DELETE /api/reviews/:id
    Admin — delete a review
    ════════════════════════════ */
    router.delete('/:id', protect, admin, async (req, res) => {
    try {
        await Review.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Review deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
    });

    module.exports = router;