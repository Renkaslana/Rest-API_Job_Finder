# 🎯 BACKEND REFACTOR COMPLETE - Location-First Search Strategy

## ✅ WHAT WAS FIXED

### **1. URL Construction Strategy**

**❌ OLD (Classification-First):**
```javascript
// Menggunakan classification di URL path
url = 'https://id.jobstreet.com/id/jobs-in-{classification}'
queryParams = ['where={location}', 'q={keyword}']

// Example:
/jobs-in-information-communication-technology?where=Tegal&q=developer
```

**✅ NEW (Location-First - JobStreet Standard):**
```javascript
// Location di URL path (PRIMARY context)
url = 'https://id.jobstreet.com/id/jobs/in-{location}'
queryParams = ['q={keyword}', 'classification={category}']

// Example:
/jobs/in-Tegal?q=developer&classification=IT
```

### **2. Dynamic Classification Extraction**

**❌ OLD:**
- Hard-coded category mappings
- No dynamic classification from results
- Category detection via keyword matching in backend

**✅ NEW:**
```javascript
// Extract categories dynamically from scraped results
function extractClassifications(jobs) {
  const categoryCount = {};
  
  jobs.forEach(job => {
    const category = job.category || 'Lainnya';
    categoryCount[category] = (categoryCount[category] || 0) + 1;
  });
  
  return Object.entries(categoryCount)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}
```

**✅ ADDED: Smart Category Detection (20+ categories)**
```javascript
function extractJobCategory(title, description, fullText) {
  // Detects from content analysis:
  - Akuntansi
  - Administrasi & Dukungan Perkantoran
  - IT & Teknologi
  - Periklanan, Seni & Media
  - Perbankan & Layanan Keuangan
  - Layanan Pelanggan
  - Teknik
  - Manufaktur
  - Pemasaran & Komunikasi
  - Penjualan
  - Kesehatan & Medis
  - Perhotelan & Pariwisata
  - Pendidikan & Pelatihan
  - HR & Rekrutmen
  - Logistik & Transportasi
  - Retail & Produk Konsumen
  - Properti & Real Estate
  - Hukum
  - Konstruksi
  - Pertambangan & Energi
  - Lainnya (default)
}
```

### **3. API Response Structure**

**❌ OLD:**
```json
{
  "status": "success",
  "data": {
    "jobs": [...],
    "metadata": {
      "total_results": 30,
      "filters_applied": {...}
    }
  }
}
```

**✅ NEW (Required Structure):**
```json
{
  "query": {
    "q": "admin",
    "location": "Tegal",
    "category": null,
    "page": 1
  },
  "meta": {
    "totalJobs": 30,
    "source": "jobstreet",
    "scrapedAt": "2025-12-20T..."
  },
  "classifications": [
    { "name": "Administrasi & Dukungan Perkantoran", "count": 12 },
    { "name": "Manufaktur", "count": 8 },
    { "name": "Akuntansi", "count": 5 },
    { "name": "Penjualan", "count": 3 },
    { "name": "Lainnya", "count": 2 }
  ],
  "jobs": [
    {
      "title": "Staff Admin",
      "company": "PT. Example",
      "location": "Tegal, Jawa Tengah",
      "category": "Administrasi & Dukungan Perkantoran",
      "salary": "Rp 3-4 juta",
      "postedAgo": "2 hari lalu",
      "detailUrl": "https://id.jobstreet.com/...",
      "description": "..."
    }
  ]
}
```

---

## 🔄 SEARCH FLOW COMPARISON

### **OLD FLOW:**
```
1. User input: keyword + category + location
2. Backend: Map category → classification slug
3. Build URL: /jobs-in-{classification}?where={location}
4. Scrape results
5. Return jobs (no classification data)
```

### **NEW FLOW (Location-First):**
```
1. User input: location (PRIMARY)
2. Backend: Build URL: /jobs/in-{location}
3. Scrape results
4. Extract category from each job's content
5. Count jobs by category → dynamic classifications[]
6. Return:
   - jobs[] with category field
   - classifications[] with counts
   - User can refine by selecting a classification
```

---

## 📊 SUPPORTED SCENARIOS

### **Scenario 1: Location-Only Search**
```bash
GET /api/search?location=Tegal

# JobStreet URL:
https://id.jobstreet.com/id/jobs/in-Tegal

# Returns:
- All jobs in Tegal
- All categories
- Dynamic classification counts
```

### **Scenario 2: Location + Classification**
```bash
GET /api/search?location=Tegal&category=Akuntansi

# JobStreet URL:
https://id.jobstreet.com/id/jobs/in-Tegal?classification=Akuntansi

# Returns:
- Jobs in Tegal
- Filtered by Akuntansi category
- Classifications still computed for refinement
```

### **Scenario 3: Keyword + Location**
```bash
GET /api/search?q=admin&location=Tegal

# JobStreet URL:
https://id.jobstreet.com/id/jobs/in-Tegal?q=admin

# Returns:
- Jobs matching "admin" keyword
- In Tegal location
- All categories
- Dynamic classifications
```

