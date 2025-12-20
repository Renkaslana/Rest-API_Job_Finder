# Job Finder API v2.1

REST API untuk job listings dan career articles dengan **on-request scraping** dan **static content management**.

## 🎯 Features

### 🔍 Job Search
- ✅ **Real-time Scraping**: Fresh job data dari JobStreet Indonesia
- ✅ **Location & Category Filters**: Via /api/search endpoint
- ✅ **Pagination**: Efficient data loading with hasNextPage indicator
- ✅ **15 min Cache**: Fast response dengan CDN caching
- ✅ **Parameter Validation**: Clear error messages for invalid params

### 🌟 JobStreet Recommendations (NEW!)
- ✅ **Rekomendasi Jobs**: Scraping dari halaman rekomendasi JobStreet
- ✅ **Fresh Data**: Data lowongan terbaru dan relevan
- ✅ **Pagination Support**: Load data per halaman
- ✅ **5 min Cache**: Quick response untuk data recommendations

### 📰 Career Articles
- ✅ **Preview + Reference**: Article previews with links to JobStreet
- ✅ **Copyright Safe**: No full content scraping
- ✅ **Self-written Summaries**: Original preview content
- ✅ **Stock Images**: Free-licensed images from Unsplash
- ✅ **24 hour Cache**: Static content with long-term caching

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone <repository-url>
cd Job-Finder-API
npm install
```

### 2. Development

```bash
# Run local dev server
npm run dev

# Test scraper
npm test
```

Server akan berjalan di: `http://localhost:3000`

### 3. Deploy ke Vercel

