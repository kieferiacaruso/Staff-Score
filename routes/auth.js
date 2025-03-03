const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client('792540988133-r0q5pr8m9icqu2lhefgvbntvu3oabug7.apps.googleusercontent.com');

// Google Sign-In Route
router.post('/google', async (req, res) => {
    const { idToken } = req.body;

    try {
        const ticket = await client.verifyIdToken({
            idToken,
            audience: '792540988133-r0q5pr8m9icqu2lhefgvbntvu3oabug7.apps.googleusercontent.com',
        });
        const payload = ticket.getPayload();
        const { email, given_name, family_name } = payload;

        // Check if the user already exists
        let user = await User.findOne({ email });
        if (!user) {
            // Create a new user if they don't exist
            user = new User({
                firstName: given_name,
                lastName: family_name,
                email,
                password: 'google', // You can set a dummy password or handle it differently
                role: 'employee', // Default role, adjust as needed
            });
            await user.save();
        }

        // Generate a JWT token
        const token = jwt.sign({ id: user._id }, 'secretkey', { expiresIn: '1h' });
        res.json({ token });
    } catch (err) {
        res.status(500).json({ error: 'Error during Google Sign-In' });
    }
});