require('dotenv').config(); // Load environment variables
const cors = require('cors');
app.use(cors());
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const reviewRoutes = require('./routes/review');

const app = express();
const PORT = process.env.PORT || 3000;  // Use Heroku's dynamic port or fallback to 3000

// Connect to MongoDB Atlas
const dbURI = process.env.MONGODB_URI || 'mongodb+srv://kieferiacaruso:x5i0QTvLCcP8gPD2@staff-score.srvie.mongodb.net/?retryWrites=true&w=majority&appName=staff-score';

mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

app.use(bodyParser.json());  // For parsing application/json
app.use(bodyParser.urlencoded({ extended: true }));  // For parsing application/x-www-form-urlencoded

// Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/reviews', reviewRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
