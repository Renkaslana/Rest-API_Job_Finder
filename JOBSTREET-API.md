# JobStreet Recommendations API

Endpoint API baru untuk scraping data lowongan kerja dari halaman rekomendasi JobStreet Indonesia.

## 📍 Endpoint

```
GET /api/jobstreet
```

## 🔍 URL Target

```
https://id.jobstreet.com/id/rekomendasi-jobs
```

## 📊 Query Parameters

| Parameter | Type   | Default | Max | Description                           |
|-----------|--------|---------|-----|---------------------------------------|
| `page`    | number | 1       | -   | Nomor halaman untuk pagination        |
| `limit`   | number | 20      | 50  | Jumlah hasil per halaman              |

## 📤 Response Format

### Success Response

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
      "salary": "Rp 5.000.000 – Rp 7.000.000 per month",
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
  "timestamp": "2025-12-20T10:30:00.000Z",
  "cached": false
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message",
  "data": [],
  "meta": {
    "total": 0,
    "page": 1,
    "per_page": 20,
    "total_pages": 0,
    "has_next_page": false
  },
  "timestamp": "2025-12-20T10:30:00.000Z"
}
```

## 📋 Response Fields

### Job Object

| Field         | Type   | Description                                  |
|---------------|--------|----------------------------------------------|
| `id`          | string | Unique job ID dari JobStreet                 |
| `job_title`   | string | Judul lowongan kerja                         |
| `company`     | string | Nama perusahaan                              |
| `location`    | string | Lokasi pekerjaan                             |
| `job_type`    | string | Jenis pekerjaan (Full time, Part time, dll)  |
| `salary`      | string | Gaji (opsional, jika tersedia)               |
| `posted_date` | string | Tanggal posting (format relatif)             |
| `source_name` | string | Sumber data (JobStreet Indonesia)            |
| `source_url`  | string | URL lengkap ke halaman job detail            |

### Meta Object

| Field           | Type    | Description                           |
|-----------------|---------|---------------------------------------|
| `total`         | number  | Total lowongan yang tersedia          |
| `page`          | number  | Halaman saat ini                      |
| `per_page`      | number  | Jumlah hasil per halaman              |
| `total_pages`   | number  | Total halaman tersedia                |
| `has_next_page` | boolean | Apakah ada halaman berikutnya         |

## 🔥 Usage Examples

### Example 1: Get First Page (Default)

**Request:**
```http
GET /api/jobstreet
```

**Response:** Returns first 20 jobs from JobStreet recommendations

---

### Example 2: Get Second Page

**Request:**
```http
GET /api/jobstreet?page=2
```

**Response:** Returns jobs 21-40

---

### Example 3: Custom Limit

**Request:**
```http
GET /api/jobstreet?limit=50
```

**Response:** Returns first 50 jobs (maximum allowed)

---

### Example 4: Specific Page with Limit

**Request:**
```http
GET /api/jobstreet?page=3&limit=30
```

**Response:** Returns jobs 61-90

## 🚀 Implementation

### Frontend (JavaScript/React)

```javascript
// Fetch JobStreet recommendations
async function fetchJobStreetRecommendations(page = 1, limit = 20) {
  try {
    const response = await fetch(
      `https://your-api.vercel.app/api/jobstreet?page=${page}&limit=${limit}`
    );
    const data = await response.json();
    
    if (data.success) {
      console.log(`Found ${data.data.length} jobs`);
      console.log(`Total available: ${data.meta.total}`);
      return data;
    } else {
      console.error('Error:', data.error);
      return null;
    }
  } catch (error) {
    console.error('Fetch error:', error);
    return null;
  }
}

// Usage
fetchJobStreetRecommendations(1, 20).then(data => {
  if (data) {
    data.data.forEach(job => {
      console.log(`${job.job_title} at ${job.company}`);
    });
  }
});
```

### Android (Kotlin + Retrofit)

```kotlin
// Data models
data class JobStreetResponse(
    val success: Boolean,
    val data: List<Job>,
    val meta: Meta,
    val timestamp: String,
    val cached: Boolean?
)

data class Job(
    val id: String,
    val job_title: String,
    val company: String,
    val location: String,
    val job_type: String,
    val salary: String?,
    val posted_date: String,
    val source_name: String,
    val source_url: String
)

data class Meta(
    val total: Int,
    val page: Int,
    val per_page: Int,
    val total_pages: Int,
    val has_next_page: Boolean
)

// API interface
interface JobStreetApi {
    @GET("/api/jobstreet")
    suspend fun getRecommendations(
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20
    ): JobStreetResponse
}

// Usage in ViewModel
class JobStreetViewModel : ViewModel() {
    fun loadRecommendations(page: Int = 1) {
        viewModelScope.launch {
            try {
                val response = api.getRecommendations(page, 20)
                if (response.success) {
                    // Update UI with response.data
                }
            } catch (e: Exception) {
                // Handle error
            }
        }
    }
}
```

## ⚙️ Features

### ✅ Caching
- Cache duration: **5 minutes**
- Unique cache per page and limit combination
- Faster response for repeated requests

### ✅ Error Handling
- Returns sample data on scraping failure
- Graceful fallback mechanism
- Detailed error messages in response

### ✅ Rate Limiting
- Respects JobStreet's robots.txt
- 15-second timeout per request
- User-Agent identification

### ✅ Data Quality
- Removes duplicate jobs by ID
- Validates data before returning
- Clean text extraction

## 🧪 Testing

### Run Test Script

```bash
# Test JobStreet scraper
npm run test:jobstreet
```

### Manual Test

```bash
# Test using curl
curl "http://localhost:3000/api/jobstreet?page=1&limit=10"

# Test on production
curl "https://your-api.vercel.app/api/jobstreet?page=1&limit=10"
```

## 📝 Notes

1. **Data Freshness**: Data is scraped in real-time with 5-minute cache
2. **Salary Information**: Not all jobs include salary data
3. **Job URLs**: Direct links to JobStreet job detail pages
4. **Pagination**: Use `meta.has_next_page` to check for more results
5. **Rate Limits**: Don't make too many requests in short time

## 🔄 Comparison with /api/jobs

| Feature          | /api/jobs                    | /api/jobstreet                |
|------------------|------------------------------|-------------------------------|
| Source           | Search results               | Recommendations page          |
| Cache Duration   | 15 minutes                   | 5 minutes                     |
| Max Limit        | 100                          | 50                            |
| Filters          | Keyword, location, category  | None (recommendations)        |
| Use Case         | Search functionality         | Home screen recommendations   |

## 🐛 Troubleshooting

### Issue: No data returned

**Solution:**
- Check if JobStreet website is accessible
- Verify HTML structure hasn't changed
- Check logs for error messages
- Sample data will be returned as fallback

### Issue: Slow response

**Solution:**
- Use pagination with smaller limit
- Check your internet connection
- Cached data will load faster

### Issue: Missing salary data

**Solution:**
- Not all jobs include salary information
- Check `salary` field (can be `null`)
- Filter jobs with salary on frontend if needed

## 📚 Related Endpoints

- [GET /api/jobs](../README.md#get-apijobs) - Get recommended jobs with filters
- [GET /api/search](../README.md#get-apisearch) - Advanced job search
- [GET /api/job](../README.md#get-apijob) - Get single job detail
