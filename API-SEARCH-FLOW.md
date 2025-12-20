# 🔍 **API Search Flow - JobStreet Integration**

## **Overview**
API ini menggunakan **Search-Based Scraping** dari JobStreet Indonesia untuk mendapatkan lowongan kerja yang relevan dengan filter user.

---

## **📊 How It Works**

### **1. User Input (Android App)**
```kotlin
// User types keyword and selects filters
val keyword = "developer"      // Keyword search
val location = "Jakarta"       // Location filter
val category = "IT"            // Category filter

// App sends to API
viewModel.searchJobs(keyword, location, category)
```

### **2. API Endpoint**
```
GET https://fahren-api.vercel.app/api/search
Query Parameters:
  - q: keyword (e.g., "developer")
  - location: city name (e.g., "Jakarta", "Tegal")
  - category: job category (e.g., "IT", "Marketing")
  - limit: max results (default: 30)
```

### **3. Backend Processing (api/search.js)**
```javascript
// Extract parameters
const { q, location, category, limit = 30 } = req.query;

// Call scraper with search params
const scrapedJobs = await scrapeJobs({
  q: q,
  location: location,
  category: category,
  page: 1
});

// Return structured data
res.json({
  success: true,
  data: {
    jobs: scrapedJobs.slice(0, limit)
  }
});
```

### **4. URL Building (utils/scraper.js)**

#### **A. Category Mapping**
```javascript
const JOBSTREET_CLASSIFICATIONS = {
  'IT': 'information-communication-technology',
  'Design': 'advertising-arts-media',
  'Marketing': 'marketing-communications',
  'Sales': 'sales',
  'Finance': 'accounting',
  // ... 20+ mappings
};
```

#### **B. Dynamic URL Construction**
```javascript
function buildJobStreetSearchURL(params) {
  const { q, location, category, page } = params;
  
  // Base URL
  let url = 'https://id.jobstreet.com/id/jobs';
  
  // Add classification if available
  if (category && category !== 'Semua') {
    const categorySlug = JOBSTREET_CLASSIFICATIONS[category];
    url += `-in-${categorySlug}`;
  }
  
  // Build query parameters
  const queryParams = [];
  if (q) queryParams.push(`q=${encodeURIComponent(q)}`);
  if (location) queryParams.push(`where=${encodeURIComponent(location)}`);
  if (page > 1) queryParams.push(`page=${page}`);
  
  // Final URL
  return url + '?' + queryParams.join('&');
}
```

**Example URLs Generated:**
```
Input: q="developer", location="Jakarta", category="IT"
Output: https://id.jobstreet.com/id/jobs-in-information-communication-technology?q=developer&where=Jakarta

Input: q="marketing", location="Tegal", category="Marketing"
Output: https://id.jobstreet.com/id/jobs-in-marketing-communications?q=marketing&where=Tegal

Input: q="sales"
Output: https://id.jobstreet.com/id/jobs-in-sales?q=sales
```

### **5. JobStreet Scraping**
```javascript
async function scrapeJobs(searchParams) {
  // Build dynamic URL
  const url = buildJobStreetSearchURL(searchParams);
  
  // Fetch HTML
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 ...',
      'Accept-Language': 'id-ID,id;q=0.9'
    }
  });
  
  // Parse HTML with Cheerio
  const $ = cheerio.load(await response.text());
  
  // Extract job cards
  const jobs = [];
  $('[data-automation="normalJob"]').each((i, element) => {
    const job = {
      id: extractJobId($(element)),
      title: $(element).find('a[data-automation="jobTitle"]').text(),
      company: $(element).find('[data-automation="jobCompany"]').text(),
      location: $(element).find('[data-automation="jobLocation"]').text(),
      salary: extractSalary($(element)),
      postedDate: extractDate($(element)),
      description: extractDescription($(element)),
      sourceUrl: buildJobUrl($(element))
    };
    jobs.push(job);
  });
  
  return jobs;
}
```

### **6. Response to Android**
```json
{
  "success": true,
  "data": {
    "jobs": [
      {
        "id": "72831234",
        "title": "Software Developer",
        "company": "Tech Company Indonesia",
        "location": "Jakarta Selatan, DKI Jakarta",
        "salary": "Rp 8.000.000 - Rp 12.000.000",
        "salaryMin": 8000000,
        "salaryMax": 12000000,
        "postedDate": "2 hari lalu",
        "description": "Mencari developer berpengalaman...",
        "sourceUrl": "https://id.jobstreet.com/id/job/72831234"
      },
      // ... 29 more jobs
    ],
    "total": 30
  }
}
```

---

## **🎯 Key Features**

### **1. Search-Based Scraping**
✅ **Efficient** - Only scrape search results, not all data  
✅ **Relevant** - Leverage JobStreet's search algorithm  
✅ **Fast** - Return results in ~2-3 seconds  