```bash
# Install Vercel CLI (first time)
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

## 📡 API Endpoints

### 🔍 Job Endpoints

### GET /api/jobs

**Description**: Get recommended jobs for home screen (simple, no filters)

**Query Parameters**:
- `limit` (number, optional): Results to return (default: 30, max: 100)
- `page` (number, optional): Page number (default: 1)

**Not Supported**:
- ❌ `sort`, `salary`, `category`, `location`, `q` parameters
- Use `/api/search` for location/category filters
- Use `/api/jobstreet` for curated recommendations

**Why no sort/salary filters?**
JobStreet does not support sorting by salary or filtering by salary via URL parameters. These features would require scraping all pages and server-side processing, which violates efficient scraping practices.

**Example**:
```
GET /api/jobs?limit=20&page=1
```

**Response**:
```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Successfully fetched 20 jobs",
  "data": {
    "jobs": [...],
    "metadata": {
      "total": 20,
      "page": 1,
      "limit": 20,
      "hasNextPage": true,
      "scraping_method": "on-request",
      "cache_duration": "15 minutes"
    }
  }
}
```

**Error Response (Invalid Parameters)**:
```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Invalid parameter(s): sort, salary",
  "validParameters": ["limit", "page"],
  "hint": "For search/filter features, use /api/search or /api/jobstreet endpoints"
}
```

---

### GET /api/jobstreet

**Description**: Get job recommendations dari JobStreet Indonesia

**Query Parameters**:
- `page` (number): Page number (default: 1)
- `limit` (number): Results per page (default: 20, max: 50)

**Example**:
```
GET /api/jobstreet?page=1&limit=20
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "89048914",
      "job_title": "Store Leader (Jabodetabek)",
      "company": "Prima Audio Indonesia",
      "location": "Jakarta Raya",
      "job_type": "Full time",
      "posted_date": "10 hari yang lalu",
      "source_name": "JobStreet Indonesia",
      "source_url": "https://id.jobstreet.com/id/job/89048914"
    }
  ],
  "meta": {
    "total": 2292,
    "page": 1,
    "per_page": 20,
    "total_pages": 115,
    "has_next_page": true
  },
  "timestamp": "2025-12-20T10:30:00.000Z"
}
```

---

### GET /api/search

**Description**: Production-ready search by location with auto-normalization (Stable for Android App)

**Query Parameters**:
- `location` (string, **REQUIRED**): Any Indonesia region (auto-normalized)
- `classification` (string, optional): Job category slug (optional)
- `page` (number, optional): Page number (default: 1, min: 1)
- `limit` (number, optional): Results per page (default: 20, max: 30)

**Location Auto-Normalization**:
The API automatically normalizes location input to JobStreet slug format:
- "Jawa Tengah" → "jawa-tengah"
- "DI Yogyakarta" → "yogyakarta"
- "Nusa Tenggara Barat" → "nusa-tenggara-barat"
- "jakarta" → "jakarta"

**Not Supported** (returns 400 error):
- ❌ `sort`, `salary`, `posted` parameters
- Use only the 4 valid parameters above

**URL Patterns Generated**:
1. Location only: `/jobs/in-{location}?page={page}`
2. Location + Classification: `/jobs-in-{classification}/in-{location}?page={page}`

**Examples**:
```
GET /api/search?location=banten
GET /api/search?location=Jawa Tengah&classification=it-technology
GET /api/search?location=jakarta&page=2&limit=20
```

**Success Response**:
```json
{
  "status": "success",
  "statusCode": 200,
  "query": {
    "location": "jawa-tengah",
    "classification": "it-technology",
    "page": 1
  },
  "meta": {
    "limit": 20,
    "total": 18,
    "hasNextPage": true,
    "scrapedAt": "2025-12-20T10:30:00.000Z"
  },
  "jobs": [
    {
      "title": "Software Engineer",
      "company": "Tech Company",
      "location": "Semarang, Jawa Tengah",
      "classification": "IT & Technology",
      "salary": "Rp 8.000.000 - Rp 12.000.000",
      "badge": "Baru saja",
      "detailUrl": "https://id.jobstreet.com/id/job/..."
    }
  ]
}
```

**Error Responses**:

Missing location:
```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Parameter \"location\" is required",
  "examples": ["/api/search?location=banten"]
}
```

Invalid parameters:
```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Invalid parameter(s): sort, salary",
  "validParameters": ["location", "classification", "page", "limit"]
}
```

**Key Features**:
- ✅ Works with ALL Indonesia regions (34 provinces)
- ✅ Auto-normalization (user-friendly input)
- ✅ Proper error handling (400 for bad input, not 500)
- ✅ Pagination with hasNextPage indicator
- ✅ Ready for Android App integration
- ✅ Follows JobStreet URL patterns exactly

---

### GET /api/job

**Description**: Get full job detail

**Query Parameters**:
- `url` (string, required): JobStreet job URL (URL-encoded)

**Example**:
```
GET /api/job?url=https%3A%2F%2Fid.jobstreet.com%2Fid%2Fjob%2F12345678
```

---

### 📰 Article Endpoints

### GET /api/articles

**Description**: Get article previews with external source references

**Query Parameters**:
- `category` (string, optional): Filter by category
- `page` (number): Page number (default: 1)
- `limit` (number): Articles per page (default: 10, max: 50)

**Categories**:
- Pengembangan Karir
- Gaji & Benefit
- Kesejahteraan Kerja

**Example**:
```
GET /api/articles?limit=5
```

**Response**:
```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Found 5 articles",
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "totalPages": 1,
    "hasNext": false,
    "hasPrevious": false
  },
  "articles": [
    {
      "id": "negosiasi-gaji-efektif",
      "title": "Panduan Negosiasi Gaji untuk Fresh Graduate",
      "category": "Gaji & Benefit",
      "thumbnail": "https://images.unsplash.com/photo-1554224311.jpg",
      "summary": "Negosiasi gaji bukan hanya tentang angka...",
      "source": {
        "name": "JobStreet Career Advice",
        "url": "https://id.jobstreet.com/id/career-advice/..."
      }
    }
  ]
}
```

**Key Features**:
- ✅ Copyright safe (preview only, no full content scraping)
- ✅ Stock images from Unsplash (free license)
- ✅ Self-written summaries
- ✅ Links to original JobStreet articles

---

### GET /api/articles/[id]

**Description**: Get article detail with content preview and external source link

**Path Parameters**:
- `id` (string, required): Article ID

**Available Articles**:
- `tips-interview-kerja-sukses`
- `negosiasi-gaji-efektif`
- `work-life-balance-tips`
- `resume-ats-friendly`
- `networking-karir-profesional`

**Example**:
```
GET /api/articles/tips-interview-kerja-sukses
```

**Response**:
```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Article found",
  "id": "tips-interview-kerja-sukses",
  "title": "10 Tips Interview Kerja yang Efektif",
  "category": "Pengembangan Karir",
  "coverImage": "https://images.unsplash.com/photo-157349.jpg",
  "contentPreview": [
    {
      "type": "paragraph",
      "text": "Interview kerja adalah momen krusial dalam proses rekrutmen..."
    },
    {
      "type": "bullet",
      "items": [
        "Riset perusahaan dan posisi yang dilamar secara mendalam",
        "Siapkan jawaban untuk pertanyaan umum",
        "Latih body language dan kontak mata yang percaya diri"
      ]
    }
  ],
  "externalSource": {
    "label": "Baca artikel lengkap di JobStreet",
    "url": "https://id.jobstreet.com/id/career-advice/..."
  }
}
```

**Content Preview Types**:
- `paragraph`: Self-written introductory text
- `bullet`: Key points summary (self-written)

**Purpose**:
- Provides preview and reference to full article
- No copyright violation (no full content scraping)
- Suitable for academic projects
- Professional UX design

---

Get all available job listings (no filters).

**Live Example:**
```
https://your-project.vercel.app/api/jobs
```

**Response Format:**
```json
{
  "status": "success",
  "creator": "Job Finder API",
  "statusCode": 200,
  "statusMessage": "OK",
  "message": "Successfully scraped 15 jobs",
  "ok": true,
  "updated_at": "2025-12-19T10:30:00.000Z",
  "data": {
    "jobs": [
      {
        "job_title": "Full Stack Developer",
        "company": "PT Tech Indonesia",
        "location": "Jakarta",
        "category": "IT",
        "posted_date": "2 hari lalu",
        "description": "We are looking for...",
        "source_name": "JobStreet Indonesia",
        "source_url": "https://id.jobstreet.com/id/job/12345"
      }
    ],
    "metadata": {
      "total": 15,
      "scraping_method": "on-request",
      "cache_duration": "15 minutes"
    }
  }
}
```

---

### GET /api/search

Search and filter jobs by keyword, category, and location.

**Query Parameters:**
- `q` (string): Search keyword (job title, company, description)
- `category` (string): Filter by category (IT, Marketing, Design, etc)
- `location` (string): Filter by location (Jakarta, Bandung, etc)
- `limit` (number): Limit results (default: 30, max: 100)

**Live Examples:**
```
# Search by keyword
https://your-project.vercel.app/api/search?q=developer

