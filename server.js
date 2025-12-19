const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
const connectDB = async () => {
  try {
    if (process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('MongoDB connected successfully');
    } else {
      console.log('Running without database connection (MONGODB_URI not set)');
    }
  } catch (error) {
    console.error('MongoDB connection error:', error);
    console.log('Continuing without database connection');
  }
};

connectDB();

// Routes
const jobRoutes = require('./routes/jobs');
app.use('/api/jobs', jobRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Job Finder REST API',
    endpoints: {
      'GET /api/jobs': 'Get all jobs',
      'GET /api/jobs/:id': 'Get job by ID',
      'POST /api/jobs': 'Create new job',
      'PUT /api/jobs/:id': 'Update job',
      'DELETE /api/jobs/:id': 'Delete job',
      'GET /api/jobs/search/query': 'Search jobs with filters'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
