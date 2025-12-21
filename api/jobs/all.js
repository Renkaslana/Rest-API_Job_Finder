/**
 * Job Finder API - All Jobs Endpoint (Infinite Scroll)
 * 
 * Endpoint: GET /api/jobs/all?page=1
 * 
 * Sumber: https://id.jobstreet.com/id/jobs/in-Indonesia
 * 
 * Tujuan: Infinite scroll untuk Android - semua job Indonesia dengan pagination
 * 
 * Aturan:
 * - Pagination WAJIB
 * - Default limit = 20
 * - page dimulai dari 1
 * - Jangan load semua data sekaligus
 * - Cocok untuk scroll panjang Android
 * 
 * Response Format:
 * {
 *   "status": "success",
 *   "statusCode": 200,
 *   "jobs": [...],
 *   "meta": {
 *     "page": 1,
 *     "limit": 20,
 *     "hasNextPage": true,
 *     "scrapedAt": "ISO timestamp"
 *   }
 * }
 */

const { scrapeAllJobs } = require('../../utils/scraper-all');

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
    // Parse query parameters
    const { page = '1', limit = '20' } = req.query;
    
    // Validate and parse numeric parameters
    const pageNum = Math.max(parseInt(page) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit) || 20, 1), 50); // Max 50 per page

    // Validate numeric values
    if (isNaN(pageNum) || isNaN(limitNum)) {
      return res.status(400).json({
        status: 'error',
        statusCode: 400,
        message: 'Parameters page and limit must be valid numbers'
      });
    }

    // Cache headers (10 minutes)
    res.setHeader(
      'Cache-Control',
      's-maxage=600, stale-while-revalidate=300'
    );

    console.log('[All Jobs API] Request received:', { page: pageNum, limit: limitNum });

    // Scrape all jobs with pagination
    const result = await scrapeAllJobs({ page: pageNum, limit: limitNum });

    // Check if scraping failed
    if (!result || !result.jobs || result.jobs.length === 0) {
      return res.status(200).json({
        status: 'error',
        statusCode: 200,
        message: 'Data sementara tidak tersedia',
        jobs: [],
        meta: {
          page: pageNum,
          limit: limitNum,
          hasNextPage: false,
          scrapedAt: new Date().toISOString()
        }
      });
    }

    // Success response
    return res.status(200).json({
      status: 'success',
      statusCode: 200,
      message: `Successfully fetched ${result.jobs.length} jobs`,
      jobs: result.jobs,
      meta: {
        page: pageNum,
        limit: limitNum,
        hasNextPage: result.hasNextPage || false,
        scrapedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('[All Jobs API] Error:', error);
    
    // Return error response (don't crash API)
    return res.status(200).json({
      status: 'error',
      statusCode: 200,
      message: 'Data sementara tidak tersedia',
      jobs: [],
      meta: {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20,
        hasNextPage: false,
        scrapedAt: new Date().toISOString()
      }
    });
  }
};

