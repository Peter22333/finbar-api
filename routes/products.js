    const express = require('express');
    const Product = require('../models/Product');
    const protect = require('../middleware/auth');
    const admin   = require('../middleware/admin');

    const router = express.Router();

    /* ════════════════════════════
    GET /api/products
    Public — get all products
    ════════════════════════════ */
    router.get('/', async (req, res) => {
    try {
        const { category, status, trending } = req.query;
        const filter = {};
        if (category) filter.category = category;
        if (status)   filter.status   = status;
        if (trending) filter.trending = trending === 'true';

        const products = await Product.find(filter).sort({ createdAt: -1 });
        res.json({ success: true, count: products.length, products });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
    });

    /* ════════════════════════════
    GET /api/products/:id
    Public — get one product
    ════════════════════════════ */
    router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
        res.json({ success: true, product });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
    });

    /* ════════════════════════════
    POST /api/products
    Admin only — create product
    ════════════════════════════ */
    router.post('/', protect, admin, async (req, res) => {
    try {
        const product = await Product.create(req.body);
        res.status(201).json({ success: true, product });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
    });

    /* ════════════════════════════
    PUT /api/products/:id
    Admin only — update product
    ════════════════════════════ */
    router.put('/:id', protect, admin, async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
        req.params.id, req.body, { new: true, runValidators: true }
        );
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
        res.json({ success: true, product });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
    });

    /* ════════════════════════════
    DELETE /api/products/:id
    Admin only — delete product
    ════════════════════════════ */
    router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
        res.json({ success: true, message: 'Product deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
    });

    module.exports = router;