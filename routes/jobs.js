const express = require('express');
const router = express.Router();
const Job = require('../models/Job');

// In-memory storage for demo purposes when DB is not connected
let inMemoryJobs = [];
let nextId = 1;

// Helper function to check if DB is connected
const isDBConnected = () => {
  const mongoose = require('mongoose');
  return mongoose.connection.readyState === 1;
};

// GET /api/jobs/search/query - Search jobs with filters (must be before /:id route)
router.get('/search/query', async (req, res) => {
  try {
    const { q, location, type, company } = req.query;
    
    if (isDBConnected()) {
      let query = { isActive: true };
      
      if (q) {
        query.$text = { $search: q };
      }
      if (location) {
        query.location = new RegExp(location, 'i');
      }
      if (type) {
        query.type = type;
      }
      if (company) {
        query.company = new RegExp(company, 'i');
      }
      
      const jobs = await Job.find(query);
      res.json(jobs);
    } else {
      // In-memory search
      let results = inMemoryJobs.filter(job => job.isActive);
      
      if (q) {
        const searchTerm = q.toLowerCase();
        results = results.filter(job => 
          job.title.toLowerCase().includes(searchTerm) ||
          job.company.toLowerCase().includes(searchTerm) ||
          job.description.toLowerCase().includes(searchTerm) ||
          job.location.toLowerCase().includes(searchTerm)
        );
      }
      if (location) {
        results = results.filter(job => 
          job.location.toLowerCase().includes(location.toLowerCase())
        );
      }
      if (type) {
        results = results.filter(job => job.type === type);
      }
      if (company) {
        results = results.filter(job => 
          job.company.toLowerCase().includes(company.toLowerCase())
        );
      }
      
      res.json(results);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/jobs - Get all jobs
router.get('/', async (req, res) => {
  try {
    if (isDBConnected()) {
      const jobs = await Job.find({ isActive: true }).sort({ postedDate: -1 });
      res.json(jobs);
    } else {
      res.json(inMemoryJobs.filter(job => job.isActive));
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/jobs/:id - Get job by ID
router.get('/:id', async (req, res) => {
  try {
    if (isDBConnected()) {
      const job = await Job.findById(req.params.id);
      if (!job) {
        return res.status(404).json({ error: 'Job not found' });
      }
      res.json(job);
    } else {
      const job = inMemoryJobs.find(j => j.id === parseInt(req.params.id));
      if (!job) {
        return res.status(404).json({ error: 'Job not found' });
      }
      res.json(job);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/jobs - Create new job
router.post('/', async (req, res) => {
  try {
    const { title, company, location, description, salary, type, requirements } = req.body;
    
    if (!title || !company || !location || !description) {
      return res.status(400).json({ error: 'Missing required fields: title, company, location, description' });
    }
    
    if (isDBConnected()) {
      const job = new Job({
        title,
        company,
        location,
        description,
        salary,
        type,
        requirements
      });
      
      const savedJob = await job.save();
      res.status(201).json(savedJob);
    } else {
      const job = {
        id: nextId++,
        title,
        company,
        location,
        description,
        salary: salary || 'Not specified',
        type: type || 'Full-time',
        requirements: requirements || [],
        postedDate: new Date(),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      inMemoryJobs.push(job);
      res.status(201).json(job);
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT /api/jobs/:id - Update job
router.put('/:id', async (req, res) => {
  try {
    const updates = req.body;
    
    if (isDBConnected()) {
      const job = await Job.findByIdAndUpdate(
        req.params.id,
        updates,
        { new: true, runValidators: true }
      );
      
      if (!job) {
        return res.status(404).json({ error: 'Job not found' });
      }
      
      res.json(job);
    } else {
      const jobIndex = inMemoryJobs.findIndex(j => j.id === parseInt(req.params.id));
      if (jobIndex === -1) {
        return res.status(404).json({ error: 'Job not found' });
      }
      
      inMemoryJobs[jobIndex] = {
        ...inMemoryJobs[jobIndex],
        ...updates,
        id: inMemoryJobs[jobIndex].id, // Preserve ID
        updatedAt: new Date()
      };
      
      res.json(inMemoryJobs[jobIndex]);
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/jobs/:id - Delete job (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    if (isDBConnected()) {
      const job = await Job.findByIdAndUpdate(
        req.params.id,
        { isActive: false },
        { new: true }
      );
      
      if (!job) {
        return res.status(404).json({ error: 'Job not found' });
      }
      
      res.json({ message: 'Job deleted successfully', job });
    } else {
      const jobIndex = inMemoryJobs.findIndex(j => j.id === parseInt(req.params.id));
      if (jobIndex === -1) {
        return res.status(404).json({ error: 'Job not found' });
      }
      
      inMemoryJobs[jobIndex].isActive = false;
      inMemoryJobs[jobIndex].updatedAt = new Date();
      
      res.json({ message: 'Job deleted successfully', job: inMemoryJobs[jobIndex] });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
