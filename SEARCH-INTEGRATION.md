# 🔍 Search & Filter Integration - Android

Panduan mengintegrasikan endpoint search dan filter ke aplikasi LokerID Android.

## 📡 Endpoint Baru

### 1. Search & Filter Jobs
```
GET /api/search?q={keyword}&category={category}&location={location}&limit={limit}
```

### 2. Get Available Filters
```
GET /api/filters
```

## 🚀 Implementasi di Android

### Step 1: Update ApiService

Tambahkan method baru di `JobApiService.kt`:

```kotlin
interface JobApiService {
    
    // Existing endpoints
    @GET("jobs")
    suspend fun getJobs(): Response<JobsResponse>
    
    @GET("job")
    suspend fun getJobDetail(@Query("url") jobUrl: String): Response<JobDetailResponse>
    
    // NEW: Search & Filter endpoint
    @GET("search")
    suspend fun searchJobs(
        @Query("q") keyword: String? = null,
        @Query("category") category: String? = null,
        @Query("location") location: String? = null,
        @Query("limit") limit: Int? = 30
    ): Response<JobsResponse>
    
    // NEW: Get available filters
    @GET("filters")
    suspend fun getFilters(): Response<FiltersResponse>
}
```

### Step 2: Tambah Data Model untuk Filters

Buat file `Filters.kt`:

```kotlin
package com.lokerid.app.data.model

import com.google.gson.annotations.SerializedName

data class FiltersResponse(
    @SerializedName("status")
    val status: String,
    
    @SerializedName("data")
    val data: FiltersData
)

data class FiltersData(
    @SerializedName("categories")
    val categories: List<CategoryItem>,
    
    @SerializedName("locations")
    val locations: List<String>
)

data class CategoryItem(
    @SerializedName("name")
    val name: String,
    
    @SerializedName("count")
    val count: Int
)
```

### Step 3: Update Repository

Tambahkan method search di `JobRepository.kt`:

```kotlin
/**
 * Search and filter jobs
 */
suspend fun searchJobs(
    query: String? = null,
    category: String? = null,
    location: String? = null
): Resource<List<Job>> = withContext(Dispatchers.IO) {
    try {
        Log.d(TAG, "=== Search API Call ===")
        Log.d(TAG, "Query: $query, Category: $category, Location: $location")
        
        val response = apiService.searchJobs(
            keyword = query,
            category = category,
            location = location,
            limit = 50
        )
        
        if (response.isSuccessful) {
            val jobs = response.body()?.data?.jobs?.map { it.toJob() } ?: emptyList()
            Log.d(TAG, "Search Success - Found ${jobs.size} jobs")
            Resource.Success(jobs)
        } else {
            Log.e(TAG, "Search Error: ${response.code()}")
            Resource.Error("Gagal mencari lowongan")
        }
    } catch (e: Exception) {
        Log.e(TAG, "Search Exception: ${e.message}", e)
        Resource.Error("Terjadi kesalahan: ${e.message}")
    }
}

/**
 * Get available filters
 */
suspend fun getFilters(): Resource<FiltersData> = withContext(Dispatchers.IO) {
    try {
        val response = apiService.getFilters()
        
        if (response.isSuccessful) {
            val filters = response.body()?.data
            if (filters != null) {
                Resource.Success(filters)
            } else {
                Resource.Error("Data filter tidak tersedia")
            }
        } else {
            Resource.Error("Gagal memuat filter")
        }
    } catch (e: Exception) {
        Resource.Error(e.message ?: "Terjadi kesalahan")
    }
}
```

### Step 4: Update ViewModel

Tambahkan di `HomeViewModel.kt`:

```kotlin
class HomeViewModel : ViewModel() {
    
    private val repository = JobRepository()
    
    private val _jobs = MutableLiveData<Resource<List<Job>>>()
    val jobs: LiveData<Resource<List<Job>>> = _jobs
    
    private val _filters = MutableLiveData<Resource<FiltersData>>()
    val filters: LiveData<Resource<FiltersData>> = _filters
    
    // Current filter state
    var currentQuery: String? = null
    var currentCategory: String? = null
    var currentLocation: String? = null
    
    init {
        loadJobs()
        loadFilters()
    }
    
    fun loadJobs() {
        viewModelScope.launch {
            _jobs.value = Resource.Loading()
            _jobs.value = repository.getJobs()
        }
    }
    
    // NEW: Search with filters
    fun searchJobs(
        query: String? = null,
        category: String? = null,
        location: String? = null
    ) {
        currentQuery = query
        currentCategory = category
        currentLocation = location
        
        viewModelScope.launch {
            _jobs.value = Resource.Loading()
            _jobs.value = repository.searchJobs(query, category, location)
        }
    }
    
    // NEW: Load available filters
    fun loadFilters() {
        viewModelScope.launch {
            _filters.value = Resource.Loading()
            _filters.value = repository.getFilters()
        }
    }
    
    // NEW: Apply filters
    fun applyFilters(category: String?, location: String?) {
        searchJobs(currentQuery, category, location)
    }
    
    // NEW: Clear filters
    fun clearFilters() {
        currentQuery = null
        currentCategory = null
        currentLocation = null
        loadJobs()
    }
}
```

