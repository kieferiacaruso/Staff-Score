const express = require('express');
const router = express.Router();
const Review = require('../models/Review');

// Route to add a new review
router.post('/', async (req, res) => {
    try {
        const { firstName, lastName, company, position, reason, communicationRating, teamworkRating, technicalSkillsRating, overallRating } = req.body;
        // Check for missing fields
        if (!firstName || !lastName || !company || !position || !reason || !communicationRating || !teamworkRating || !technicalSkillsRating || !overallRating) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Combine firstName and lastName for storage (optional)
        const employeeName = `${firstName} ${lastName}`;

        // Create a new review document
        const newReview = new Review({
            firstName,
            lastName,
            employeeName,
            company,
            position,
            reason,
            communicationRating,
            teamworkRating,
            technicalSkillsRating,
            overallRating
        });

        // Save the review to the database
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
        const companyName = req.params.companyName; // Extract companyName
        //console.log("Company Name:", companyName);
      
        // Fetch reviews for the given company
        const reviews = await Review.find({ company: companyName});

        if (reviews.length === 0) {
            return res.status(404).json({ message: 'No reviews found for this company' });
        }

        res.json(reviews);
    } catch (error) {
        console.error("Error fetching reviews:", error); // Log the error to inspect it
        res.status(500).json({ error: 'Failed to fetch reviews', details: error.message });
    }
});


router.get('/reviews/name', async (req, res) => {
    try {
        const { firstName, lastName } = req.query;

        if (!firstName && !lastName) {
            return res.status(400).json({ message: "First name or last name must be provided" });
        }

        const query = {};
        if (firstName) query.$or = [{ firstName }, { lastName: firstName }];
        if (lastName) query.$or = query.$or 
            ? query.$or.concat([{ lastName }, { firstName: lastName }]) 
            : [{ lastName }, { firstName: lastName }];

        const reviews = await Review.find(query);

        if (reviews.length === 0) {
            return res.status(404).json({ message: "No reviews found for the provided name(s)" });
        }

        console.log("Reviews before sorting:", reviews);

        // Custom sorting logic
        const sortedReviews = reviews.sort((a, b) => {
            const bothMatchA = a.firstName === firstName && a.lastName === lastName;
            const bothMatchB = b.firstName === firstName && b.lastName === lastName;

            const firstNameMatchA = a.firstName === firstName;
            const firstNameMatchB = b.firstName === firstName;

            const lastNameMatchA = a.lastName === lastName;
            const lastNameMatchB = b.lastName === lastName;

            const reversedMatchA = a.firstName === lastName || a.lastName === firstName;
            const reversedMatchB = b.firstName === lastName || b.lastName === firstName;

            // Sorting priority:
            // 1. Reviews with both first and last name matching
            if (bothMatchA && !bothMatchB) return -1;
            if (!bothMatchA && bothMatchB) return 1;

            // 2. Reviews with the first name matching
            if (firstNameMatchA && !firstNameMatchB) return -1;
            if (!firstNameMatchA && firstNameMatchB) return 1;

            // 3. Reviews with the last name matching
            if (lastNameMatchA && !lastNameMatchB) return -1;
            if (!lastNameMatchA && lastNameMatchB) return 1;

            // 4. Reviews with the first name matching the last name
            if (reversedMatchA && !reversedMatchB) return -1;
            if (!reversedMatchA && reversedMatchB) return 1;

            // Equal priority
            return 0;
        });

        res.status(200).json(sortedReviews); // Return the sorted reviews
    } catch (error) {
        console.error("Error fetching reviews by name:", error);
        res.status(500).json({ error: "Failed to fetch reviews", details: error.message });
    }
});


module.exports = router;
