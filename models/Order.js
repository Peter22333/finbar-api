    const mongoose = require('mongoose');
    const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    customer: {
        firstName: String,
        lastName:  String,
        email:     String,
        phone:     String,
    },
    address: {
        street:  String,
        city:    String,
        state:   String,
        country: String,
        zip:     String,
    },
    items: [{
        product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        name:     String,
        price:    Number,
        qty:      Number,
        size:     String,
        image:    String,
    }],
    total:       { type: Number, required: true },
    paystackRef: { type: String, default: '' },
    status: {
        type:    String,
        enum:    ['pending', 'processing', 'completed', 'cancelled'],
        default: 'pending',
    },
    }, { timestamps: true });

    module.exports = mongoose.model('Order', orderSchema);