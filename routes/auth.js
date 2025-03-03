const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const router = express.Router();

const CLIENT_ID = "792540988133-r0q5pr8m9icqu2lhefgvbntvu3oabug7.apps.googleusercontent.com";
const client = new OAuth2Client(CLIENT_ID);

router.post('/google', async (req, res) => {
    try {
        const { idToken, userType } = req.body;

        // Verify the ID token
        const ticket = await client.verifyIdToken({
            idToken,
            audience: CLIENT_ID
        });

        const payload = ticket.getPayload();
        const { sub, name, email, picture } = payload;

        // Check if the user exists in the database
        let user = await User.findOne({ googleId: sub });

        if (!user) {
            // Create a new user if they don't exist
            user = new User({
                googleId: sub,
                name,
                email,
                imageUrl: picture,
                userType: userType || 'employee', // Default to employee if not specified
                createdAt: new Date()
            });
            await user.save();
        }

        // Respond with user data
        res.json({ success: true, user });
    } catch (error) {
        console.error('Google authentication error:', error);
        res.status(401).json({ success: false, message: 'Invalid Google authentication' });
    }
});

// Route to update user profile (for adding company name or position after initial signup)
router.post('/update-profile', async (req, res) => {
    try {
        const { googleId, companyName, position } = req.body;
        
        const updateData = {};
        if (companyName) updateData.companyName = companyName;
        if (position) updateData.position = position;
        
        const user = await User.findOneAndUpdate(
            { googleId },
            updateData,
            { new: true }
        );
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        res.json({ success: true, user });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ success: false, message: 'Failed to update profile' });
    }
});

module.exports = router;