### **Scenario 4: Full Search**
```bash
GET /api/search?q=accounting&location=Jakarta&category=Akuntansi

# JobStreet URL:
https://id.jobstreet.com/id/jobs/in-Jakarta?q=accounting&classification=Akuntansi

# Returns:
- Accounting jobs
- In Jakarta
- Akuntansi category
- Classifications for further refinement
```

---

## 🛠️ TECHNICAL CHANGES

### **Files Modified:**

1. **`utils/scraper.js`**
   - ✅ Rewrote `buildJobStreetSearchURL()` - location-first strategy
   - ✅ Added `extractJobCategory()` - smart category detection (20+ categories)
   - ✅ Added `extractClassifications()` - dynamic classification counting
   - ✅ Removed `JOBSTREET_CLASSIFICATIONS` hard-coded mapping
   - ✅ Updated exports to include new functions

2. **`api/search.js`**
   - ✅ Simplified query parameters (removed salaryMin, jobType, sort, limit)
   - ✅ Focused on core parameters: q, location, category, page
   - ✅ Implemented location-first search strategy
   - ✅ Added classification extraction step
   - ✅ Changed response structure to required format
   - ✅ Removed server-side filtering (rely on JobStreet native filters)

### **New Features:**

1. **Dynamic Classification Counting**
   ```javascript
   classifications: [
     { name: "Administrasi", count: 12 },
     { name: "Manufaktur", count: 8 }
   ]
   ```

2. **Smart Category Detection**
   - Analyzes job title, description, and full text
   - 20+ predefined category patterns
   - Fallback to "Lainnya" if no match

3. **Location-First URL Building**
   - Aligns with JobStreet's actual search behavior
   - More accurate results
   - Better caching

---

## ⚡ PERFORMANCE & CACHING

### **Cache Strategy:**
```javascript
// Cache by final JobStreet URL
res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate');
// 900 seconds = 15 minutes
```

### **Scraping Rules:**
- ✅ ONE page per request only
- ✅ Respect 15-minute cache
- ✅ Handle empty results gracefully
- ✅ Fallback to sample data on error

---

## 🧪 TESTING

### **Test Files:**
1. `test/test-scraper.js` - Basic scraper test
2. `test/test-location-search.js` - NEW! Location-first strategy tests

### **Run Tests:**
```bash
# Basic scraper test
npm test

# Location-first strategy test (requires dev server)
npm run dev
# Then in another terminal:
node test/test-location-search.js
```

### **Test Scenarios:**
1. ✅ Location-only: `/api/search?location=Tegal`
2. ✅ Location + Classification: `/api/search?location=Tegal&category=Akuntansi`
3. ✅ Keyword + Location: `/api/search?q=admin&location=Tegal`

---

## 🚀 DEPLOYMENT

### **Ready for Production:**
```bash
# Deploy to Vercel
vercel --prod

# Test production endpoint
curl "https://fahren-api.vercel.app/api/search?location=Tegal"
```

### **API Endpoints:**
- ✅ `/api/jobs` - General job listing (unchanged)
- ✅ `/api/search` - Location-first search (REFACTORED)
- ✅ `/api/job` - Job detail (unchanged)

---

## 📝 MIGRATION NOTES

### **Breaking Changes:**
1. **Response Structure Changed**
   - Old: `data.jobs`, `data.metadata`
   - New: `query`, `meta`, `classifications`, `jobs`

2. **Removed Parameters:**
   - `salaryMin` - Not supported by JobStreet natively
   - `jobType` - Not supported by JobStreet natively
   - `sort` - JobStreet returns latest first by default
   - `limit` - Fixed to 30 jobs per page

3. **Parameter Behavior:**
   - `location` - Now PRIMARY search context (in URL path)
   - `category` - Now a query parameter (classification filter)

### **Frontend Integration:**
Android app needs to update:
1. Parse new response structure
2. Display `classifications[]` as filter chips
3. Update API call parameters
4. Remove unsupported filters (salaryMin, jobType)

---

## ✅ SUMMARY

### **What We Achieved:**
1. ✅ Location-first search strategy (JobStreet standard)
2. ✅ Dynamic classification extraction from results
3. ✅ Smart category detection (20+ categories)
4. ✅ Proper response structure with classifications[]
5. ✅ Removed hard-coded category mappings
6. ✅ Simplified API parameters
7. ✅ Better alignment with JobStreet's actual behavior

### **Key Benefits:**
- 🚀 More accurate search results
- 📊 Dynamic filters based on actual data
- 🎯 Context-aware classification
- ⚡ Better caching (by final URL)
- 🔧 Easier to maintain (no hard-coded mappings)
- 🌐 Follows JobStreet's standard search flow

### **Next Steps:**
1. Test with production data
2. Update Android app to use new response structure
3. Monitor classification accuracy
4. Fine-tune category detection patterns if needed

---

**🎉 Backend refactor complete! Ready for production deployment.**
