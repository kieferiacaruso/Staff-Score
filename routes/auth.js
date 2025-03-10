const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const router = express.Router();

// Google OAuth client ID and secret (preferably from environment variables)
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "792540988133-r0q5pr8m9icqu2lhefgvbntvu3oabug7.apps.googleusercontent.com";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET; // This should be in your .env file

// Set up Passport Google OAuth strategy
passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
  },
  async function(accessToken, refreshToken, profile, done) {
    try {
      // Check if user already exists in your database
      let user = await User.findOne({ googleId: profile.id });
      
      if (!user) {
        // Create a new user if they don't exist - Default to employee type
        user = new User({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          imageUrl: profile.photos[0].value,
          userType: 'employee', // Default user type
          createdAt: new Date()
        });
        await user.save();
      }
      
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }
));

// Serialize and deserialize user (required for session)
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Route to initiate Google OAuth flow
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google OAuth callback route
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login.html' }),
  function(req, res) {
    // Successful authentication, redirect to dashboard
    res.redirect('/dashboard.html');
  }
);

// Handle front-end token-based authentication
router.post('/google-token', async (req, res) => {
  try {
    const { idToken, profile } = req.body;
    
    if (!profile || !profile.id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Profile information is required' 
      });
    }
    
    // Check if user exists
    let user = await User.findOne({ googleId: profile.id });
    
    if (!user) {
      // Create new user with the userType from the request
      user = new User({
        googleId: profile.id,
        name: profile.name,
        email: profile.email,
        imageUrl: profile.imageUrl,
        userType: profile.userType || 'employee', // Use provided userType or default to 'employee'
        createdAt: new Date()
      });
      await user.save();
    }
    
    // Return user data
    res.json({ success: true, user });
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Authentication failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Add endpoint to update user profile information
router.put('/user-profile', async (req, res) => {
  try {
    const { googleId, userType, companyName, position } = req.body;
    
    if (!googleId) {
      return res.status(400).json({
        success: false,
        message: 'Google ID is required'
      });
    }
    
    // Find and update the user
    const user = await User.findOne({ googleId });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Update fields if provided
    if (userType) user.userType = userType;
    if (companyName) user.companyName = companyName;
    if (position) user.position = position;
    
    await user.save();
    
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'Auth route is working' });
});

module.exports = router;