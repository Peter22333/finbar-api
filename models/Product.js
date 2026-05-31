    const mongoose = require('mongoose');

    const productSchema = new mongoose.Schema({
    name:        { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    price:       { type: Number, required: true, min: 0 },
    category:    { type: String, required: true },
    sizes:       [{ type: String }],
    images:      [{ type: String }], /* Cloudinary URLs */
    status:      { type: String, enum: ['available', 'low', 'sold'], default: 'available' },
    badge:       { type: String, enum: ['new', 'low', 'restock', ''], default: '' },
    trending:    { type: Boolean, default: false },
    colours: [{
        label: String,
        hex:   String,
    }],
    }, { timestamps: true });

    module.exports = mongoose.model('Product', productSchema);