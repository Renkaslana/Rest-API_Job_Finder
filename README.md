# Job Finder API v2.0

REST API dengan **on-request scraping** untuk metadata lowongan kerja, mirip konsep [Sanka Anime API](https://www.sankavollerei.com/anime/).

## 🎯 Konsep

- ✅ **On-Request Scraping**: Data di-fetch real-time saat endpoint diakses
- ✅ **Metadata Only**: Hanya scrape info publik (title, company, location, date)
- ✅ **Serverless**: Deploy ke Vercel, auto-scale, zero maintenance
- ✅ **Cache Strategy**: CDN caching 15 menit untuk efisiensi
- ✅ **No Database**: Stateless, data fresh dari sumber

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

### GET /api/jobs

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
        "posted_date": "2 hari lalu",
        "source_name": "Kalibrr",
        "source_url": "https://www.kalibrr.com/id-ID/job/12345"
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