# Filter by category
https://your-project.vercel.app/api/search?category=IT

# Filter by location
https://your-project.vercel.app/api/search?location=Jakarta

# Combine filters
https://your-project.vercel.app/api/search?q=programmer&category=IT&location=Jakarta&limit=20
```

**Response Format:**
```json
{
  "status": "success",
  "message": "Found 12 jobs matching your criteria",
  "data": {
    "jobs": [...],
    "metadata": {
      "total": 12,
      "total_before_limit": 12,
      "filters_applied": {
        "keyword": "developer",
        "category": "IT",
        "location": "Jakarta"
      }
    }
  }
}
```

---

### GET /api/filters

Get available categories and locations for filtering.

**Live Example:**
```
https://your-project.vercel.app/api/filters
```

**Response Format:**
```json
{
  "status": "success",
  "data": {
    "categories": [
      { "name": "IT", "count": 45 },
      { "name": "Marketing", "count": 23 },
      { "name": "Design", "count": 15 }
    ],
    "locations": ["Jakarta", "Bandung", "Surabaya", "Semarang"],
    "metadata": {
      "total_jobs_analyzed": 100,
      "total_categories": 12,
      "total_locations": 15
    }
  }
}
```

---

### GET /api/job

Get full job details including complete description.

**Query Parameters:**
- `url` (required): JobStreet job URL

**Live Example:**
```
https://your-project.vercel.app/api/job?url=https://id.jobstreet.com/id/job/12345
```

**Response Format:**
```json
{
  "status": "success",
  "data": {
    "job_title": "Senior Full Stack Developer",
    "company": "PT Teknologi Indonesia",
    "location": "Jakarta Selatan",
    "salary_range": "Rp 8.000.000 - Rp 12.000.000 per month",
    "job_type": "Full Time",
    "posted_date": "2 hari yang lalu",
    "description": "Full job description...",
    "requirements": ["Bachelor degree...", "3+ years experience..."],
    "source_url": "https://id.jobstreet.com/id/job/12345"
  }
}
```

## 🔧 Cara Kerja

### Flow Diagram:

```
User Request → Vercel CDN (Cache Check) → Serverless Function
                     ↓                            ↓
              Cached Response?              Scrape Website
                     ↓                            ↓
                 Return JSON ← Parse HTML ← Fetch HTML
                     ↓
              Cache for 15min
```

### Cache Strategy:

```javascript
Cache-Control: s-maxage=900, stale-while-revalidate
```

- **s-maxage=900**: Cache di CDN selama 15 menit
- **stale-while-revalidate**: Serve stale content sambil fetch data baru di background

### Keuntungan:

✅ Mengurangi beban scraping  
✅ Response time lebih cepat  
✅ Hemat bandwidth  
✅ Tetap fresh (max 15 menit outdated)

## 🎨 Customize Scraper

### Step 1: Pilih Target Website

Edit [`utils/scraper.js`](utils/scraper.js):

```javascript
const TARGET_URL = 'https://your-target-website.com/jobs';
```

### Step 2: Update Selectors

Ikuti panduan di **[SCRAPING-GUIDE.md](SCRAPING-GUIDE.md)** untuk:

1. Inspect HTML structure
2. Identifikasi CSS selectors
3. Update selector di scraper
4. Test dengan `npm test`

### Step 3: Test & Deploy

```bash
# Test locally
npm test

