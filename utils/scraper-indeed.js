/**
 * Alternatif Scraper untuk Indeed Indonesia
 * 
 * Indeed lebih simple karena:
 * - Less JavaScript rendering
 * - Struktur HTML lebih jelas
 * - Data lebih mudah di-parse
 */

const fetch = require('node-fetch');
const cheerio = require('cheerio');

async function scrapeIndeed() {
  try {
    const TARGET_URL = 'https://id.indeed.com/jobs?q=programmer&l=Jakarta';
    
    console.log(`[Scraper] Fetching jobs from Indeed Indonesia...`);
    
    const response = await fetch(TARGET_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'id-ID,id;q=0.9,en;q=0.8'
      },
      timeout: 10000
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const jobs = [];

    // Indeed structure: job cards dengan class berisi 'job'
    $('[class*="job"], .jobsearch-ResultsList > li, .job_seen_beacon').each((index, element) => {
      try {
        const $card = $(element);
        
        // Title
        const title = $card.find('h2, [class*="jobTitle"], a[data-jk]')
          .first()
          .text()
          .trim();
        
        // Company
        const company = $card.find('[class*="companyName"], .companyName, [data-testid="company-name"]')
          .first()
          .text()
          .trim();
        
        // Location
        const location = $card.find('[class*="companyLocation"], .companyLocation, [data-testid="text-location"]')
          .first()
          .text()
          .trim();
        
        // Job URL
        let jobUrl = $card.find('a[data-jk], h2 a').first().attr('href');
        if (jobUrl && !jobUrl.startsWith('http')) {
          jobUrl = `https://id.indeed.com${jobUrl}`;
        }
        
        if (title && title.length > 3) {
          jobs.push({
            job_title: title,
            company: company || 'N/A',
            location: location || 'Indonesia',
            posted_date: 'Recently',
            source_name: 'Indeed Indonesia',
            source_url: jobUrl || TARGET_URL
          });
        }
        
      } catch (err) {
        // Skip error
      }
    });

    console.log(`[Scraper] Found ${jobs.length} jobs from Indeed`);
    return jobs.length > 0 ? jobs : getSampleJobs();

  } catch (error) {
    console.error('[Scraper] Error:', error.message);
    return getSampleJobs();
  }
}

function getSampleJobs() {
  return [
    {
      job_title: 'Full Stack Developer',
      company: 'PT Tech Indonesia',
      location: 'Jakarta',
      posted_date: '2 hari lalu',
      source_name: 'Sample Data',
      source_url: 'https://example.com/job/1'
    },
    {
      job_title: 'UI/UX Designer',
      company: 'Creative Studio',
      location: 'Bandung',
      posted_date: '3 hari lalu',
      source_name: 'Sample Data',
      source_url: 'https://example.com/job/2'
    },
    {
      job_title: 'Data Analyst',
      company: 'Finance Corp',
      location: 'Surabaya',
      posted_date: '1 minggu lalu',
      source_name: 'Sample Data',
      source_url: 'https://example.com/job/3'
    }
  ];
}

module.exports = scrapeIndeed;
