/**
 * Scraper untuk JobStreet Latest Jobs
 * Sumber: https://id.jobstreet.com/id/terbaru-jobs?pos=1
 * 
 * Aturan:
 * - Maksimal 5-8 job saja
 * - TANPA pagination
 * - Hanya untuk Home Highlight
 * - jobId WAJIB diekstrak dari URL
 */

const fetch = require('node-fetch');
const cheerio = require('cheerio');

/**
 * Extract jobId from JobStreet URL
 * @param {string} url - JobStreet job URL
 * @returns {string|null} Job ID or null
 */
function extractJobId(url) {
  if (!url) return null;
  const match = url.match(/\/job\/(\d+)/);
  return match ? match[1] : null;
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
 * Scrape latest jobs from JobStreet
 * @param {Object} options - Scraping options
 * @param {number} options.limit - Max jobs to return (default: 6)
 * @returns {Promise<Array>} Array of job objects
 */
async function scrapeLatestJobs(options = {}) {
  const { limit = 6 } = options;
  const MAX_LIMIT = 8; // Maksimal 8 sesuai requirement
  
  const actualLimit = Math.min(limit, MAX_LIMIT);
  
  try {
    const targetUrl = 'https://id.jobstreet.com/id/terbaru-jobs?pos=1';
    
    console.log(`[Latest Jobs Scraper] Fetching from: ${targetUrl}`);
    console.log(`[Latest Jobs Scraper] Limit: ${actualLimit} jobs`);
    
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
    const processedJobIds = new Set();

    // Find all job links
    $('a[href*="/id/job/"]').each((index, element) => {
      if (jobs.length >= actualLimit) {
        return false; // Stop iteration
      }

      const $link = $(element);
      const href = $link.attr('href');
      
      if (!href) return;

      // Extract job ID from URL
      const jobId = extractJobId(href);
      if (!jobId || processedJobIds.has(jobId)) {
        return; // Skip if no jobId or duplicate
      }
      
      processedJobIds.add(jobId);

      try {
        // Navigate to parent container
        const $card = $link.closest('[data-automation="jobListing"]').length 
          ? $link.closest('[data-automation="jobListing"]')
          : $link.closest('article').length
          ? $link.closest('article')
          : $link.parent().parent();

        // Extract job title
        let title = '';
        const titleSelectors = [
          'h3', 'h2', 'h1',
          '[data-automation="jobTitle"]',
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
        const textContent = $card.text();
        const companyMatch = textContent.match(/(?:Lowongan )?di\s+([^\n•]+?)(?:\s*•|\s*Akan|\s*Dibutuhkan|\s*\d+\s*hari|\s*$)/i);
        if (companyMatch) {
          company = companyMatch[1].trim();
        } else {
          const companySelectors = [
            '[data-automation="jobCompany"]',
            '[class*="company"]'
          ];
          
          for (const selector of companySelectors) {
            const $companyEl = $card.find(selector).first();
            if ($companyEl.length) {
              const companyText = extractCleanText($companyEl);
              if (companyText && companyText.length > 2) {
                company = companyText.replace(/^(Lowongan )?di\s*/i, '').trim();
                break;
              }
            }
          }
        }

        // Extract location
        let location = 'Indonesia';
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

        // Extract classification (category)
        let classification = null;
        const categorySelectors = [
          '[data-automation="jobClassification"]',
          '[class*="classification"]',
          '[class*="category"]'
        ];
        
        for (const selector of categorySelectors) {
          const $categoryEl = $card.find(selector).first();
          if ($categoryEl.length) {
            classification = extractCleanText($categoryEl);
            if (classification && classification.length > 2) break;
          }
        }

        // Extract salary
        let salary = null;
        const salaryMatch = textContent.match(/Rp\s*([\d,\.]+)\s*(?:–|-)?\s*(?:Rp\s*)?([\d,\.]+)?\s*per\s*(\w+)/i);
        if (salaryMatch) {
          salary = salaryMatch[0].trim();
        }

        // Extract posted date
        let postedLabel = 'N/A';
        const datePatterns = [
          /(\d+\s+(?:hari|jam|menit|minggu|bulan)\s+(?:yang\s+)?lalu)/i,
          /(Baru\s+saja|Recently)/i,
          /(Hari\s+ini|Today)/i,
          /(Kemarin|Yesterday)/i
        ];
        
        for (const pattern of datePatterns) {
          const match = textContent.match(pattern);
          if (match) {
            postedLabel = match[1] || match[0];
            break;
          }
        }

        // Build full job URL
        const applyUrl = href.startsWith('http') 
          ? href 
          : `https://id.jobstreet.com${href.startsWith('/') ? '' : '/'}${href}`;

        // Only add if we have valid title and jobId
        if (title && title.length > 3 && jobId && !title.includes('http')) {
          const job = {
            jobId: jobId,
            title: title,
            company: company,
            location: location,
            classification: classification,
            salary: salary,
            postedLabel: postedLabel,
            applyUrl: applyUrl
          };

          jobs.push(job);
        }

      } catch (err) {
        console.error('[Latest Jobs Scraper] Error parsing job card:', err.message);
      }
    });

    console.log(`[Latest Jobs Scraper] Successfully parsed ${jobs.length} jobs`);

    // Return jobs (max limit)
    return jobs.slice(0, actualLimit);

  } catch (error) {
    console.error('[Latest Jobs Scraper] Error:', error.message);
    
    // Return empty array on error (no fallback data as per requirement)
    return [];
  }
}

module.exports = { scrapeLatestJobs };

