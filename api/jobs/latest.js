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
    
    console.log('=== LATEST JOBS REQUEST ===');
    console.log('Page:', page);

    // Use scrapeJobs with tags=new parameter
    // JobStreet URL structure: /id/jobs?tags=new&page=1
    const searchParams = {
      tags: 'new',
      page: page
    };

    console.log('Scraping with params:', searchParams);

    // Scrape jobs using existing logic
    const scrapedJobs = await scrapeJobs(searchParams);
    
    // Extract classifications
    const classifications = extractClassifications(scrapedJobs);

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
      classifications: classifications,
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