### Step 5: Update UI (HomeActivity)

Tambahkan filter UI dan search functionality:

```kotlin
class HomeActivity : AppCompatActivity() {
    
    private lateinit var binding: ActivityHomeBinding
    private val viewModel: HomeViewModel by viewModels()
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityHomeBinding.inflate(layoutInflater)
        setContentView(binding.root)
        
        setupSearch()
        setupFilters()
        observeViewModel()
    }
    
    private fun setupSearch() {
        binding.searchView.setOnQueryTextListener(object : SearchView.OnQueryTextListener {
            override fun onQueryTextSubmit(query: String?): Boolean {
                viewModel.searchJobs(
                    query = query,
                    category = viewModel.currentCategory,
                    location = viewModel.currentLocation
                )
                return true
            }
            
            override fun onQueryTextChange(newText: String?): Boolean {
                // Optional: implement live search
                return false
            }
        })
    }
    
    private fun setupFilters() {
        // Category spinner
        binding.spinnerCategory.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
            override fun onItemSelected(parent: AdapterView<*>?, view: View?, position: Int, id: Long) {
                val category = if (position == 0) null else parent?.getItemAtPosition(position).toString()
                viewModel.applyFilters(category, viewModel.currentLocation)
            }
            
            override fun onNothingSelected(parent: AdapterView<*>?) {}
        }
        
        // Location spinner
        binding.spinnerLocation.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
            override fun onItemSelected(parent: AdapterView<*>?, view: View?, position: Int, id: Long) {
                val location = if (position == 0) null else parent?.getItemAtPosition(position).toString()
                viewModel.applyFilters(viewModel.currentCategory, location)
            }
            
            override fun onNothingSelected(parent: AdapterView<*>?) {}
        }
        
        // Clear filters button
        binding.btnClearFilters.setOnClickListener {
            viewModel.clearFilters()
            binding.spinnerCategory.setSelection(0)
            binding.spinnerLocation.setSelection(0)
            binding.searchView.setQuery("", false)
        }
    }
    
    private fun observeViewModel() {
        // Observe filters
        viewModel.filters.observe(this) { resource ->
            when (resource) {
                is Resource.Success -> {
                    resource.data?.let { filters ->
                        populateFilterSpinners(filters)
                    }
                }
                is Resource.Error -> {
                    Log.e("HomeActivity", "Failed to load filters: ${resource.message}")
                }
                is Resource.Loading -> {
                    // Show loading if needed
                }
            }
        }
        
        // Observe jobs
        viewModel.jobs.observe(this) { resource ->
            when (resource) {
                is Resource.Loading -> showLoading()
                is Resource.Success -> {
                    hideLoading()
                    resource.data?.let { displayJobs(it) }
                }
                is Resource.Error -> {
                    hideLoading()
                    showError(resource.message)
                }
            }
        }
    }
    
    private fun populateFilterSpinners(filters: FiltersData) {
        // Category spinner
        val categories = mutableListOf("Semua")
        categories.addAll(filters.categories.map { it.name })
        val categoryAdapter = ArrayAdapter(this, android.R.layout.simple_spinner_item, categories)
        categoryAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        binding.spinnerCategory.adapter = categoryAdapter
        
        // Location spinner
        val locations = mutableListOf("Semua Lokasi")
        locations.addAll(filters.locations)
        val locationAdapter = ArrayAdapter(this, android.R.layout.simple_spinner_item, locations)
        locationAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        binding.spinnerLocation.adapter = locationAdapter
    }
}
```

## 🎯 Fitur yang Didapat

✅ **Search by keyword** - Cari berdasarkan job title, company, atau description  
✅ **Filter by category** - IT, Marketing, Design, Finance, dll  
✅ **Filter by location** - Jakarta, Bandung, Surabaya, dll  
✅ **Combined filters** - Combine search + category + location  
✅ **Dynamic filters** - List kategori dan lokasi diambil dari API  

## 📊 Testing

Deploy API ke Vercel terlebih dahulu, lalu test:

```bash
# Test local
npm run dev
node test/test-search.js

# Deploy to Vercel
vercel --prod

# Test live
curl "https://your-api.vercel.app/api/search?q=developer&category=IT"
curl "https://your-api.vercel.app/api/filters"
```

## 🚀 Next Steps

1. ✅ Deploy API ke Vercel
2. ✅ Update BASE_URL di Android app
3. ✅ Implementasi UI untuk search & filter
4. ✅ Test end-to-end flow
5. ✅ Add loading states
6. ✅ Handle empty results

Selamat mencoba! 🎉
