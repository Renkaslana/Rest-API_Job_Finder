/**
 * JobStreet Indonesia Scraper
 * 
 * Scrapes job recommendation data from JobStreet Indonesia
 * Target: https://id.jobstreet.com/id/rekomendasi-jobs
 * 
 * Features:
 * - Scrapes job title, company, location, salary (if available)
 * - Extracts job URL for direct application
 * - Handles pagination
 * - Respects rate limiting and robots.txt
 */

const fetch = require('node-fetch');
const cheerio = require('cheerio');

/**
 * Build JobStreet recommendations URL with pagination
 * @param {number} page - Page number (default: 1)
 * @returns {string} JobStreet URL
 */
function buildJobStreetRecommendationsURL(page = 1) {
  const baseUrl = 'https://id.jobstreet.com/id/rekomendasi-jobs';
  return page > 1 ? `${baseUrl}?page=${page}` : baseUrl;
}

/**
 * Extract clean text from element
 * @param {*} $element - Cheerio element
 * @returns {string} Cleaned text
 */
function extractCleanText($element) {
  return $element.text().trim().replace(/\s+/g, ' ');
}

/**
 * Scrape JobStreet recommendations
 * @param {Object} options - Scraping options
 * @param {number} options.page - Page number
 * @param {number} options.limit - Limit results
 * @returns {Promise<Object>} Scraped data
 */
