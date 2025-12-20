/**
 * Job Finder API - Article Detail Endpoint
 * 
 * Endpoint: GET /api/articles/[id]
 * 
 * Returns article preview with content preview and link to full article
 * 
 * Content Preview Structure:
 * - paragraph: Text paragraph (self-written)
 * - bullet: List of key points (self-written)
 * - No full article content from JobStreet
 * 
 * Cache: 24 hours (static content)
 */

const fs = require('fs');
const path = require('path');
const cache = require('../../utils/cache');

const CACHE_KEY_PREFIX = 'article_';
const CACHE_TTL = 24 * 60 * 60; // 24 hours

/**
 * Load single article by ID with caching
 */
function loadArticleById(id) {
  const cacheKey = `${CACHE_KEY_PREFIX}${id}`;

  // Check cache first
  const cached = cache.get(cacheKey);
  if (cached) {
    console.log(`[Article Detail API] Using cached data for ${id}`);
    return cached;
  }

  // Load from file
  console.log(`[Article Detail API] Loading from file for ${id}`);
  const filePath = path.join(process.cwd(), 'data', 'articles.json');
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(fileContent);

  // Find article by ID
  const article = data.articles?.find(a => a.id === id);

  if (article) {
    // Cache it
    cache.set(cacheKey, article, CACHE_TTL);
  }

  return article;
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
    // Get article ID from path parameter
    // Vercel uses req.query for dynamic routes
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        status: 'error',
        statusCode: 400,
        message: 'Article ID is required'
      });
    }

    // Cache headers (24 hours)
    res.setHeader(
      'Cache-Control',
      's-maxage=86400, stale-while-revalidate'
    );

    // Load article
    const article = loadArticleById(id);

    if (!article) {
      return res.status(404).json({
        status: 'error',
        statusCode: 404,
        message: `Article with ID '${id}' not found`
      });
    }

    // Success response with preview content only
    return res.status(200).json({
      status: 'success',
      statusCode: 200,
      message: 'Article found',
      id: article.id,
      title: article.title,
      category: article.category,
      coverImage: article.thumbnail,
      contentPreview: article.contentPreview || [],
      externalSource: {
        label: article.externalSource?.label || 'Baca selengkapnya di JobStreet',
        url: article.externalSource?.url || ''
      }
    });

  } catch (error) {
    console.error('[Article Detail API] Error:', error);

    return res.status(500).json({
      status: 'error',
      statusCode: 500,
      message: 'Failed to load article detail',
      ok: false,
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal error'
    });
  }
};
