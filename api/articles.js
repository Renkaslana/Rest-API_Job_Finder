/**
 * Job Finder API - Articles List Endpoint
 * 
 * Endpoint: GET /api/articles
 * 
 * Query Parameters:
 * - category: Filter by category (career-development, salary-advice, workplace-wellbeing)
 * - limit: Number of articles to return (default: 10)
 * - page: Page number (default: 1)
 * 
 * Returns list of article previews (without full content)
 * 
 * Cache: 24 hours (articles are static content)
 */

const fs = require('fs');
const path = require('path');
const cache = require('../utils/cache');

const CACHE_KEY = 'articles_data';
const CACHE_TTL = 24 * 60 * 60; // 24 hours

/**
 * Load articles from JSON file with caching
 */
function loadArticles() {
  // Check cache first
  const cached = cache.get(CACHE_KEY);
  if (cached) {
    console.log('[Articles API] Using cached data');
    return cached;
  }

  // Load from file
  console.log('[Articles API] Loading from file');
  const filePath = path.join(process.cwd(), 'data', 'articles.json');
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(fileContent);

  // Cache it
  cache.set(CACHE_KEY, data, CACHE_TTL);

  return data;
}

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

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
    // Parse query parameters
    const {
      category = '',
      limit = '10',
      page = '1'
    } = req.query;

    const limitNum = Math.min(parseInt(limit) || 10, 50);
    const pageNum = Math.max(parseInt(page) || 1, 1);
    const offset = (pageNum - 1) * limitNum;

    // Cache headers (24 hours)
    res.setHeader(
      'Cache-Control',
      's-maxage=86400, stale-while-revalidate'
    );

    // Load articles data
    const data = loadArticles();
    let articles = data.articles || [];

    // Filter by category if provided
    if (category) {
      articles = articles.filter(article => article.category === category);
    }

    // Calculate pagination
    const totalResults = articles.length;
    const totalPages = Math.ceil(totalResults / limitNum);

    // Get articles for current page (without full content)
    const paginatedArticles = articles
      .slice(offset, offset + limitNum)
      .map(article => ({
        id: article.id,
        title: article.title,
        summary: article.summary,
        coverImage: article.coverImage,
        category: article.category,
        readTime: article.readTime,
        publishedAt: article.publishedAt,
        author: article.author
        // Exclude content from list view
      }));

    // Success response
    return res.status(200).json({
      status: 'success',
      creator: 'Job Finder API',
      statusCode: 200,
      message: `Found ${totalResults} articles`,
      ok: true,
      data: {
        articles: paginatedArticles,
        metadata: {
          total_results: totalResults,
          page: pageNum,
          limit: limitNum,
          total_pages: totalPages,
          has_next: pageNum < totalPages,
          has_previous: pageNum > 1,
          category_filter: category || 'all',
          disclaimer: data.metadata?.disclaimer || 'Original content for educational purposes'
        }
      }
    });

  } catch (error) {
    console.error('[Articles API] Error:', error);

    return res.status(500).json({
      status: 'error',
      statusCode: 500,
      message: 'Failed to load articles',
      ok: false,
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal error'
    });
  }
};
