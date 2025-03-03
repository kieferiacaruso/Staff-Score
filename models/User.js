const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    googleId: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    imageUrl: { type: String },
    userType: { type: String, enum: ['employee', 'company'], required: true },
    companyName: { type: String }, // For company users
    position: { type: String }, // For employee users
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);