const mongoose = require('mongoose');

// Define the review schema
const reviewSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    employeeName: { type: String, required: true }, // Name of the employee being reviewed
    company: { type: String, required: true }, // Company where the employee worked
    position: { type: String, required: true }, // Position of the employee
    reason: { type: String, required: true }, // Reason for rating
    communicationRating: { type: Number, required: true, min: 1, max: 5 }, // Rating for communication
    teamworkRating: { type: Number, required: true, min: 1, max: 5 }, // Rating for teamwork
    technicalSkillsRating: { type: Number, required: true, min: 1, max: 5 }, // Rating for technical skills
    overallRating: { type: Number, required: true, min: 1, max: 5 }, // Overall rating
    date: { type: Date, default: Date.now } // Timestamp of the review
});

// Create and export the Review model
module.exports = mongoose.model('Review', reviewSchema);
