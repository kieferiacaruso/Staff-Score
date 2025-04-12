const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();
const SECRET = process.env.JWT_SECRET || "secret";

// Sign Up
router.post('/signup', async (req, res) => {
  const { firstName, lastName, email, password, role } = req.body;
  try {
      // Log the request payload for debugging (remove in production)
      console.log('Signup request:', { firstName, lastName, email, role });
      
      let user = await User.findOne({ email });
      if (user) return res.status(400).json({ error: 'User already exists' });

      const hashedPassword = await bcrypt.hash(password, 10);

      user = new User({
        name: `${firstName} ${lastName}`,
        email,
        password: hashedPassword,
        userType: role,
        googleId: `local_${Date.now()}_${Math.random().toString(36).substring(2,9)}` // Random unique ID
    });

      await user.save();
      console.log('User saved successfully:', user._id);

      const token = jwt.sign({ id: user._id }, SECRET, { expiresIn: '7d' });

      res.json({ token, user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          userType: user.userType
      }});
  } catch (err) {
      console.error('Signup error details:', err.message, err.stack);
      res.status(500).json({ error: `Server error: ${err.message}` });
  }
});

// Log In
router.post('/login', async (req, res) => {
    const { email, password, userType } = req.body;
    try {
        const user = await User.findOne({ email, userType });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ success: false, message: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id }, SECRET, { expiresIn: '7d' });

        res.json({ success: true, user, token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
