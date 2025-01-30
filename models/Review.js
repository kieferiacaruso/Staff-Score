const mongoose = require('mongoose');

// Define the review schema
const reviewSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    employeeName: { type: String, required: true }, // Name of the employee being reviewed
    company: { type: String, required: true }, // Company where the employee worked
    position: { type: String, required: true }, // Position of the employee
    teamworkRating: { type: Number, required: true, min: 1, max: 5 }, // Rating for teamwork
    reliabilityRating: { type: Number, required: true, min: 1, max: 5 },
    accountabilityRating: { type: Number, required: true, min: 1, max: 5 },
    adaptabilityRating: { type: Number, required: true, min: 1, max: 5 },
    problemSolvingRating: { type: Number, required: true, min: 1, max: 5 },
    workQualityRating: { type: Number, required: true, min: 1, max: 5 },
    workEthicRating: { type: Number, required: true, min: 1, max: 5 },
    timeManagementRating: { type: Number, required: true, min: 1, max: 5 },
    professionalismRating: { type: Number, required: true, min: 1, max: 5 },
    initiativeRating: { type: Number, required: true, min: 1, max: 5 },
    overallRating: { type: Number, required: true, min: 1, max: 5 }, // Overall rating
    date: { type: Date, default: Date.now } // Timestamp of the review
});

// Create and export the Review model
module.exports = mongoose.model('Review', reviewSchema);
