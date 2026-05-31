    const express = require('express');
    const axios   = require('axios');
    const Order   = require('../models/Order');
    const protect = require('../middleware/auth');
    const admin   = require('../middleware/admin');

    const router = express.Router();

    /* ════════════════════════════
    POST /api/orders
    Create order after payment
    ════════════════════════════ */
    router.post('/', protect, async (req, res) => {
    try {
        const { customer, address, items, total, paystackRef } = req.body;

        if (!items || !items.length) {
        return res.status(400).json({ success: false, message: 'No items in order' });
        }

        const order = await Order.create({
        user: req.user._id,
        customer,
        address,
        items,
        total,
        paystackRef,
        status: 'processing',
        });

        res.status(201).json({ success: true, order });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
    });

    /* ════════════════════════════
    GET /api/orders/my
    Get logged-in user's orders
    ════════════════════════════ */
    router.get('/my', protect, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json({ success: true, orders });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
    });

    /* ════════════════════════════
    GET /api/orders
    Admin — get all orders
    ════════════════════════════ */
    router.get('/', protect, admin, async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 }).populate('user', 'firstName lastName email');
        res.json({ success: true, count: orders.length, orders });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
    });

    /* ════════════════════════════
    PUT /api/orders/:id/status
    Admin — update order status
    ════════════════════════════ */
    router.put('/:id/status', protect, admin, async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findByIdAndUpdate(
        req.params.id, { status }, { new: true }
        );
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
        res.json({ success: true, order });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
    });

    /* ════════════════════════════
    POST /api/orders/verify-payment
    Verify Paystack payment
    ════════════════════════════ */
    router.post('/verify-payment', protect, async (req, res) => {
    try {
        const { reference } = req.body;

        const response = await axios.get(
        `https://api.paystack.co/transaction/verify/${reference}`,
        { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } }
        );

        const data = response.data.data;

        if (data.status === 'success') {
        res.json({ success: true, verified: true, data });
        } else {
        res.json({ success: false, verified: false, message: 'Payment not successful' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
    });

    module.exports = router;