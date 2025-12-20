/**
 * Job Finder API - Search & Filter Endpoint
 * 
 * Endpoint: GET /api/search
 * 
 * Query Parameters:
 * - q: Search keyword (job title, company, description)
 * - category: Filter by job category (IT, Marketing, Design, etc)
 * - location: Filter by location (Jakarta, Bandung, etc)
 * - salaryMin: Minimum salary filter (numeric)
 * - jobType: Filter by job type (full-time, part-time, contract, internship)
 * - sort: Sort order (latest, salary, relevance)
 * - page: Page number (default: 1)
 * - limit: Results per page (default: 30, max: 100)
 * 
 * Examples:
 * - /api/search?q=developer&category=IT&location=Jakarta
 * - /api/search?salaryMin=5000000&sort=salary&limit=20
 * - /api/search?jobType=full-time&page=2
 * 
 * Cache Strategy:
 * - 30 minutes cache for search results
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
 * Check if job matches salary minimum
 */
function matchesSalaryMin(job, salaryMin) {
  if (!salaryMin || !job.salary_range) return true;
  
  // Try to extract numeric salary from salary_range string
  // Format examples: "Rp 5.000.000 - Rp 8.000.000", "Rp 5 juta - 8 juta"
  const salaryMatches = job.salary_range.match(/Rp?\s*([\d.,]+)/g);
  if (!salaryMatches || salaryMatches.length === 0) return true;
  
  // Get first salary number (minimum in range)
  const firstSalary = salaryMatches[0]
    .replace(/[Rp\s]/g, '')
    .replace(/\./g, '')
    .replace(/,/g, '');
  
  const jobSalaryMin = parseInt(firstSalary) || 0;
  const requiredMin = parseInt(salaryMin) || 0;
  
  return jobSalaryMin >= requiredMin;
}

/**
 * Check if job matches job type
 */
function matchesJobType(job, jobType) {
  if (!jobType) return true;
  
  const normalizedType = normalizeText(jobType);
  const jobTitle = normalizeText(job.job_title);
  const jobDesc = normalizeText(job.description || '');
  
  const typeKeywords = {
    'full-time': ['full time', 'full-time', 'permanent', 'tetap'],
    'part-time': ['part time', 'part-time', 'paruh waktu'],
    'contract': ['contract', 'kontrak', 'temporary'],
    'internship': ['intern', 'magang', 'internship', 'trainee'],
    'freelance': ['freelance', 'lepas', 'project']
  };
  
  const keywords = typeKeywords[normalizedType] || [normalizedType];
  return keywords.some(kw => jobTitle.includes(kw) || jobDesc.includes(kw));
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
    { name: 'Sales', keywords: ['sales', 'business development', 'account manager', 'relationship'] },
    { name: 'Finance', keywords: ['finance', 'accounting', 'akuntan', 'financial', 'tax'] },
    { name: 'HR', keywords: ['hr', 'human resource', 'recruitment', 'talent'] },
    { name: 'Customer Service', keywords: ['customer service', 'support', 'help desk', 'cs'] },
    { name: 'Operations', keywords: ['operations', 'operational', 'logistic', 'supply chain'] }
  ];
  
  for (const cat of categories) {
    if (cat.keywords.some(kw => title.includes(kw) || description.includes(kw))) {
      return cat.name;
    }
  }
  
  return 'Others';
}

/**
 * Main search handler
 */
module.exports = async (req, res) => {
  try {
    const { 
      q: keyword = '',
      category = '',
      location = '',
      salaryMin = '',
      jobType = '',
      sort = 'latest',
      page = '1',
      limit = '30' 
    } = req.query;
    
    const pageNum = Math.max(parseInt(page) || 1, 1);
    const limitNum = Math.min(parseInt(limit) || 30, 100);
    const offset = (pageNum - 1) * limitNum;

    console.log('[Search API] Query:', { 
      keyword, category, location, salaryMin, jobType, sort, page: pageNum, limit: limitNum 
    });

    /**
     * Cache Strategy:
     * - 30 minutes cache for search results
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

    // Filter by minimum salary
    if (salaryMin) {
      filteredJobs = filteredJobs.filter(job => matchesSalaryMin(job, salaryMin));
      console.log(`[Search API] After salary filter: ${filteredJobs.length} jobs`);
    }

    // Filter by job type
    if (jobType) {
      filteredJobs = filteredJobs.filter(job => matchesJobType(job, jobType));
      console.log(`[Search API] After job type filter: ${filteredJobs.length} jobs`);
    }

    // Sort results
    if (sort === 'salary') {
      // Jobs with salary first, then alphabetical
      filteredJobs.sort((a, b) => {
        const aHasSalary = a.salary_range ? 1 : 0;
        const bHasSalary = b.salary_range ? 1 : 0;
        if (aHasSalary !== bHasSalary) return bHasSalary - aHasSalary;
        return a.job_title.localeCompare(b.job_title);
      });
    } else if (sort === 'relevance' && keyword) {
      // Simple relevance: keyword in title ranks higher
      const normalizedKeyword = normalizeText(keyword);
      filteredJobs.sort((a, b) => {
        const aInTitle = normalizeText(a.job_title).includes(normalizedKeyword) ? 1 : 0;
        const bInTitle = normalizeText(b.job_title).includes(normalizedKeyword) ? 1 : 0;
        return bInTitle - aInTitle;
      });
    }
    // Default 'latest': no sorting needed (scraper returns latest first)

    // Calculate pagination
    const totalResults = filteredJobs.length;
    const totalPages = Math.ceil(totalResults / limitNum);
    const paginatedJobs = filteredJobs.slice(offset, offset + limitNum);

    // Build filter info for response
    const appliedFilters = {};
    if (keyword) appliedFilters.keyword = keyword;
    if (category) appliedFilters.category = category;
    if (location) appliedFilters.location = location;
    if (salaryMin) appliedFilters.salaryMin = salaryMin;
    if (jobType) appliedFilters.jobType = jobType;

    // Success response
    return res.status(200).json({
      status: 'success',
      creator: 'Job Finder API',
      statusCode: 200,
      statusMessage: 'OK',
      message: `Found ${totalResults} jobs matching your criteria`,
      ok: true,
      updated_at: new Date().toISOString(),
      data: {
        jobs: paginatedJobs,
        metadata: {
          total_results: totalResults,
          page: pageNum,
          limit: limitNum,
          total_pages: totalPages,
          has_next: pageNum < totalPages,
          has_previous: pageNum > 1,
          sort_by: sort,
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
