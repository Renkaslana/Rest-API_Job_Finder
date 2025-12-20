/**
 * Job Finder API - Search & Filter Endpoint
 * 
 * Endpoint: GET /api/search?q=keyword&category=IT&location=Jakarta
 * 
 * Query Parameters:
 * - q: Search keyword (job title, company, description)
 * - category: Filter by job category (IT, Marketing, Design, etc)
 * - location: Filter by location (Jakarta, Bandung, Surabaya, etc)
 * - limit: Limit results (default: 30, max: 100)
 * 
 * Examples:
 * - /api/search?q=developer
 * - /api/search?category=IT&location=Jakarta
 * - /api/search?q=programmer&category=IT&location=Jakarta&limit=20
 * 
 * Cache Strategy:
 * - Longer cache for specific queries (30 minutes)
 * - Dynamic cache based on params
 */

const scrapeJobs = require('../utils/scraper');

/**
 * Normalize text for better matching
 */
function normalizeText(text) {
  if (!text) return '';
  return text.toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Check if job matches search keyword
 */
function matchesKeyword(job, keyword) {
  if (!keyword) return true;
  
  const normalizedKeyword = normalizeText(keyword);
  const searchableText = normalizeText(
    `${job.job_title} ${job.company} ${job.description || ''}`
  );
  
  return searchableText.includes(normalizedKeyword);
}

/**
 * Check if job matches category
 */
function matchesCategory(job, category) {
  if (!category || category === 'Semua') return true;
  
  const normalizedCategory = normalizeText(category);
  const jobTitle = normalizeText(job.job_title);
  const description = normalizeText(job.description || '');
  
  // Category keywords mapping
  const categoryKeywords = {
    'it': ['developer', 'programmer', 'software', 'engineer', 'web', 'mobile', 'frontend', 'backend', 'fullstack', 'devops', 'data', 'qa', 'testing', 'it', 'technology', 'tech'],
    'design': ['designer', 'design', 'ui', 'ux', 'graphic', 'visual', 'creative', 'art'],
    'marketing': ['marketing', 'digital marketing', 'social media', 'seo', 'content', 'brand', 'campaign'],
    'sales': ['sales', 'business development', 'account', 'relationship'],
    'finance': ['finance', 'accounting', 'akuntan', 'financial', 'tax'],
    'hr': ['hr', 'human resource', 'recruitment', 'talent', 'people'],
    'customer service': ['customer service', 'support', 'help desk', 'cs'],
    'operations': ['operations', 'operational', 'logistic', 'supply chain'],
    'management': ['manager', 'management', 'director', 'head', 'lead', 'supervisor'],
    'education': ['teacher', 'guru', 'education', 'training', 'tutor'],
    'healthcare': ['doctor', 'nurse', 'medical', 'health', 'pharmacy'],
    'engineering': ['engineering', 'civil', 'mechanical', 'electrical', 'teknik']
  };
  
  const keywords = categoryKeywords[normalizedCategory] || [normalizedCategory];
  
  // Check if any keyword matches
  return keywords.some(keyword => 
    jobTitle.includes(keyword) || description.includes(keyword)
  );
}

/**
 * Check if job matches location
 */
function matchesLocation(job, location) {
  if (!location || location === 'Semua Lokasi') return true;
  
  const normalizedLocation = normalizeText(location);
  const jobLocation = normalizeText(job.location);
  
  return jobLocation.includes(normalizedLocation);
}

/**
 * Extract category from job data
 */
function extractCategory(job) {
  const title = normalizeText(job.job_title);
  const description = normalizeText(job.description || '');
  
  // Priority order for category detection
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
    // Extract query parameters
    const { 
      q: keyword = '', 
      category = '', 
      location = '', 
      limit = '30' 
    } = req.query;
    
    const maxResults = Math.min(parseInt(limit) || 30, 100);

    console.log('[Search API] Query:', { keyword, category, location, limit: maxResults });

    /**
     * Cache Strategy:
     * - Longer cache for specific queries (1800s = 30 min)
     * - This reduces scraping load for popular searches
     */
    res.setHeader(
      'Cache-Control', 
      's-maxage=1800, stale-while-revalidate'
    );

    // Scrape all jobs
    let jobs = await scrapeJobs();

    // Add category field to each job
    jobs = jobs.map(job => ({
      ...job,
      category: extractCategory(job)
    }));

    // Apply filters
    let filteredJobs = jobs;

    // Filter by keyword
    if (keyword) {
      filteredJobs = filteredJobs.filter(job => matchesKeyword(job, keyword));
      console.log(`[Search API] After keyword filter: ${filteredJobs.length} jobs`);
    }

    // Filter by category
    if (category) {
      filteredJobs = filteredJobs.filter(job => matchesCategory(job, category));
      console.log(`[Search API] After category filter: ${filteredJobs.length} jobs`);
    }

    // Filter by location
    if (location) {
      filteredJobs = filteredJobs.filter(job => matchesLocation(job, location));
      console.log(`[Search API] After location filter: ${filteredJobs.length} jobs`);
    }

    // Limit results
    const limitedJobs = filteredJobs.slice(0, maxResults);

    // Build filter info for response
    const appliedFilters = {};
    if (keyword) appliedFilters.keyword = keyword;
    if (category) appliedFilters.category = category;
    if (location) appliedFilters.location = location;

    // Success response
    return res.status(200).json({
      status: 'success',
      creator: 'Job Finder API',
      statusCode: 200,
      statusMessage: 'OK',
      message: `Found ${limitedJobs.length} jobs matching your criteria`,
      ok: true,
      updated_at: new Date().toISOString(),
      data: {
        jobs: limitedJobs,
        metadata: {
          total: limitedJobs.length,
          total_before_limit: filteredJobs.length,
          scraping_method: 'on-request',
          cache_duration: '30 minutes',
          filters_applied: appliedFilters
        }
      }
    });

  } catch (error) {
    console.error('[Search API] Error:', error);
    
    return res.status(500).json({
      status: 'error',
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: 'Failed to search jobs',
      ok: false,
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal error'
    });
  }
};
