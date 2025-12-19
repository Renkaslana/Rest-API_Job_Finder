/**
 * Simple Test Server (tanpa Vercel)
 * 
 * Untuk test API secara local sebelum deploy
 * Run: node test-server.js
 */

const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const scrapeJobs = require('./utils/scraper');

const PORT = 3000;

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  // Root endpoint - serve documentation HTML
  if (parsedUrl.pathname === '/') {
    const htmlPath = path.join(__dirname, 'public', 'index.html');
    
    try {
      const htmlContent = fs.readFileSync(htmlPath, 'utf8');
      res.setHeader('Content-Type', 'text/html');
      return res.end(htmlContent);
    } catch (error) {
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({
        status: 'success',
        message: 'Welcome to Job Finder API - Local Test Server',
        version: '2.0.0',
        endpoints: {
          documentation: '/ (HTML documentation)',
          jobs: '/api/jobs'
        }
      }, null, 2));
    }
  }
  
  // Jobs endpoint
  if (parsedUrl.pathname === '/api/jobs') {
    res.setHeader('Content-Type', 'application/json');
    console.log('\n🔍 Scraping jobs...');
    
    try {
      const jobs = await scrapeJobs();
      
      res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate');
      
      return res.end(JSON.stringify({
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
            cache_duration: '15 minutes',
            source: 'JobStreet Indonesia'
          }
        }
      }, null, 2));
      
    } catch (error) {
      console.error('Error:', error);
      return res.end(JSON.stringify({
        status: 'error',
        statusCode: 500,
        message: 'Failed to scrape jobs',
        error: error.message
      }, null, 2));
    }
  }
  
  // 404
  res.statusCode = 404;
  res.end(JSON.stringify({
    status: 'error',
    statusCode: 404,
    message: 'Endpoint not found'
  }, null, 2));
});

server.listen(PORT, () => {
  console.log('\n🚀 Job Finder API - Test Server Running!\n');
  console.log('━'.repeat(50));
  console.log(`📡 Server: http://localhost:${PORT}`);
  console.log(`📋 API Endpoint: http://localhost:${PORT}/api/jobs`);
  console.log('━'.repeat(50));
  console.log('\n💡 Tips:');
  console.log('   - Buka browser: http://localhost:3000/api/jobs');
  console.log('   - Atau test dengan: curl http://localhost:3000/api/jobs');
  console.log('   - Press Ctrl+C to stop server\n');
});
