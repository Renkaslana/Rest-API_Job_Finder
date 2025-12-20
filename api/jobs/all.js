/**
 * All Jobs API Endpoint
 * 
 * GET /api/jobs/all
 * Query params:
 *   - page: Page number (default: 1)
 * 
 * Returns all available job postings from JobStreet
 * URL: https://id.jobstreet.com/id/jobs
 */

const scrapeJobs = require('../../utils/scraper');
const { extractClassifications } = require('../../utils/scraper');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Cache for 15 minutes
  res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const page = parseInt(req.query.page) || 1;
    
    console.log('=== ALL JOBS REQUEST ===');
    console.log('Page:', page);

    // Use scrapeJobs with minimal parameters (no location, no keyword)
    // This will scrape from general /id/jobs page
    const searchParams = {
      page: page
    };

    console.log('Scraping with params:', searchParams);

    // Scrape jobs using existing logic
    const scrapedJobs = await scrapeJobs(searchParams);
    
    // Extract classifications
    const classifications = extractClassifications(scrapedJobs);

    console.log(`Found ${scrapedJobs.length} jobs`);

    // Return response
    return res.status(200).json({
      success: true,
      meta: {
        totalJobs: scrapedJobs.length,
        page: page,
        source: 'jobstreet',
        type: 'all',
        scrapedAt: new Date().toISOString()
      },
      classifications: classifications,
      jobs: scrapedJobs
    });

  } catch (error) {
    console.error('All jobs error:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch all jobs',
      message: error.message
    });
  }
};
