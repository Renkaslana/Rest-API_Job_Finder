/**
 * Job Finder API - Search Endpoint (Production-Ready)
 * 
 * Endpoint: GET /api/search
 * 
 * PRODUCTION SPECIFICATION:
 * - Follows JobStreet URL patterns exactly
 * - Stable for all Indonesia regions
 * - Ready for Android App integration
 * - Proper error handling (no 500 for bad input)
 * 
 * SUPPORTED PARAMETERS:
 * - location (string, REQUIRED): Region/city (auto-normalized)
 * - classification (string, optional): Job category slug
 * - page (number, optional): Page number (default: 1, min: 1)
 * - limit (number, optional): Results per page (default: 20, max: 30)
 * 
 * URL PATTERNS GENERATED:
 * 1. Location only: /jobs/in-{location}?page={page}
 * 2. Location + Classification: /jobs-in-{classification}/in-{location}?page={page}
 * 
 * LOCATION NORMALIZATION:
 * - "Jawa Tengah" → "jawa-tengah"
 * - "DI Yogyakarta" → "yogyakarta"  
 * - "jakarta" → "jakarta"
 * - Removes "DI ", "D.I. " prefixes automatically
 * 
 * EXAMPLES:
 * GET /api/search?location=banten
 * GET /api/search?location=Jawa Tengah&classification=banking-financial-services
 * GET /api/search?location=jakarta&page=2&limit=20
 * 
 * RESPONSE FORMAT:
 * {
 *   "query": { location, classification, page },
 *   "meta": { limit, hasNextPage, scrapedAt },
 *   "jobs": [{ title, company, location, classification, salary, badge, detailUrl }]
 * }
 * 
 * Cache: 10 minutes (s-maxage=600)
 */

const scrapeJobs = require('../utils/scraper');

// Valid query parameters (whitelist)
const VALID_PARAMS = ['location', 'classification', 'page', 'limit'];

/**
 * Normalize location to JobStreet slug format
 * Examples:
 * - "Jawa Tengah" → "jawa-tengah"
 * - "DI Yogyakarta" → "yogyakarta"
 * - "Nusa Tenggara Barat" → "nusa-tenggara-barat"
 */
function normalizeLocation(location) {
  if (!location) return '';
  
  let normalized = location.trim();
  
  // Remove "DI " or "D.I. " prefix (for Yogyakarta, Aceh)
  normalized = normalized.replace(/^D\.?I\.?\s+/i, '');
  
  // Convert to lowercase, replace spaces with hyphens
  normalized = normalized
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]/g, '');
  
  return normalized;
}

/**
 * Normalize classification slug
 */
function normalizeClassification(classification) {
  if (!classification) return null;
  return classification
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]/g, '');
}

/**
 * Main search handler
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

  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({
      status: 'error',
      statusCode: 405,
      message: 'Method not allowed. Use GET.'
    });
  }

  try {
    // STEP 1: Validate query parameters (whitelist)
    const queryKeys = Object.keys(req.query);
    const invalidParams = queryKeys.filter(key => !VALID_PARAMS.includes(key));
    
    if (invalidParams.length > 0) {
      return res.status(400).json({
        status: 'error',
        statusCode: 400,
        message: `Invalid parameter(s): ${invalidParams.join(', ')}`,
        validParameters: VALID_PARAMS,
        hint: 'Only location, classification, page, and limit are supported'
      });
    }

    // STEP 2: Parse and validate parameters
    const { 
      location = '',
      classification = '',
      page = '1',
      limit = '20'
    } = req.query;
    
    // Validate location (required)
    if (!location || !location.trim()) {
      return res.status(400).json({
        status: 'error',
        statusCode: 400,
        message: 'Parameter "location" is required',
        examples: [
          '/api/search?location=banten',
          '/api/search?location=Jawa Tengah',
          '/api/search?location=jakarta&classification=it-technology'
        ]
      });
    }

    // Parse numeric parameters
    const pageNum = Math.max(parseInt(page) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit) || 20, 1), 30);
    
    // Validate numeric values
    if (isNaN(pageNum) || isNaN(limitNum)) {
      return res.status(400).json({
        status: 'error',
        statusCode: 400,
        message: 'Parameters page and limit must be valid numbers'
      });
    }

    // STEP 3: Normalize inputs
    const normalizedLocation = normalizeLocation(location);
    const normalizedClassification = normalizeClassification(classification);

    if (!normalizedLocation) {
      return res.status(400).json({
        status: 'error',
        statusCode: 400,
        message: 'Invalid location format'
      });
    }

    console.log('[Search API] Request:', { 
      location: normalizedLocation, 
      classification: normalizedClassification,
      page: pageNum,
      limit: limitNum
    });

    // STEP 4: Set cache headers (10 minutes)
    res.setHeader(
      'Cache-Control',
      's-maxage=600, stale-while-revalidate=300'
    );

    // STEP 5: Scrape jobs from JobStreet
    const scrapedData = await scrapeJobs({
      location: normalizedLocation,
      classification: normalizedClassification,
      page: pageNum
    });

    // Handle scraper response format
    const scrapedJobs = scrapedData.jobs || scrapedData;
    const hasNextPage = scrapedData.hasNextPage !== undefined ? scrapedData.hasNextPage : false;

    console.log(`[Search API] Scraped ${scrapedJobs.length} jobs. Has next: ${hasNextPage}`);

    /**
     * Extract jobId from JobStreet URL
     * @param {string} url - JobStreet job URL
     * @returns {string|null} Job ID or null
     */
    const extractJobId = (url) => {
      if (!url) return null;
      const match = url.match(/\/job\/(\d+)/);
      return match ? match[1] : null;
    };

    // STEP 6: Transform jobs to API format
    const jobs = Array.isArray(scrapedJobs) 
      ? scrapedJobs.slice(0, limitNum).map(job => {
          const jobId = extractJobId(job.source_url);
          return {
            jobId: jobId, // ✅ ADDED: jobId for new detail endpoint
            title: job.job_title || 'N/A',
            company: job.company || 'N/A',
            location: job.location || normalizedLocation,
            classification: job.category || 'General',
            salary: job.salary_range || null,
            postedLabel: job.posted_date || null,
            applyUrl: job.source_url || null // For browser redirect only
          };
        })
      : [];

    // STEP 7: Build consistent response
    const response = {
      status: 'success',
      statusCode: 200,
      query: {
        location: normalizedLocation,
        classification: normalizedClassification,
        page: pageNum
      },
      meta: {
        limit: limitNum,
        total: jobs.length,
        hasNextPage: hasNextPage,
        scrapedAt: new Date().toISOString()
      },
      jobs: jobs
    };

    return res.status(200).json(response);

  } catch (error) {
    console.error('[Search API] Error:', error);
    
    // Return 500 only for actual server errors, not user input errors
    return res.status(500).json({
      status: 'error',
      statusCode: 500,
      message: 'Failed to search jobs. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
