/**
 * Vercel Serverless Function - Job Detail
 * Endpoint: GET /api/job?url=<jobstreet_url>
 * 
 * Scrape detail lengkap dari 1 job posting termasuk full description
 */

import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

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

  const { url } = req.query;

  if (!url) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Missing required parameter: url',
      example: '/api/job?url=https://id.jobstreet.com/id/job/12345678'
    });
  }

  // Validasi URL harus dari JobStreet
  if (!url.includes('jobstreet.com')) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Invalid URL. Only JobStreet URLs are supported.'
    });
  }

  try {
    console.log('[Job Detail] Fetching:', url);

    // Fetch job detail page
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7'
      },
      timeout: 10000
    });

    if (!response.ok) {
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

    // Extract FULL description - ini yang penting!
    let description = '';
    let requirements = [];
    
    // JobStreet renders content in <p> tags
    // Collect all meaningful paragraphs
    const allParagraphs = [];
    $('p').each((i, elem) => {
      const text = $(elem).text().trim();
      // Filter out short text and navigation/footer content
      if (text.length > 30 && !text.includes('cookie') && !text.includes('JobStreet')) {
        allParagraphs.push(text);
      }
    });
    
    // Combine paragraphs into full description
    if (allParagraphs.length > 0) {
      description = allParagraphs.join('\n\n');
    } else {
      // Fallback: try to get any div text content
      description = 'Deskripsi tidak tersedia. JobStreet menggunakan JavaScript rendering. Silakan kunjungi link asli untuk melihat detail lengkap.';
    }

    // Extract requirements from list items
    $('li').each((i, elem) => {
      const text = $(elem).text().trim();
      if (text.length > 10 && text.length < 500) {
        requirements.push(text);
      }
    });

    // Build response
    const jobDetail = {
      job_title: jobTitle || 'N/A',
      company: company,
      location: location,
      salary_range: salary,
      job_type: jobType,
      posted_date: postedDate,
      description: description || 'Deskripsi tidak tersedia. JobStreet menggunakan JavaScript rendering.',
      requirements: requirements.length > 0 ? requirements.slice(0, 10) : null,
      source_name: 'JobStreet Indonesia',
      source_url: url
    };

    console.log('[Job Detail] Successfully scraped job:', jobTitle);

    return res.status(200).json({
      status: 'success',
      creator: 'Job Finder API',
      statusCode: 200,
      statusMessage: 'OK',
      message: 'Job detail retrieved successfully',
      ok: true,
      updated_at: new Date().toISOString(),
      data: jobDetail
    });

  } catch (error) {
    console.error('[Job Detail] Error:', error);
    
    return res.status(500).json({
      status: 'error',
      creator: 'Job Finder API',
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: 'Failed to scrape job detail',
      error: error.message,
      ok: false
    });
  }
}
