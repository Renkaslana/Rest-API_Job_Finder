/**
 * JobStreet Recommendations API Endpoint
 * 
 * GET /api/jobstreet
 * 
 * Query Parameters:
 * - page: Page number (default: 1)
 * - limit: Results per page (default: 20, max: 50)
 * 
 * Response:
 * {
 *   success: true,
 *   data: [...jobs],
 *   meta: {
 *     total: 2292,
 *     page: 1,
 *     per_page: 20,
 *     total_pages: 115,
 *     has_next_page: true
 *   },
 *   timestamp: "2025-12-20T..."
 * }
 */

const { scrapeJobStreet } = require('../utils/scraper-jobstreet');
const { getCachedData, setCachedData } = require('../utils/cache');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed. Use GET.'
    });
  }

  try {
    // Parse query parameters
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 50); // Max 50

    // Validate parameters
    if (page < 1) {
      return res.status(400).json({
        success: false,
        error: 'Page must be greater than 0'
      });
    }

    if (limit < 1 || limit > 50) {
      return res.status(400).json({
        success: false,
        error: 'Limit must be between 1 and 50'
      });
    }

    // Create cache key
    const cacheKey = `jobstreet_recommendations_page_${page}_limit_${limit}`;

    // Check cache (5 minutes TTL)
    const cachedData = getCachedData(cacheKey, 5 * 60 * 1000);
    if (cachedData) {
      console.log('[JobStreet API] Serving from cache');
      return res.status(200).json({
        ...cachedData,
        cached: true
      });
    }

    // Scrape fresh data
    console.log(`[JobStreet API] Scraping page ${page} with limit ${limit}`);
    const result = await scrapeJobStreet({ page, limit });

    // Cache the result
    if (result.success && result.data.length > 0) {
      setCachedData(cacheKey, result);
    }

    // Return response
    return res.status(200).json(result);

  } catch (error) {
    console.error('[JobStreet API] Error:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message,
      data: [],
      meta: {
        total: 0,
        page: 1,
        per_page: 20,
        total_pages: 0,
        has_next_page: false
      },
      timestamp: new Date().toISOString()
    });
  }
};
