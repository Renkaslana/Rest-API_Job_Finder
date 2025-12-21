/**
 * Job Finder API - Latest Jobs Endpoint
 * 
 * Endpoint: GET /api/jobs/latest
 * 
 * Sumber: https://id.jobstreet.com/id/terbaru-jobs?pos=1
 * 
 * Tujuan: Home Highlight - mengambil 5-8 job terbaru
 * 
 * Aturan:
 * - Maksimal 5-8 job saja
 * - TANPA pagination
 * - Hanya untuk Home Highlight
 * - Jangan scrape detail job di sini
 * 
 * Response Format:
 * {
 *   "status": "success",
 *   "statusCode": 200,
 *   "jobs": [
 *     {
 *       "jobId": "string",
 *       "title": "string",
 *       "company": "string",
 *       "location": "string",
 *       "classification": "string | null",
 *       "salary": "string | null",
 *       "postedLabel": "string",
 *       "applyUrl": "string"
 *     }
 *   ]
 * }
 */

const { scrapeLatestJobs } = require('../../utils/scraper-latest');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only accept GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      status: 'error',
      statusCode: 405,
      message: 'Method not allowed. Use GET.'
    });
  }

  try {
    // Parse optional limit parameter (default: 6, max: 8)
    const { limit = '6' } = req.query;
    const limitNum = Math.min(Math.max(parseInt(limit) || 6, 1), 8);

    // Cache headers (10 minutes)
    res.setHeader(
      'Cache-Control',
      's-maxage=600, stale-while-revalidate=300'
    );

    console.log('[Latest Jobs API] Request received, limit:', limitNum);

    // Scrape latest jobs
    const jobs = await scrapeLatestJobs({ limit: limitNum });

    // Check if scraping failed
    if (!jobs || jobs.length === 0) {
      return res.status(200).json({
        status: 'error',
        statusCode: 200,
        message: 'Data sementara tidak tersedia',
        jobs: []
      });
    }

    // Success response
    return res.status(200).json({
      status: 'success',
      statusCode: 200,
      message: `Successfully fetched ${jobs.length} latest jobs`,
      jobs: jobs
    });

  } catch (error) {
    console.error('[Latest Jobs API] Error:', error);
    
    // Return error response (don't crash API)
    return res.status(200).json({
      status: 'error',
      statusCode: 200,
      message: 'Data sementara tidak tersedia',
      jobs: []
    });
  }
};

