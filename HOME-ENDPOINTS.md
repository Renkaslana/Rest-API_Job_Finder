# New Job Endpoints for Home Screen

## 📌 API Endpoints Created

### 1. GET /api/jobs/all
**Purpose**: Fetch all available jobs from JobStreet  
**URL**: https://fahren-api.vercel.app/api/jobs/all

**Query Parameters:**
- `page` (optional): Page number, default = 1

**Response Structure:**
```json
{
  "success": true,
  "meta": {
    "totalJobs": 30,
    "page": 1,
    "source": "jobstreet",
    "type": "all",
    "scrapedAt": "2025-12-20T05:55:48.362Z"
  },
  "classifications": [
    { "name": "Lainnya", "count": 7 },
    { "name": "Penjualan", "count": 7 },
    { "name": "IT & Teknologi", "count": 4 }
  ],
  "jobs": [
    {
      "job_title": "LIVE HOST TIKTOK SHOPEE",
      "company": "Grand Sinar Sari",
      "location": "Jakarta Barat",
      "category": "Lainnya",
      "posted_date": "Akan segera berakhir",
      "description": "...",
      "source_name": "JobStreet Indonesia",
      "source_url": "https://id.jobstreet.com/id/job/88730684",
      "salary_range": "Rp 7.000.000 - Rp 10.000.000"
    }
  ]
}
```

**Status**: ✅ Working (returns 30 real jobs)

---

### 2. GET /api/jobs/latest
**Purpose**: Fetch latest/newest jobs from JobStreet  
**URL**: https://fahren-api.vercel.app/api/jobs/latest

**Query Parameters:**
- `page` (optional): Page number, default = 1

**Status**: ⚠️ Partial (returns sample data - JobStreet may block `tags=new` parameter)

**Alternative**: Use `/api/jobs/all` and sort by `posted_date` client-side

---

## 🏠 Android Implementation Plan

### For Home Screen (HomeActivity/HomeFragment)

**Option 1: Show All Jobs (Recommended)**
```kotlin
// HomeViewModel.kt
fun loadAllJobs() {
    viewModelScope.launch {
        val response = repository.getAllJobs(page = 1)
        // Display in RecyclerView
    }
}
```

**API Call:**
```kotlin
// JobApiService.kt
@GET("api/jobs/all")
suspend fun getAllJobs(
    @Query("page") page: Int = 1
): Response<JobsResponse>

// Response model
data class JobsResponse(
    val success: Boolean,
    val meta: JobsMeta,
    val classifications: List<Classification>,
    val jobs: List<Job>
)
```

**Option 2: Latest Jobs (if needed)**
- Use `/api/jobs/all` 
- Filter/sort by `posted_date` on client
- Show "New" badge for jobs with `posted_date` containing "hari" or "jam"

---

## 🔄 Flow Comparison

### Current Search Flow (JobsFragment)
```
User input location/keyword 
  → /api/search?location=Tegal&q=developer
  → Filtered results
```

### New Home Flow (HomeActivity)
```
App opens
  → /api/jobs/all
  → Show all available jobs
  → User can tap to search (navigate to JobsFragment)
```

---

## 📊 Response Structure Comparison

| Endpoint | Jobs Count | Classifications | Use Case |
|----------|------------|-----------------|----------|
| `/api/search` | ~30 | ✅ Dynamic | Advanced search (location + keyword + category) |
| `/api/jobs/all` | ~30 | ✅ Dynamic | Home screen (all jobs) |
| `/api/jobs/latest` | ~3 (sample) | ⚠️ | Latest jobs (not reliable) |

---

## ✅ Recommendation

**For Home Screen, use:**
- **Primary**: `/api/jobs/all` for main job listing
- **Optional**: Add client-side sort for "Latest" tab/section
- **Search**: Keep existing `/api/search` for JobsFragment

**Benefits:**
- ✅ Real data from JobStreet
- ✅ Consistent with search endpoint structure
- ✅ Includes classifications for filtering
- ✅ Cached for 15 minutes
- ✅ No additional backend changes needed
