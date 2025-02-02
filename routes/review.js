const express = require('express');
const router = express.Router();
const Review = require('../models/Review');

// Route to add a new review
router.post('/', async (req, res) => {
    try {
        const { firstName, lastName, employeeName, company, position,
                reliabilityRating, accountabilityRating, teamworkRating,
                adaptabilityRating, problemSolvingRating, workQualityRating,
                workEthicRating, timeManagementRating, professionalismRating,
                initiativeRating } = req.body;

        // Validate required fields
        if (!firstName || !lastName || !company || !position) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Calculate overall rating
        const ratings = [
            teamworkRating, reliabilityRating, accountabilityRating,
            adaptabilityRating, problemSolvingRating, workQualityRating,
            workEthicRating, timeManagementRating, professionalismRating,
            initiativeRating
        ];
        const overallRating = (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1);

        // Create and save review
        const newReview = new Review({
            firstName,
            lastName,
            employeeName,
            company,
            position,
            teamworkRating,
            reliabilityRating,
            accountabilityRating,
            adaptabilityRating,
            problemSolvingRating,
            workQualityRating,
            workEthicRating,
            timeManagementRating,
            professionalismRating,
            initiativeRating,
            overallRating
        });

        await newReview.save();
        res.status(201).json({ message: 'Review added successfully', review: newReview });
    } catch (error) {
        console.error('Error saving review:', error);
        res.status(500).json({ error: 'Failed to add review', details: error.message });
    }
});

// Route to get all reviews
router.get('/', async (req, res) => {
    try {
        console.log('Incoming Request:', req.body); // Log the incoming request
        const reviews = await Review.find();  // Get all reviews

        if (reviews.length === 0) {
            return res.status(404).json({ message: 'No reviews found' });
        }

        res.json(reviews);  // Send reviews as JSON response
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ error: 'Failed to fetch reviews', details: error.message });
    }
});
// Route to get reviews by company
router.get('/reviews/company/:companyName', async (req, res) => {
    try {
        const companyName = req.params.companyName;
        // Use regex for case-insensitive exact match
        const reviews = await Review.find({ 
            company: { $regex: new RegExp(`^${companyName}$`, 'i') } 
        });

        if (reviews.length === 0) {
            return res.status(404).json({ message: 'No reviews found for this company' });
        }

        res.json(reviews);
    } catch (error) {
        console.error("Error fetching reviews:", error);
        res.status(500).json({ error: 'Failed to fetch reviews', details: error.message });
    }
});


router.get('/reviews/name', async (req, res) => {
    try {
        const { firstName, lastName } = req.query;
        const query = {};

        if (!firstName && !lastName) {
            return res.status(400).json({ message: "First name or last name must be provided" });
        }

        // Build case-insensitive query conditions
        if (firstName) {
            const firstNameRegex = new RegExp(`^${firstName}$`, 'i');
            query.$or = [
                { firstName: { $regex: firstNameRegex } },
                { lastName: { $regex: firstNameRegex } }
            ];
        }

        if (lastName) {
            const lastNameRegex = new RegExp(`^${lastName}$`, 'i');
            if (query.$or) {
                query.$or.push(
                    { lastName: { $regex: lastNameRegex } },
                    { firstName: { $regex: lastNameRegex } }
                );
            } else {
                query.$or = [
                    { lastName: { $regex: lastNameRegex } },
                    { firstName: { $regex: lastNameRegex } }
                ];
            }
        }

        const reviews = await Review.find(query);

        // ... rest of the sorting logic remains unchanged ...
        // Keep the existing sorting code here
        
        res.status(200).json(sortedReviews);
    } catch (error) {
        console.error("Error fetching reviews by name:", error);
        res.status(500).json({ error: "Failed to fetch reviews", details: error.message });
    }
});


module.exports = router;
