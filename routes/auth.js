    const express = require('express');
    const jwt     = require('jsonwebtoken');
    const User    = require('../models/User');
    const protect = require('../middleware/auth');

    const router = express.Router();

    /* ── helper: generate token ── */
    function genToken(id) {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
    }

    /* ════════════════════════════
    POST /api/auth/register
    ════════════════════════════ */
    router.post('/register', async (req, res) => {
    try {
        const { firstName, lastName, email, password, phone, country } = req.body;

        if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ success: false, message: 'Please fill all required fields' });
        }

        const exists = await User.findOne({ email });
        if (exists) {
        return res.status(400).json({ success: false, message: 'Email already registered' });
        }

        const user = await User.create({ firstName, lastName, email, password, phone, country });

        res.status(201).json({
        success: true,
        token:   genToken(user._id),
        user: {
            id:        user._id,
            firstName: user.firstName,
            lastName:  user.lastName,
            email:     user.email,
            role:      user.role,
        },
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
    });

    /* ════════════════════════════
    POST /api/auth/login
    ════════════════════════════ */
    router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password required' });
        }

        const user = await User.findOne({ email });
        if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        const match = await user.comparePassword(password);
        if (!match) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        res.json({
        success: true,
        token:   genToken(user._id),
        user: {
            id:        user._id,
            firstName: user.firstName,
            lastName:  user.lastName,
            email:     user.email,
            role:      user.role,
        },
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
    });

    /* ════════════════════════════
    GET /api/auth/me
    (requires token)
    ════════════════════════════ */
    router.get('/me', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
    });

    /* ════════════════════════════
    PUT /api/auth/wishlist
    Add or remove from wishlist
    ════════════════════════════ */
    router.put('/wishlist', protect, async (req, res) => {
    try {
        const { productId } = req.body;
        const user = await User.findById(req.user._id);

        const idx = user.wishlist.indexOf(productId);
        if (idx > -1) {
        user.wishlist.splice(idx, 1); /* remove */
        } else {
        user.wishlist.push(productId); /* add */
        }

        await user.save();
        res.json({ success: true, wishlist: user.wishlist });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
    });

    module.exports = router;