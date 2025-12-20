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

const { scrapeJobsFromURL } = require('../../utils/scraper');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const page = parseInt(req.query.page) || 1;
    
    console.log('=== ALL JOBS REQUEST ===');
    console.log('Page:', page);

    // Build URL for all jobs
    const baseUrl = 'https://id.jobstreet.com/id/jobs';
    const params = new URLSearchParams({
      page: page.toString()
    });
    const url = `${baseUrl}?${params.toString()}`;

    console.log('Scraping URL:', url);

    // Scrape jobs from URL
    const scrapedJobs = await scrapeJobsFromURL(url);

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
