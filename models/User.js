    const mongoose = require('mongoose');
    const bcrypt   = require('bcryptjs');

    const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true, trim: true },
    lastName:  { type: String, required: true, trim: true },
    email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
    password:  { type: String, required: true, minlength: 6 },
    phone:     { type: String, default: '' },
    country:   { type: String, default: '' },
    role:      { type: String, enum: ['user', 'admin'], default: 'user' },
    wishlist:  [{ type: String }], /* product IDs */
    }, { timestamps: true });

    /* hash password before saving */
    userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
    });

    /* compare password */
    userSchema.methods.comparePassword = async function (entered) {
    return bcrypt.compare(entered, this.password);
    };

    module.exports = mongoose.model('User', userSchema);