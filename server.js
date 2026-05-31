    const express  = require('express');
    const mongoose = require('mongoose');
    const cors     = require('cors');
    const dotenv   = require('dotenv');

    dotenv.config();

    const app = express();

    /* ── Middleware ── */
    app.use(cors({
    origin: [
        process.env.FRONTEND_URL,
        'http://localhost:3000',
        'http://127.0.0.1:5500', /* live server for local dev */
    ],
    credentials: true,
    }));
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    /* ── Routes ── */
    app.use('/api/auth',     require('./routes/auth'));
    app.use('/api/products', require('./routes/products'));
    app.use('/api/orders',   require('./routes/orders'));
    app.use('/api/reviews',  require('./routes/reviews'));
    app.use('/api/upload',   require('./routes/upload'));

    /* ── Health check ── */
    app.get('/', (req, res) => {
    res.json({
        status:  'Finbar Exclusive API is running',
        version: '1.0.0',
    });
    });

    /* ── 404 handler ── */
    app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
    });

    /* ── Error handler ── */
    app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
    });

    /* ── Connect to MongoDB then start server ── */
    mongoose
    .connect(process.env.MONGO_URL, { dbName: 'finbar' })
    .then(() => {
        console.log('✅  MongoDB connected');
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => console.log(`🚀  Server running on port ${PORT}`));
    })
    .catch(err => {
        console.error('❌  MongoDB connection failed:', err.message);
        process.exit(1);
    });