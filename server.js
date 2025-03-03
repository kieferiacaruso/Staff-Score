require('dotenv').config(); // Load environment variables

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');
const passport = require('passport');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const reviewRoutes = require('./routes/review');

const app = express();
const PORT = process.env.PORT || 3000; // Use Heroku's dynamic port or fallback to 3000

// MongoDB URI
const dbURI = process.env.MONGODB_URI || 'mongodb+srv://kieferiacaruso:x5i0QTvLCcP8gPD2@staff-score.srvie.mongodb.net/?retryWrites=true&w=majority&appName=staff-score';

// Mongoose Connection
const connectToMongoDB = async () => {
    try {
        console.log('Attempting to connect to MongoDB...');
        await mongoose.connect(dbURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 10000, // 10 seconds timeout for initial connection
        });
        console.log('MongoDB connected successfully!');

        // Optional: Ping the database to ensure it's working
        const db = mongoose.connection.db;
        await db.admin().ping();
        console.log('Pinged MongoDB successfully!');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message);
        process.exit(1); // Exit the process to signal failure (optional, for debugging)
    }
};

// Event Listeners for MongoDB Connection
mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected. Attempting to reconnect...');
    connectToMongoDB();
});

mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err.message);
});

// Call the connection function
connectToMongoDB();

// Enable CORS
app.use(cors());

// Middleware for parsing requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize Passport
app.use(passport.initialize());

// Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/reviews', reviewRoutes);

// Add a root route for Heroku health checks
app.get('/', (req, res) => {
    res.send('Staff Score API is running');
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err.stack);
    res.status(500).json({ error: 'Internal server error' });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});