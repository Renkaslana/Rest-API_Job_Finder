/**
 * Job Finder API - Jobs List Endpoint
 * 
 * Endpoint: GET /api/jobs
 * 
 * Query Parameters:
 * - limit: Number of jobs to return (default: 30, max: 100)
 * - sort: Sort order (latest, salary)
 * - salary: Filter only jobs with salary info (true/false)
 * 
 * Used for: Home screen recommended jobs
 * 
 * Cache Strategy:
 * - s-maxage=900 (15 minutes CDN cache)
 * - stale-while-revalidate
 */

const scrapeJobs = require('../utils/scraper');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  
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
    const {
      limit = '30',
      sort = 'latest',
      salary = 'false'
    } = req.query;

    const limitNum = Math.min(parseInt(limit) || 30, 100);
    const onlyWithSalary = salary === 'true';

    // Cache headers
    res.setHeader(
      'Cache-Control', 
      's-maxage=900, stale-while-revalidate'
    );

    // Scrape jobs from source
    let jobs = await scrapeJobs();

    // Filter: only jobs with salary (if requested)
    if (onlyWithSalary) {
      jobs = jobs.filter(job => job.salary_range && job.salary_range.length > 0);
    }

    // Sort jobs
    if (sort === 'salary') {
      // Sort by salary (jobs with salary first, then by title)
      jobs.sort((a, b) => {
        const aHasSalary = a.salary_range ? 1 : 0;
        const bHasSalary = b.salary_range ? 1 : 0;
        return bHasSalary - aHasSalary;
      });
    } else {
      // Default: latest (no change needed, scraper returns latest first)
    }

    // Apply limit
    const limitedJobs = jobs.slice(0, limitNum);

    // Success response
    return res.status(200).json({
      status: 'success',
      creator: 'Job Finder API',
      statusCode: 200,
      statusMessage: 'OK',
      message: `Successfully fetched ${limitedJobs.length} jobs`,
      ok: true,
      updated_at: new Date().toISOString(),
      data: {
        jobs: limitedJobs,
        metadata: {
          total: limitedJobs.length,
          total_available: jobs.length,
          filters_applied: {
            limit: limitNum,
            sort: sort,
            only_with_salary: onlyWithSalary
          },
          scraping_method: 'on-request',
          cache_duration: '15 minutes'
        }
      }
    });

  } catch (error) {
    console.error('Scraping error:', error);
    
    // Error response
    return res.status(500).json({
      status: 'error',
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: 'Failed to scrape job listings',
      ok: false,
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal error'
    });
  }
};