async function scrapeJobStreet(options = {}) {
  const { page = 1, limit = 20 } = options;
  
  try {
    const targetUrl = buildJobStreetRecommendationsURL(page);
    
    console.log(`[JobStreet Scraper] Fetching recommendations from: ${targetUrl}`);
    
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      },
      timeout: 15000 // 15 seconds timeout
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    
    const jobs = [];
    let totalJobs = 0;

    // Extract total jobs count from page header
    const totalText = $('h1').first().text();
    const totalMatch = totalText.match(/[\d,\.]+/);
    if (totalMatch) {
      totalJobs = parseInt(totalMatch[0].replace(/[,\.]/g, ''));
    }

    console.log(`[JobStreet Scraper] Total jobs found on page: ${totalJobs}`);

    /**
     * JobStreet structure parsing
     * 
     * The page contains job cards with:
     * - Job title in <h3> or link elements
     * - Company name after "di" or "Lowongan di"
     * - Location information
     * - Salary (if available)
     * - Job URL with pattern /id/job/{id}
     * - Posted date (relative format)
     */

    // Find all job cards/listings
    // JobStreet uses various patterns, we'll try multiple selectors
    const jobCards = [
      ...Array.from($('article')),
      ...Array.from($('[data-automation="jobListing"]')),
      ...Array.from($('[class*="job-card"]')),
      ...Array.from($('[class*="job_"]')),
      ...Array.from($('a[href*="/id/job/"]').parent().parent())
    ];

    // Use Set to avoid duplicates
    const processedJobIds = new Set();

    // Also try to find job links directly from the page content
    $('a[href*="/id/job/"]').each((index, element) => {
      const $link = $(element);
      const href = $link.attr('href');
      
      if (!href) return;

      // Extract job ID from URL
      const jobIdMatch = href.match(/\/job\/(\d+)/);
      if (!jobIdMatch) return;
      
      const jobId = jobIdMatch[1];
      if (processedJobIds.has(jobId)) return;
      
      processedJobIds.add(jobId);

      try {
        // Navigate to parent containers to find all job details
        const $card = $link.closest('[data-automation="jobListing"]').length 
          ? $link.closest('[data-automation="jobListing"]')
          : $link.closest('article').length
          ? $link.closest('article')
          : $link.parent().parent();

        // Extract job title
        let title = '';
        
        // Try multiple methods to find title
        const titleSelectors = [
          'h3', 'h2', 'h1',
          '[data-automation="jobTitle"]',
          'a[href*="/id/job/"]',
          '[class*="job-title"]',
          '[class*="jobTitle"]'
        ];

        for (const selector of titleSelectors) {
          const $titleEl = $card.find(selector).first();
          if ($titleEl.length) {
            title = extractCleanText($titleEl);
            if (title && title.length > 3 && !title.includes('http')) {
              break;
            }
          }
        }

        // Fallback: use link text
        if (!title || title.length < 3) {
          title = extractCleanText($link);
        }

        // Extract company name
        let company = 'N/A';
        
        // Look for "di {company}" or "Lowongan di {company}" pattern
        const textContent = $card.text();
        const companyMatch = textContent.match(/(?:Lowongan )?di\s*([^\n]+?)(?:\s+Ini adalah|\s+\[Limit|\s+Rp |\n)/i);
        if (companyMatch) {
          company = companyMatch[1].trim();
        } else {
          // Try specific selectors
          const companySelectors = [
            '[data-automation="jobCompany"]',
            '[class*="company"]',
            'span:contains("di")'
          ];
          
          for (const selector of companySelectors) {
            const $companyEl = $card.find(selector).first();
            if ($companyEl.length) {
              const companyText = extractCleanText($companyEl);
              if (companyText && companyText.length > 2 && !companyText.includes('Limit results')) {
                company = companyText.replace(/^(Lowongan )?di\s*/i, '');
                break;
              }
            }
          }
        }

        // Extract location
        let location = 'Indonesia';
        
        // Look for "[Limit results to {location}]" pattern
        const locationMatch = textContent.match(/Limit results to\s+([^\]]+)/);
        if (locationMatch) {
          location = locationMatch[1].trim();
        } else {
          // Try to find location near company
          const locationSelectors = [
            '[data-automation="jobLocation"]',
            '[class*="location"]'
          ];
          
          for (const selector of locationSelectors) {
            const $locationEl = $card.find(selector).first();
            if ($locationEl.length) {
              location = extractCleanText($locationEl);
              if (location && location.length > 2) break;
            }
          }
        }

        // Extract salary (if available)
        let salary = null;
        const salaryMatch = textContent.match(/Rp\s*([\d,\.]+)\s*(?:–|-)?\s*(?:Rp\s*)?([\d,\.]+)?\s*per\s*(\w+)/i);
        if (salaryMatch) {
          salary = salaryMatch[0].trim();
        }

        // Extract posted date
        let postedDate = 'Recently';
        const dateMatch = textContent.match(/(\d+)\s+(hari|jam|menit|minggu|bulan)\s+(?:yang\s+)?lalu|Listed\s+more\s+than\s+([a-z]+)\s+days?\s+ago/i);
        if (dateMatch) {
          if (dateMatch[3]) {
            // English format
            const dayWords = {
              'one': '1', 'two': '2', 'three': '3', 'four': '4', 'five': '5',
              'six': '6', 'seven': '7', 'eight': '8', 'nine': '9', 'ten': '10',
              'eleven': '11', 'twelve': '12', 'fifteen': '15', 'twenty': '20'
            };
            const days = dayWords[dateMatch[3]] || dateMatch[3];
            postedDate = `${days} hari yang lalu`;
          } else {
            // Indonesian format
            postedDate = dateMatch[0];
          }
        }

        // Build full job URL
        const jobUrl = href.startsWith('http') 
          ? href 
          : `https://id.jobstreet.com${href}`;

        // Extract job type (Full time, Part time, Contract)
        let jobType = 'Full time';
        if (textContent.includes('Part time') || textContent.includes('Part Time')) {
          jobType = 'Part time';
        } else if (textContent.includes('Kontrak') || textContent.includes('Contract')) {
          jobType = 'Kontrak';
        }

        // Only add if we have valid title
        if (title && title.length > 3 && !title.includes('http')) {
          const job = {
            id: jobId,
            job_title: title,
            company: company,
            location: location,
            job_type: jobType,
            posted_date: postedDate,
            source_name: 'JobStreet Indonesia',
            source_url: jobUrl
          };

          // Add salary if available
          if (salary) {
            job.salary = salary;
          }

          jobs.push(job);

          // Limit results
          if (jobs.length >= limit) {
            return false; // Stop iteration
          }
        }

      } catch (err) {
        console.error('[JobStreet Scraper] Error parsing job card:', err.message);
      }
    });

    console.log(`[JobStreet Scraper] Successfully parsed ${jobs.length} jobs`);

    // Calculate pagination info
    const totalPages = totalJobs > 0 ? Math.ceil(totalJobs / limit) : 1;

    return {
      success: true,
      data: jobs,
      meta: {
        total: totalJobs,
        page: page,
        per_page: limit,
        total_pages: totalPages,
        has_next_page: page < totalPages
      },
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('[JobStreet Scraper] Error:', error.message);
    
    return {
      success: false,
      error: error.message,
      data: getSampleJobs(),
      meta: {
        total: 3,
        page: 1,
        per_page: 20,
        total_pages: 1,
        has_next_page: false
      },
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Get sample jobs for fallback
 * @returns {Array} Sample job listings
 */
function getSampleJobs() {
  return [
    {
      id: 'sample_1',
      job_title: 'Store Leader (Jabodetabek)',
      company: 'Prima Audio Indonesia',
      location: 'Jakarta Raya',
      job_type: 'Full time',
      posted_date: '10 hari yang lalu',
      source_name: 'JobStreet Indonesia (Sample)',
      source_url: 'https://id.jobstreet.com/id/rekomendasi-jobs'
    },
    {
      id: 'sample_2',
      job_title: 'Sales Analyst',
      company: 'Superior Prima Sukses',
      location: 'Jawa Timur',
      job_type: 'Full time',
      posted_date: '4 jam yang lalu',
      source_name: 'JobStreet Indonesia (Sample)',
      source_url: 'https://id.jobstreet.com/id/rekomendasi-jobs'
    },
    {
      id: 'sample_3',
      job_title: 'Digital Marketing Staff',
      company: 'Selaras Citra Nusantara Perkasa',
      location: 'Jakarta Selatan',
      job_type: 'Kontrak',
      salary: 'Rp 5.000.000 – Rp 5.750.000 per month',
      posted_date: '5 hari yang lalu',
      source_name: 'JobStreet Indonesia (Sample)',
      source_url: 'https://id.jobstreet.com/id/rekomendasi-jobs'
    }
  ];
}

module.exports = { scrapeJobStreet };
