/**
 * Vercel Serverless Function - Job Detail by ID
 * Endpoint: GET /api/jobs/:jobId
 * 
 * REFACTORED ENDPOINT - Stable & Consistent
 * 
 * Changes from /api/job?url=...:
 * - Uses jobId as path parameter (clean, no URL encoding needed)
 * - Builds JobStreet URL internally
 * - Better error handling (400 for invalid jobId, 404 for not found)
 * - Consistent response format
 * 
 * Example:
 * GET /api/jobs/89023836
 * 
 * Response:
 * {
 *   "jobId": "89023836",
 *   "title": "Area Workshop Manager",
 *   "company": "Perusahaan Rahasia",
 *   "location": "Jawa Tengah",
 *   "classification": "IT & Teknologi",
 *   "salary": "Rp 7.000.000 - Rp 9.000.000",
 *   "postedLabel": "Baru saja",
 *   "description": [...],
 *   "requirements": [...],
 *   "applyUrl": "https://id.jobstreet.com/id/job/89023836"
 * }
 */

import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

/**
 * Extract jobId from JobStreet URL
 * @param {string} url - JobStreet job URL
 * @returns {string|null} Job ID or null if not found
 */
function extractJobIdFromUrl(url) {
  if (!url) return null;
  const match = url.match(/\/job\/(\d+)/);
  return match ? match[1] : null;
}

/**
 * Build JobStreet job detail URL from jobId
 * @param {string} jobId - Job ID
 * @returns {string} Full JobStreet URL
 */
function buildJobStreetUrl(jobId) {
  return `https://id.jobstreet.com/id/job/${jobId}`;
}

/**
 * Validate jobId format
 * @param {string} jobId - Job ID to validate
 * @returns {boolean} True if valid
 */
function isValidJobId(jobId) {
  if (!jobId || typeof jobId !== 'string') return false;
  // JobStreet jobId is numeric, typically 6-10 digits
  return /^\d{6,10}$/.test(jobId.trim());
}

/**
 * Scrape job detail from JobStreet
 * @param {string} url - JobStreet job URL
 * @returns {Promise<Object>} Scraped job data
 */
async function scrapeJobDetail(url) {
  console.log('[Job Detail] Fetching:', url);

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7'
    },
    timeout: 10000
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('JOB_NOT_FOUND');
    }
    throw new Error(`Failed to fetch job detail: ${response.status}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  // Extract job details
  const jobTitle = $('h1[data-automation="job-detail-title"]').text().trim() 
                || $('h1').first().text().trim();
  
  const company = $('[data-automation="advertiser-name"]').text().trim() 
               || $('span:contains("Company")').next().text().trim()
               || 'N/A';
  
  const location = $('[data-automation="job-detail-location"]').text().trim()
                || $('span:contains("Location")').next().text().trim()
                || 'N/A';
  
  const salary = $('[data-automation="job-detail-salary"]').text().trim()
              || $('span:contains("Salary")').next().text().trim()
              || null;
  
  const jobType = $('[data-automation="job-detail-work-type"]').text().trim()
               || $('span:contains("Job type")').next().text().trim()
               || null;
  
  const postedDate = $('[data-automation="job-detail-date"]').text().trim()
                  || $('span:contains("Posted")').next().text().trim()
                  || 'N/A';

  // Extract FULL description as array of paragraphs
  let description = [];
  let requirements = [];
  
  // JobStreet renders content in <p> tags
  $('p').each((i, elem) => {
    const text = $(elem).text().trim();
    // Filter out short text and navigation/footer content
    if (text.length > 30 && !text.includes('cookie') && !text.includes('JobStreet')) {
      description.push(text);
    }
  });
  
  // Fallback if no description found
  if (description.length === 0) {
    description = ['Deskripsi tidak tersedia. JobStreet menggunakan JavaScript rendering. Silakan kunjungi link asli untuk melihat detail lengkap.'];
  }

  // Extract requirements from list items
  $('li').each((i, elem) => {
    const text = $(elem).text().trim();
    if (text.length > 10 && text.length < 500) {
      requirements.push(text);
    }
  });

  // Check if job was found (basic validation)
  if (!jobTitle || jobTitle.length < 3) {
    throw new Error('JOB_NOT_FOUND');
  }

  return {
    jobTitle: jobTitle || 'N/A',
    company: company,
    location: location,
    salary: salary,
    jobType: jobType,
    postedDate: postedDate,
    description: description, // Array of paragraphs
    requirements: requirements.length > 0 ? requirements.slice(0, 20) : []
  };
}

export default async function handler(req, res) {
  // Set cache headers (15 minutes)
  res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({
      status: 'error',
      statusCode: 405,
      message: 'Method not allowed. Use GET request.'
    });
  }

  // Get jobId from path parameter (Vercel dynamic routes use req.query)
  const { jobId } = req.query;

  // Validate jobId is provided
  if (!jobId) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Missing required parameter: jobId',
      example: '/api/jobs/89023836'
    });
  }

  // Validate jobId format
  if (!isValidJobId(jobId)) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Invalid jobId format. JobId must be numeric (6-10 digits).',
      received: jobId,
      example: '/api/jobs/89023836'
    });
  }

  try {
    // Build JobStreet URL internally
    const jobStreetUrl = buildJobStreetUrl(jobId);
    console.log('[Job Detail] Built URL:', jobStreetUrl);

    // Scrape job detail
    const scrapedData = await scrapeJobDetail(jobStreetUrl);

    // Build response in new format
    const response = {
      status: 'success',
      statusCode: 200,
      message: 'Job detail retrieved successfully',
      jobId: jobId,
      title: scrapedData.jobTitle,
      company: scrapedData.company,
      location: scrapedData.location,
      classification: null, // Will be extracted if needed
      salary: scrapedData.salary,
      postedLabel: scrapedData.postedDate,
      jobType: scrapedData.jobType,
      description: scrapedData.description,
      requirements: scrapedData.requirements,
      applyUrl: jobStreetUrl,
      updated_at: new Date().toISOString()
    };

    console.log('[Job Detail] Successfully scraped job:', scrapedData.jobTitle);

    return res.status(200).json(response);

  } catch (error) {
    console.error('[Job Detail] Error:', error.message);

    // Handle job not found (404)
    if (error.message === 'JOB_NOT_FOUND') {
      return res.status(404).json({
        status: 'error',
        statusCode: 404,
        message: `Job with ID '${jobId}' not found on JobStreet`,
        jobId: jobId,
        hint: 'The job may have been removed or the jobId is incorrect.'
      });
    }

    // Handle other errors (500)
    return res.status(500).json({
      status: 'error',
      statusCode: 500,
      message: 'Failed to scrape job detail',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      jobId: jobId
    });
  }
}

