# Job Finder API v2.1

REST API untuk job listings dan career articles dengan **on-request scraping** dan **static content management**.

## 🎯 Features

### 🔍 Job Search
- ✅ **Real-time Scraping**: Fresh job data dari JobStreet Indonesia
- ✅ **Advanced Filters**: Keyword, category, location, salary, job type
- ✅ **Smart Sorting**: Latest, salary, relevance
- ✅ **Pagination**: Efficient data loading
- ✅ **15 min Cache**: Fast response dengan CDN caching

### 🌟 JobStreet Recommendations (NEW!)
- ✅ **Rekomendasi Jobs**: Scraping dari halaman rekomendasi JobStreet
- ✅ **Fresh Data**: Data lowongan terbaru dan relevan
- ✅ **Pagination Support**: Load data per halaman
- ✅ **5 min Cache**: Quick response untuk data recommendations

### 📰 Career Articles
- ✅ **Original Content**: Career tips & advice articles
- ✅ **Block-based Structure**: Paragraphs, headings, lists, images, highlights
- ✅ **Categories**: Career development, salary advice, workplace wellbeing
- ✅ **24 hour Cache**: Static content dengan long-term caching

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

**Description**: Get recommended jobs for home screen

**Query Parameters**:
- `limit` (number): Results to return (default: 30, max: 100)
- `sort` (string): Sort order - `latest` (default) or `salary`
- `salary` (boolean): Filter only jobs with salary info (`true`/`false`)

**Example**:
```
GET /api/jobs?limit=20&sort=salary&salary=true
```

**Response**:
```json
{
  "status": "success",
  "data": {
    "jobs": [...],
    "metadata": {
      "total": 20,
      "filters_applied": {
        "limit": 20,
        "sort": "salary",
        "only_with_salary": true
      }
    }
  }
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

**Description**: Advanced job search with multiple filters

**Query Parameters**:
- `q` (string): Search keyword (title, company, description)
- `category` (string): Job category (IT, Marketing, Design, etc)
- `location` (string): Location filter (Jakarta, Bandung, etc)
- `salaryMin` (number): Minimum salary filter
- `jobType` (string): Job type - `full-time`, `part-time`, `contract`, `internship`, `freelance`
- `sort` (string): Sort order - `latest` (default), `salary`, `relevance`
- `page` (number): Page number (default: 1)
- `limit` (number): Results per page (default: 30, max: 100)

**Example**:
```
GET /api/search?q=developer&category=IT&location=Jakarta&salaryMin=5000000&sort=salary&page=1
```

**Response**:
```json
{
  "status": "success",
  "message": "Found 45 jobs matching your criteria",
  "data": {
    "jobs": [...],
    "metadata": {
      "total_results": 45,
      "page": 1,
      "limit": 30,
      "total_pages": 2,
      "has_next": true,
      "has_previous": false,
      "sort_by": "salary",
      "filters_applied": {
        "keyword": "developer",
        "category": "IT",
        "location": "Jakarta",
        "salaryMin": "5000000"
      }
    }
  }
}
```

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

### 📰 Article Endpoints (NEW!)

### GET /api/articles

**Description**: Get career advice articles list

**Query Parameters**:
- `category` (string): Filter by category
  - `career-development`
  - `salary-advice`
  - `workplace-wellbeing`
- `page` (number): Page number (default: 1)
- `limit` (number): Articles per page (default: 10, max: 50)

**Example**:
```
GET /api/articles?category=salary-advice&limit=10
```

**Response**:
```json
{
  "status": "success",
  "data": {
    "articles": [
      {
        "id": "negosiasi-gaji-efektif",
        "title": "Cara Negosiasi Gaji yang Efektif untuk Fresh Graduate",
        "summary": "Negosiasi gaji sering kali menjadi momen yang awkward...",
        "coverImage": "https://...",
        "category": "salary-advice",
        "readTime": "6 min",
        "publishedAt": "2024-12-10T14:30:00Z",
        "author": "Job Finder Editorial Team"
      }
    ],
    "metadata": {
      "total_results": 3,
      "page": 1,
      "total_pages": 1,
      "disclaimer": "Original content for educational purposes"
    }
  }
}
```

---

### GET /api/articles/[id]

**Description**: Get full article content with block-based structure

**Path Parameters**:
- `id` (string, required): Article ID

**Example**:
```
GET /api/articles/tips-interview-kerja-sukses
GET /api/articles/negosiasi-gaji-efektif
GET /api/articles/work-life-balance-tips
```

**Response**:
```json
{
  "status": "success",
  "data": {
    "article": {
      "id": "tips-interview-kerja-sukses",
      "title": "10 Tips Interview Kerja yang Akan Membuat Anda Sukses",
      "summary": "Panduan lengkap mempersiapkan diri...",
      "coverImage": "https://...",
      "category": "career-development",
      "readTime": "8 min",
      "publishedAt": "2024-12-15T10:00:00Z",
      "author": "Job Finder Editorial Team",
      "content": [
        {
          "type": "paragraph",
          "text": "Interview kerja adalah momen krusial..."
        },
        {
          "type": "heading",
          "text": "1. Riset Mendalam tentang Perusahaan"
        },
        {
          "type": "bulletList",
          "items": ["Kunjungi website resmi", "Baca berita terbaru", ...]
        },
        {
          "type": "image",
          "url": "https://...",
          "caption": "Persiapan yang matang adalah kunci"
        },
        {
          "type": "highlight",
          "text": "Ingat: Interview adalah komunikasi dua arah..."
        }
      ]
    },
    "metadata": {
      "content_blocks": 25,
      "content_types": ["paragraph", "heading", "bulletList", "image", "highlight"]
    }
  }
}
```

**Content Block Types**:
- `paragraph`: Plain text paragraph
- `heading`: Section heading
- `bulletList`: List with `items` array
- `image`: Image with `url` and optional `caption`
- `highlight`: Highlighted/quoted text

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
