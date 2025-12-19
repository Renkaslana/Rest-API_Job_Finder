/**
 * Job Finder API - Serverless Function
 * 
 * Endpoint: GET /api/jobs
 * 
 * Fungsi:
 * - On-request scraping dari halaman job listing publik
 * - Parse metadata lowongan kerja (bukan full description)
 * - Return JSON terstruktur dengan cache headers
 * 
 * Cache Strategy:
 * - s-maxage=900 (15 menit di CDN)
 * - stale-while-revalidate (serve stale content saat re-fetch)
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

  // Hanya terima GET request
  if (req.method !== 'GET') {
    return res.status(405).json({
      status: 'error',
      statusCode: 405,
      message: 'Method not allowed. Use GET.'
    });
  }

  try {
    /**
     * Cache Headers:
     * - s-maxage=900: Cache di CDN selama 15 menit (900 detik)
     * - stale-while-revalidate: Jika cache expired, serve stale data
     *   sambil fetch data baru di background
     * 
     * Ini mengurangi load scraping dan mempercepat response time
     */
    res.setHeader(
      'Cache-Control', 
      's-maxage=900, stale-while-revalidate'
    );

    /**
     * On-Request Scraping:
     * Setiap kali endpoint ini diakses atau di-refresh,
     * sistem akan melakukan HTTP request ke target website
     * dan parse metadata terbaru
     */
    const jobs = await scrapeJobs();

    // Success response dengan format terstruktur
    return res.status(200).json({
      status: 'success',
      creator: 'Job Finder API',
      statusCode: 200,
      statusMessage: 'OK',
      message: `Successfully scraped ${jobs.length} jobs`,
      ok: true,
      updated_at: new Date().toISOString(),
      data: {
        jobs: jobs,
        metadata: {
          total: jobs.length,
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