# Deploy
vercel --prod
```

## 📁 Struktur Project

```
Job-Finder-API/
├── api/
│   └── jobs.js              # Serverless endpoint (main API)
├── utils/
│   └── scraper.js           # Scraping logic dengan Cheerio
├── test/
│   └── test-scraper.js      # Testing script
├── vercel.json              # Vercel configuration
├── package.json             # Dependencies
├── README.md                # Dokumentasi utama
└── SCRAPING-GUIDE.md        # Panduan lengkap web scraping
```

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+
- **Platform**: Vercel Serverless Functions
- **Parser**: Cheerio (jQuery-like HTML parser)
- **HTTP Client**: node-fetch
- **Deployment**: Vercel CLI

## 📚 Dokumentasi Lengkap

- **[SCRAPING-GUIDE.md](SCRAPING-GUIDE.md)**: Panduan lengkap web scraping
  - Cara inspect HTML
  - Menulis CSS selectors
  - Troubleshooting
  - Best practices

## ⚖️ Legal & Ethics

### ✅ DO:
- Scrape halaman publik (tidak perlu login)
- Hanya ambil metadata yang visible
- Sertakan `source_url` ke halaman asli
- Respect `robots.txt`
- Add proper `User-Agent`
- Implement rate limiting

### ❌ DON'T:
- Scrape konten di balik paywall
- Menyimpan full job description (copyright)
- Ignore Terms of Service
- Overload server dengan requests
- Claim data sebagai milik Anda

### Disclaimer:

> API ini untuk tujuan edukasi. Pastikan Anda memeriksa dan mematuhi Terms of Service dari website yang Anda scrape. Penulis tidak bertanggung jawab atas penyalahgunaan.

## 🧪 Testing

### Local Test:

```bash
npm test
```

Output:
```
🧪 Testing Job Scraper...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Success! Scraped 15 jobs in 1234ms

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Sample Jobs (showing first 3):

1. Full Stack Developer
   Company: PT Tech Indonesia
   Location: Jakarta
   Posted: 2 hari lalu
   Source: Kalibrr
   URL: https://www.kalibrr.com/id-ID/job/12345
```

### Production Test:

```bash
curl https://your-project.vercel.app/api/jobs
```

## 🚀 Deployment

### Deploy ke Vercel:

```bash
# Login (first time)
vercel login

# Deploy production
vercel --prod
```

### Environment Variables (Optional):

Jika butuh API keys atau config:

1. Buat file `.env.local`:
   ```env
   TARGET_URL=https://example.com/jobs
   USER_AGENT=YourBot/1.0
   ```

2. Tambahkan di Vercel Dashboard:
   - Settings → Environment Variables
   - Add `TARGET_URL` dan `USER_AGENT`

## 📊 Performance

### Benchmarks:

- **Cold Start**: ~1-2 detik (first request)
- **Warm Request**: ~300-500ms (with cache)
- **Scraping Time**: ~800-1500ms (depends on target)
- **Cache Hit**: ~50-100ms (CDN response)

### Optimization Tips:

1. **Enable Cache**:
   ```javascript
   Cache-Control: s-maxage=900
   ```

2. **Limit Scraping**:
   ```javascript
   $('.job-card').slice(0, 20).each(...) // Only scrape first 20
   ```

3. **Timeout**:
   ```javascript
   fetch(url, { timeout: 10000 })
   ```

## 🔒 Security

- ✅ No API keys exposed
- ✅ CORS enabled (public API)
- ✅ Rate limiting via cache
- ✅ Timeout protection
- ✅ Error handling

## 📝 Changelog

### v2.0.0 (Current)
- ✨ On-request scraping
- ✨ Serverless architecture
- ✨ CDN caching strategy
- ✨ Cheerio HTML parser
- 📚 Comprehensive scraping guide

### v1.0.0
- 📦 Static JSON data
- 🚀 Express.js server

## 🤝 Contributing

Contributions welcome! Please:

1. Fork repository
2. Create feature branch
3. Test dengan `npm test`
4. Submit pull request

## 📄 License

ISC License - Free for personal and commercial use.

## 👨‍💻 Author

Your Name

---

**Enjoy scraping! 🎉**

Need help? Check [SCRAPING-GUIDE.md](SCRAPING-GUIDE.md) for detailed tutorials.
