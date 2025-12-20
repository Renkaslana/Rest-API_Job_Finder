/**
 * Job Finder API - Flexible Search Endpoint
 * 
 * Endpoint: GET /api/search
 * 
 * CORE CONCEPT: Flexible search like JobStreet
 * 
 * Query Parameters:
 * - location (string, REQUIRED): City/region (e.g., "banten", "jawa-tengah", "jakarta")
 * - classification (string, optional): Job classification slug (e.g., "banking-financial-services", "information-technology")
 * - page (number, optional): Page number (default: 1)
 * 
 * URL Patterns Generated:
 * 1. Location only: /jobs/in-{location}
 * 2. Location + Classification: /jobs-in-{classification}/in-{location}
 * 
 * Examples:
 * - /api/search?location=banten
 * - /api/search?location=jawa-tengah&classification=banking-financial-services
 * - /api/search?location=jakarta&classification=information-technology&page=2
 * 
 * Response Format:
 * {
 *   "query": { location, classification, page },
 *   "meta": { source, scrapedAt, totalJobs },
 *   "jobs": [{ title, company, location, classification, salary, postedAgo, detailUrl }]
 * }
 * 
 * Cache Strategy: 10 minutes for search results
 */

const scrapeJobs = require('../utils/scraper');

/**
 * Normalize slug for consistency
 */
function normalizeSlug(text) {
  if (!text) return '';
  return text.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-]/g, '');
}

/**
 * Main search handler - FLEXIBLE LOCATION + CLASSIFICATION
 */
module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { 
      location = '',        // REQUIRED: Location slug (e.g., "banten", "jawa-tengah")
      classification = '',  // OPTIONAL: Classification slug (e.g., "banking-financial-services")
      page = '1'           // OPTIONAL: Page number
    } = req.query;
    
    // Validate location (required)
    if (!location || !location.trim()) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Parameter "location" is required',
        example: '/api/search?location=banten'
      });
    }

    const pageNum = Math.max(parseInt(page) || 1, 1);
    
    // Normalize inputs
    const normalizedLocation = normalizeSlug(location);
    const normalizedClassification = classification ? normalizeSlug(classification) : null;

    console.log('[Search API] Flexible Search:', { 
      location: normalizedLocation, 
      classification: normalizedClassification,
      page: pageNum 
    });

    /**
     * Cache Strategy: 10 minutes
     */
    res.setHeader(
      'Cache-Control',
      's-maxage=600, stale-while-revalidate=300'
    );

    /**
     * STEP 1: Scrape jobs from JobStreet
     * URL will be built as:
     * - Location only: /jobs/in-{location}
     * - Location + Classification: /jobs-in-{classification}/in-{location}
     */
    const scrapedJobs = await scrapeJobs({
      location: normalizedLocation,
      classification: normalizedClassification,
      page: pageNum
    });

    console.log(`[Search API] Scraped ${scrapedJobs.length} jobs from JobStreet`);

    /**
     * STEP 2: Transform jobs to API format
     */
    const jobs = scrapedJobs.map(job => ({
      title: job.job_title || 'N/A',
      company: job.company || 'N/A',
      location: job.location || normalizedLocation,
      classification: job.category || 'General',
      salary: job.salary_range || null,
      postedAgo: job.posted_date || 'Recently',
      detailUrl: job.source_url || null
    }));

    /**
     * STEP 3: Build response with required structure
     */
    const response = {
      query: {
        location: normalizedLocation,
        classification: normalizedClassification,
        page: pageNum
      },
      meta: {
        source: 'jobstreet',
        scrapedAt: new Date().toISOString(),
        totalJobs: jobs.length
      },
      jobs: jobs
    };

    return res.status(200).json(response);

  } catch (error) {
    console.error('[Search API] Error:', error);
    
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to search jobs',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
