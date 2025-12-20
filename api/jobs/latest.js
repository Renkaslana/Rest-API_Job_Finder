/**
 * Latest Jobs API Endpoint
 * 
 * GET /api/jobs/latest
 * Query params:
 *   - page: Page number (default: 1)
 * 
 * Returns the latest job postings from JobStreet
 * URL: https://id.jobstreet.com/id/jobs?tags=new
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
    
    console.log('=== LATEST JOBS REQUEST ===');
    console.log('Page:', page);

    // Build URL for latest jobs
    const baseUrl = 'https://id.jobstreet.com/id/jobs';
    const params = new URLSearchParams({
      tags: 'new',
      page: page.toString()
    });
    const url = `${baseUrl}?${params.toString()}`;

    console.log('Scraping URL:', url);

    // Scrape jobs from URL
    const scrapedJobs = await scrapeJobsFromURL(url);

    console.log(`Found ${scrapedJobs.length} latest jobs`);

    // Return response
    return res.status(200).json({
      success: true,
      meta: {
        totalJobs: scrapedJobs.length,
        page: page,
        source: 'jobstreet',
        type: 'latest',
        scrapedAt: new Date().toISOString()
      },
      jobs: scrapedJobs
    });

  } catch (error) {
    console.error('Latest jobs error:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch latest jobs',
      message: error.message
    });
  }
};
