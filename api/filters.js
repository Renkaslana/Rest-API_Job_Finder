/**
 * Job Finder API - Get Available Filters
 * 
 * Endpoint: GET /api/filters
 * 
 * Returns available categories and locations for filtering
 * This helps the app populate filter dropdowns
 * 
 * Cache Strategy:
 * - Long cache (1 hour) since filters don't change often
 */

const scrapeJobs = require('../utils/scraper');

/**
 * Extract unique locations from jobs
 */
function extractLocations(jobs) {
  const locations = new Set();
  
  jobs.forEach(job => {
    if (job.location && job.location !== 'N/A') {
      // Clean location string
      const cleanLocation = job.location
        .replace(/\s+/g, ' ')
        .trim();
      locations.add(cleanLocation);
    }
  });
  
  return Array.from(locations).sort();
}

/**
 * Normalize text for category detection
 */
function normalizeText(text) {
  if (!text) return '';
  return text.toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extract category from job data
 */
function extractCategory(job) {
  const title = normalizeText(job.job_title);
  const description = normalizeText(job.description || '');
  
  const categories = [
    { name: 'IT', keywords: ['developer', 'programmer', 'software', 'engineer', 'web', 'mobile', 'frontend', 'backend', 'fullstack', 'devops', 'data scientist', 'qa', 'testing', 'it support', 'system'] },
    { name: 'Design', keywords: ['designer', 'design', 'ui/ux', 'graphic', 'visual', 'creative'] },
    { name: 'Marketing', keywords: ['marketing', 'digital marketing', 'seo', 'content', 'social media', 'brand'] },
    { name: 'Sales', keywords: ['sales', 'business development', 'account executive'] },
    { name: 'Finance', keywords: ['finance', 'accounting', 'akuntan', 'financial analyst', 'tax'] },
    { name: 'HR', keywords: ['hr', 'human resource', 'recruitment', 'talent'] },
    { name: 'Customer Service', keywords: ['customer service', 'support', 'cs', 'help desk'] },
    { name: 'Operations', keywords: ['operations', 'operational', 'logistic', 'supply chain'] },
    { name: 'Management', keywords: ['manager', 'director', 'head of', 'lead', 'supervisor'] },
    { name: 'Education', keywords: ['teacher', 'guru', 'education', 'training', 'tutor'] },
    { name: 'Healthcare', keywords: ['doctor', 'nurse', 'medical', 'pharmacy'] },
    { name: 'Engineering', keywords: ['engineering', 'civil engineer', 'mechanical', 'electrical'] }
  ];
  
  for (const category of categories) {
    if (category.keywords.some(kw => title.includes(kw) || description.includes(kw))) {
      return category.name;
    }
  }
  
  return 'Umum';
}

/**
 * Get category distribution from jobs
 */
function getCategoryDistribution(jobs) {
  const distribution = {};
  
  jobs.forEach(job => {
    const category = extractCategory(job);
    distribution[category] = (distribution[category] || 0) + 1;
  });
  
  // Convert to array and sort by count
  return Object.entries(distribution)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

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
    /**
     * Long cache for filter data (3600s = 1 hour)
     * Filters don't change frequently
     */
    res.setHeader(
      'Cache-Control', 
      's-maxage=3600, stale-while-revalidate'
    );

    console.log('[Filters API] Fetching available filters...');

    // Scrape jobs to analyze available filters
    const jobs = await scrapeJobs();

    // Extract locations
    const locations = extractLocations(jobs);

    // Get category distribution
    const categories = getCategoryDistribution(jobs);

    // Success response
    return res.status(200).json({
      status: 'success',
      creator: 'Job Finder API',
      statusCode: 200,
      statusMessage: 'OK',
      message: 'Filters retrieved successfully',
      ok: true,
      updated_at: new Date().toISOString(),
      data: {
        categories: categories,
        locations: locations,
        metadata: {
          total_jobs_analyzed: jobs.length,
          total_categories: categories.length,
          total_locations: locations.length,
          cache_duration: '1 hour'
        }
      }
    });

  } catch (error) {
    console.error('[Filters API] Error:', error);
    
    // Return default filters on error
    return res.status(200).json({
      status: 'success',
      creator: 'Job Finder API',
      statusCode: 200,
      statusMessage: 'OK',
      message: 'Returning default filters',
      ok: true,
      updated_at: new Date().toISOString(),
      data: {
        categories: [
          { name: 'IT', count: 0 },
          { name: 'Design', count: 0 },
          { name: 'Marketing', count: 0 },
          { name: 'Sales', count: 0 },
          { name: 'Finance', count: 0 }
        ],
        locations: ['Jakarta', 'Bandung', 'Surabaya', 'Semarang', 'Medan'],
        metadata: {
          total_jobs_analyzed: 0,
          total_categories: 5,
          total_locations: 5,
          cache_duration: '1 hour',
          note: 'Default filters due to scraping error'
        }
      }
    });
  }
};
