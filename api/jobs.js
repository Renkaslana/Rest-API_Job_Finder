/**
 * Job Finder API - Jobs List Endpoint













































































































































































































































































































































- **Compliant** - Follows web scraping best practices- **Maintainable** - Clean separation of concerns- **Scalable** - Handles multiple users with caching- **Efficient** - Only loads relevant dataThis approach is:6. ✅ **Lightweight and respectful** to source website5. ✅ **Hybrid filtering**: Primary filters via JobStreet URL, secondary filters server-side4. ✅ **15-minute caching** reduces server load3. ✅ **Pagination** limits data per request2. ✅ **Only search results** are scraped, not entire site1. ✅ URLs are **dynamically built** based on user search**Implementation follows search-based scraping best practices:**## 🎯 Summary---```[Scraper] Parameters: { q: 'developer', location: 'Jakarta', page: 1 }[Scraper] Search-based scraping from: https://id.jobstreet.com/id/jobs?q=developer&where=Jakarta```### Verify in Logs:```# Expected: Scrapes https://id.jobstreet.com/id/jobs/in-Indonesiacurl "https://fahren-api.vercel.app/api/jobs"# Test 4: No filters (default)# Expected: Scrapes https://id.jobstreet.com/id/jobs?q=developer&where=Jakarta&page=2curl "https://fahren-api.vercel.app/api/search?q=developer&location=Jakarta&page=2"# Test 3: Combined filters# Expected: Scrapes https://id.jobstreet.com/id/jobs?where=Jakartacurl "https://fahren-api.vercel.app/api/search?location=Jakarta"# Test 2: Location filter# Expected: Scrapes https://id.jobstreet.com/id/jobs?q=developercurl "https://fahren-api.vercel.app/api/search?q=developer"# Test 1: Keyword search```bash### Test Dynamic URL Building:## 🚀 Testing---- [x] ✅ **Structured response** - Clean JSON format- [x] ✅ **Respects rate limits** - Cache prevents excessive requests- [x] ✅ **User-driven** - Scraping triggered by actual searches- [x] ✅ **Lightweight** - Minimal server load- [x] ✅ **Caching** - 15-minute cache implemented- [x] ✅ **Pagination** - One page per request- [x] ✅ **No mass scraping** - Only scrape when user searches- [x] ✅ **Search-based scraping** - URLs built dynamically from user input## 📋 Compliance Checklist---```)    page = 1    location = "Jakarta",    query = "developer",val response = apiService.searchJobs(// Usage): Response<JobFinderResponse>    @Query("limit") limit: Int = 30    @Query("page") page: Int = 1,    @Query("location") location: String? = null,    @Query("q") query: String? = null,suspend fun searchJobs(@GET("api/search")// JobApiService.kt```kotlin#### **API Call from Android:**```});  page: 2   location: 'Jakarta',  q: 'developer',const jobs = await scrapeJobs({ // Search with pagination});  location: 'Jakarta'   q: 'developer',const jobs = await scrapeJobs({ // Search with location});  q: 'developer' const jobs = await scrapeJobs({ // Search with keywordconst jobs = await scrapeJobs({});// Basic scrape (all jobs)```javascript#### **Scraper Usage:**### 6. Code Examples---- Provides flexibility for custom filter logic- Allows more advanced filtering without overloading JobStreet- JobStreet doesn't expose all filter options in URL**Why hybrid approach?**- **Sort** - Sort by latest, salary, or relevance- **Job Type** - Match job type keywords in title/description- **Salary Minimum** - Parse salary strings and compare- **Category** - Keyword matching against job categories🔧 Applied after scraping for advanced filtering#### **Secondary Filters (Server-Side)**- **Page (`page`)** - JobStreet pagination- **Location (`where`)** - JobStreet filters by location- **Keyword (`q`)** - JobStreet's search engine handles this✅ Passed directly to JobStreet for optimal performance#### **Primary Filters (JobStreet URL)**### 5. Filter Strategy---- Better user experience- Respects JobStreet's server resources- Faster response times for repeated queries- Reduces scraping frequency**Benefits:**```);  's-maxage=900, stale-while-revalidate'  'Cache-Control', res.setHeader(// Cache for 15 minutes (900 seconds)```javascript### 4. Caching Strategy---| `limit` | number | Results per page | ❌ Server-side limit || `sort` | string | Sort order | ❌ Server-side sort || `jobType` | string | Job type (full-time, etc) | ❌ Server-side filter || `salaryMin` | number | Minimum salary | ❌ Server-side filter || `category` | string | Job category | ❌ Server-side filter || `page` | number | Page number | ✅ Yes || `location` | string | Location (city/region) | ✅ Yes || `q` | string | Keyword (job title/skill) | ✅ Yes ||-----------|------|-------------|---------------------|| Parameter | Type | Description | Passed to JobStreet |**Parameters:**- Pagination supported via `page` parameter- Additional filters (`salaryMin`, `jobType`, `category`) applied server-side- JobStreet filters the results- Builds dynamic JobStreet URL with `q` and `location` parameters**Scraping Strategy:**```GET /api/search?q=developer&location=Jakarta&salaryMin=5000000&jobType=full-time&sort=salary# Advanced filters (server-side)GET /api/search?q=developer&location=Jakarta&page=2# Search with paginationGET /api/search?q=developer&location=Jakarta# Search with locationGET /api/search?q=developer# Search with keyword```bashAdvanced search with filters#### **GET /api/search**---- Applies server-side sorting and limiting- Gets latest jobs without specific filters- Uses default URL: `https://id.jobstreet.com/id/jobs/in-Indonesia`**Scraping Strategy:**```GET /api/jobs?limit=20&sort=salary&salary=true# With filtersGET /api/jobs?limit=20# Basic usage```bashRecommended jobs for home screen (no filters)#### **GET /api/jobs**### 3. API Endpoints---```└─────────────────────────────────────┘│  }                                  ││    }                                ││      "metadata": {...}              ││      "jobs": [...],                 ││    "data": {                        ││  {                                  ││  Return Structured JSON Response    │┌─────────────────────────────────────┐           ▼           │└──────────┬──────────────────────────┘│   salaryMin, jobType, category)     ││  (for advanced filters like         ││  Additional Server-Side Filtering   │┌─────────────────────────────────────┐           ▼           │└──────────┬──────────────────────────┘│  - Job Detail URL                   ││  - Posted Date                      ││  - Salary (if available)            ││  - Location                         ││  - Company                          ││  - Job Title                        ││  Parse HTML → Extract:              │┌─────────────────────────────────────┐           ▼           │└──────────┬──────────────────────────┘│  q=developer&where=Jakarta          ││  https://id.jobstreet.com/id/jobs?  ││  Scrape ONLY Search Results         │┌─────────────────────────────────────┐           ▼           │└──────────┬──────────────────────────┘│  })                                 ││    page: 1                          ││    location: "Jakarta",             ││    q: "developer",                  ││  buildJobStreetSearchURL({          ││  Backend: Build Dynamic URL         │┌─────────────────────────────────────┐           ▼           │└──────────┬──────────────────────────┘│       &location=Jakarta&page=1      ││  GET /api/search?q=developer        │┌─────────────────────────────────────┐           ▼           │└──────────┬──────────┘│  Selects Filters    ││  Mobile App User    │┌─────────────────────┐```### 2. Search Flow---| (no params) | `https://id.jobstreet.com/id/jobs/in-Indonesia` || location: "Bandung", page: 2 | `https://id.jobstreet.com/id/jobs?where=Bandung&page=2` || q: "akuntansi", location: "Jakarta" | `https://id.jobstreet.com/id/jobs?q=akuntansi&where=Jakarta` || q: "developer" | `https://id.jobstreet.com/id/jobs?q=developer` ||------------|---------------|| User Input | Generated URL |**Examples:**```}    : url + '/in-Indonesia';    ? url + '?' + queryParams.join('&')  return queryParams.length > 0     }    queryParams.push(`page=${page}`);  if (page > 1) {  // Add pagination    }    queryParams.push(`where=${encodeURIComponent(location.trim())}`);  if (location && location !== 'Semua Lokasi') {  // Add location filter    }    queryParams.push(`q=${encodeURIComponent(q.trim())}`);  if (q && q.trim()) {  // Add keyword search    const queryParams = [];  let url = 'https://id.jobstreet.com/id/jobs';    const { q, location, page = 1 } = params;function buildJobStreetSearchURL(params = {}) {// utils/scraper.js```javascript### 1. Dynamic URL Builder## 🔧 Implementation Details---6. ✅ **Lightweight** - Minimal scraping, respecting rate limits5. ✅ **Caching** - 15-minute cache to reduce server load4. ✅ **Pagination Support** - One page per request3. ✅ **User-Driven Queries** - Scraping triggered by user search requests2. ✅ **No Mass Scraping** - Only scrape search result pages, not entire website1. ✅ **Dynamic URL Building** - Build JobStreet search URLs based on user parameters### Core Principles Followed:This Job Finder API implements **search-based scraping** according to best practices:## ✅ Compliance with Best Practices * 
 * Endpoint: GET /api/jobs
 * 
 * Query Parameters:
 * - limit: Number of jobs to return (default: 30, max: 100)
 * - sort: Sort order (latest, salary)
 * - salary: Filter only jobs with salary info (true/false)
 * 
 * Used for: Home screen recommended jobs
 * 
 * Cache Strategy:
 * - s-maxage=900 (15 minutes CDN cache)
 * - stale-while-revalidate
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
      limit = '30',
      sort = 'latest',
      salary = 'false'
    } = req.query;

    const limitNum = Math.min(parseInt(limit) || 30, 100);
    const onlyWithSalary = salary === 'true';

    // Cache headers (15 minutes as per best practice)
    res.setHeader(
      'Cache-Control', 
      's-maxage=900, stale-while-revalidate'
    );

    /**
     * SEARCH-BASED SCRAPING
     * For /api/jobs, we use default search (all jobs in Indonesia)
     * No specific filters - just get latest jobs
     */
    let jobs = await scrapeJobs({});

    // Filter: only jobs with salary (if requested)
    if (onlyWithSalary) {
      jobs = jobs.filter(job => job.salary_range && job.salary_range.length > 0);
    }

    // Sort jobs
    if (sort === 'salary') {
      // Sort by salary (jobs with salary first, then by title)
      jobs.sort((a, b) => {
        const aHasSalary = a.salary_range ? 1 : 0;
        const bHasSalary = b.salary_range ? 1 : 0;
        return bHasSalary - aHasSalary;
      });
    } else {
      // Default: latest (no change needed, scraper returns latest first)
    }

    // Apply limit
    const limitedJobs = jobs.slice(0, limitNum);

    // Success response
    return res.status(200).json({
      status: 'success',
      creator: 'Job Finder API',
      statusCode: 200,
      statusMessage: 'OK',
      message: `Successfully fetched ${limitedJobs.length} jobs`,
      ok: true,
      updated_at: new Date().toISOString(),
      data: {
        jobs: limitedJobs,
        metadata: {
          total: limitedJobs.length,
          total_available: jobs.length,
          filters_applied: {
            limit: limitNum,
            sort: sort,
            only_with_salary: onlyWithSalary
          },
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
