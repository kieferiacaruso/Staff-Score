const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    googleId: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    imageUrl: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);