### **2. Native JobStreet Filters**
✅ **Category/Classification** - Use JobStreet's job categories  
✅ **Location** - Filter by city/region  
✅ **Keyword** - Full-text search in title & description  
✅ **Pagination** - Load more results with `page` parameter  

### **3. Smart Location Detection**
Users can search with location in keyword:
```
"developer Jakarta" → JobStreet searches: q="developer" where="Jakarta"
"marketing Tegal"   → JobStreet searches: q="marketing" where="Tegal"
```

Backend automatically extracts location from keyword if needed.

---

## **🔄 Complete Flow Diagram**

```
┌─────────────┐
│ User Input  │  "developer Jakarta", Category: IT
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Android App │  searchJobs(q="developer Jakarta", category="IT")
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────┐
│ GET /api/search                 │
│ ?q=developer Jakarta&category=IT│
└──────┬──────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ Build JobStreet URL              │
│ /jobs-in-information-            │
│  communication-technology        │
│ ?q=developer+Jakarta             │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ Fetch JobStreet HTML             │
│ Parse with Cheerio               │
│ Extract job cards                │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ Return JSON to Android           │
│ { jobs: [...30 jobs] }           │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ Android displays in RecyclerView │
│ User sees 30 relevant jobs       │
└──────────────────────────────────┘
```

---

## **⚡ Performance**

### **Caching Strategy**
```javascript
// Cache results for 15 minutes
res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate');
```

- **First Request**: ~3 seconds (scraping JobStreet)
- **Cached Request**: ~100ms (return from Vercel cache)
- **Cache Duration**: 15 minutes

### **Optimization**
✅ Only scrape first page (30 jobs max by default)  
✅ Parallel processing for multiple job cards  
✅ Efficient HTML parsing with Cheerio  
✅ CDN caching via Vercel Edge Network  

---

## **📱 Android Integration**

### **Repository Call**
```kotlin
suspend fun getJobs(
    query: String?,
    location: String?,
    category: String?
): Resource<List<Job>> {
    // Smart routing
    val response = if (hasFilters) {
        apiService.searchJobs(query, category, location, limit = 50)
    } else {
        apiService.getJobs()  // Default endpoint
    }
    
    return Resource.Success(response.body().jobs)
}
```

### **ViewModel**
```kotlin
fun searchJobsImmediate(query: String) {
    _searchQuery.value = query
    loadJobs()  // Immediate API call
}

fun loadJobs() {
    val jobs = repository.getJobs(
        query = _searchQuery.value,
        location = _selectedLocation.value,
        category = _selectedCategory.value
    )
    _jobs.value = jobs
}
```

### **Fragment**
```kotlin
fun performSearch() {
    val keyword = binding.etSearch.text.toString()
    val category = getSelectedCategory()
    
    viewModel.setCategory(category)
    viewModel.searchJobsImmediate(keyword)
    // Results displayed in RecyclerView
}
```

---

## **🎓 Why This Approach?**

### **✅ Advantages**
1. **Real-time Data** - Always fresh from JobStreet
2. **No Database** - No need to store/sync jobs
3. **Accurate** - Same results as JobStreet website
4. **Scalable** - Vercel serverless scales automatically
5. **Low Cost** - No database or scraping infrastructure

### **⚠️ Considerations**
1. **Rate Limiting** - Respect JobStreet's servers (15min cache helps)
2. **HTML Changes** - JobStreet may update their HTML structure
3. **Network Dependency** - Requires internet connection

---

## **🔧 Testing**

### **Test Search Flow**
```bash
# Test 1: Basic search
curl "https://fahren-api.vercel.app/api/search?q=developer"

# Test 2: Search with location
curl "https://fahren-api.vercel.app/api/search?q=marketing&location=Jakarta"

# Test 3: Search with category
curl "https://fahren-api.vercel.app/api/search?q=designer&category=Design"

# Test 4: Combined filters
curl "https://fahren-api.vercel.app/api/search?q=backend&location=Tegal&category=IT"
```

### **Expected Response**
```json
{
  "success": true,
  "data": {
    "jobs": [ /* 30 jobs */ ],
    "searchParams": {
      "q": "backend",
      "location": "Tegal",
      "category": "IT"
    },
    "jobStreetUrl": "https://id.jobstreet.com/id/jobs-in-information-communication-technology?q=backend&where=Tegal"
  }
}
```

---

## **📝 Summary**

**Q: Bukannya langsung dari search jobstreet?**  
**A: YA! Benar sekali!** 

API ini **LANGSUNG scraping dari JobStreet search results**:
1. User input → Build JobStreet search URL
2. Fetch HTML dari JobStreet
3. Parse job cards
4. Return ke Android

**Tidak ada database**, **tidak ada job storage**. Semua data real-time dari JobStreet! 🚀
