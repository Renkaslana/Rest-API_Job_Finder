/**
 * Job Finder API - Search Endpoint (LOCATION-FIRST STRATEGY)
 * 
 * Endpoint: GET /api/search
 * 
 * CORE CONCEPT: Search-Result Scraping (NOT crawling)
 * SEARCH IS CONTEXTUAL AND INCREMENTAL (JobStreet-style)
 * 
 * Workflow:
 * 1. Perform BASE SEARCH (usually by location)
 * 2. Dynamically extract classifications from results
 * 3. Allow users to refine by selecting a classification
 * 
 * Query Parameters (ALL OPTIONAL):
 * - q: Job keyword
 * - location: City or region (PRIMARY search context)
 * - category: Job classification (for refinement)
 * - page: Pagination
 * 
 * Examples:
 * - /api/search?location=Tegal
 * - /api/search?location=Tegal&category=Akuntansi
 * - /api/search?q=admin&location=Tegal
 * 
 * Cache Strategy:
 * - 10-15 minutes cache for search results
 */

const scrapeJobs = require('../utils/scraper');
const { extractClassifications } = require('../utils/scraper');

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
 * Main search handler - LOCATION-FIRST STRATEGY
 */
module.exports = async (req, res) => {
  try {
    const { 
      q = '',           // Keyword (optional)
      location = '',    // Location (PRIMARY)
      category = '',    // Classification (for refinement)
      page = '1'        // Pagination
    } = req.query;
    
    const pageNum = Math.max(parseInt(page) || 1, 1);

    console.log('[Search API] LOCATION-FIRST Search:', { 
      q, location, category, page: pageNum 
    });

    /**
     * Cache Strategy:
     * Cache by final JobStreet URL for 10-15 minutes
     */
    res.setHeader(
      'Cache-Control',
      's-maxage=900, stale-while-revalidate'
    );

    /**
     * STEP 1: Scrape jobs from JobStreet
     * 
     * URL will be built as:
     * - location-only: /jobs/in-Tegal
     * - location + category: /jobs/in-Tegal?classification=Akuntansi
     * - keyword + location: /jobs/in-Tegal?q=admin
     */
    const scrapedJobs = await scrapeJobs({
      q: q || null,
      location: location || null,
      category: category || null,
      page: pageNum
    });

    console.log(`[Search API] Scraped ${scrapedJobs.length} jobs from JobStreet`);

    /**
     * STEP 2: Extract dynamic classifications from results
     * 
     * This analyzes job.category from scraped results
     * and generates filters with counts.
     * 
     * Only computed if category filter is NOT applied
     * (to show available refinement options)
     */
    const classifications = extractClassifications(scrapedJobs);
    
    console.log(`[Search API] Extracted ${classifications.length} classifications`);

    /**
     * STEP 3: Transform jobs to API format
     */
    const jobs = scrapedJobs.map(job => ({
      title: job.job_title,
      company: job.company,
      location: job.location,
      category: job.category || 'Lainnya',
      salary: job.salary_range || null,
      postedAgo: job.posted_date,
      detailUrl: job.source_url,
      description: job.description || null
    }));

    /**
     * STEP 4: Build response with required structure
     */
    const response = {
      query: {
        q: q || null,
        location: location || null,
        category: category || null,
        page: pageNum
      },
      meta: {
        totalJobs: jobs.length,
        source: 'jobstreet',
        scrapedAt: new Date().toISOString()
      },
      classifications: classifications,
      jobs: jobs
    };

    return res.status(200).json(response);

  } catch (error) {
    console.error('[Search API] Error:', error);
    
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to search jobs',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
