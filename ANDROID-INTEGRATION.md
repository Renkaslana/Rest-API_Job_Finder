# 📱 Panduan Integrasi Android Studio - LokerID

## ⚠️ Langkah Pertama: Deploy API ke Vercel

Sebelum digunakan di Android, deploy dulu untuk mendapat URL production:

```bash
# Di folder Job-Finder-API
vercel login
vercel --prod
```

Setelah deploy, Anda akan mendapat URL seperti:
```
https://job-finder-api-xyz.vercel.app
```

Simpan URL ini untuk digunakan di Android app.

---

## 🔧 Setup Android Studio

### 1. Tambahkan Dependencies di `build.gradle` (Module: app)

```gradle
dependencies {
    // Retrofit untuk HTTP client
    implementation 'com.squareup.retrofit2:retrofit:2.9.0'
    implementation 'com.squareup.retrofit2:converter-gson:2.9.0'
    
    // OkHttp untuk logging (debugging)
    implementation 'com.squareup.okhttp3:logging-interceptor:4.11.0'
    
    // Kotlin Coroutines (jika pakai Kotlin)
    implementation 'org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3'
    
    // ViewModel & LiveData
    implementation 'androidx.lifecycle:lifecycle-viewmodel-ktx:2.6.2'
    implementation 'androidx.lifecycle:lifecycle-livedata-ktx:2.6.2'
    
    // RecyclerView untuk list
    implementation 'androidx.recyclerview:recyclerview:1.3.2'
    
    // SwipeRefreshLayout untuk pull-to-refresh
    implementation 'androidx.swiperefreshlayout:swiperefreshlayout:1.1.0'
}
```

### 2. Tambahkan Permission di `AndroidManifest.xml`

```xml
<manifest ...>
    <!-- Internet permission -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    
    <application
        android:usesCleartextTraffic="false"
        ...>
        ...
    </application>
</manifest>
```

---

## 📦 Struktur Code Android

### 1. Model Classes (Data Models)

**File: `models/Job.kt`**
```kotlin
package com.lokerid.models

import com.google.gson.annotations.SerializedName

// Model untuk list jobs
data class JobsResponse(
    val status: String,
    val message: String,
    val data: JobsData
)

data class JobsData(
    val jobs: List<Job>,
    val metadata: Metadata
)

data class Job(
    @SerializedName("job_title")
    val jobTitle: String,
    
    val company: String,
    val location: String,
    
    @SerializedName("posted_date")
    val postedDate: String,
    
    val description: String, // Preview singkat
    
    @SerializedName("salary_range")
    val salaryRange: String?,
    
    @SerializedName("source_url")
    val sourceUrl: String
)

data class Metadata(
    val total: Int,
    @SerializedName("scraping_method")
    val scrapingMethod: String,
    @SerializedName("cache_duration")
    val cacheDuration: String
)

// Model untuk job detail
data class JobDetailResponse(
    val status: String,
    val message: String,
    val data: JobDetail
)

data class JobDetail(
    @SerializedName("job_title")
    val jobTitle: String,
    
    val company: String,
    val location: String,
    
    @SerializedName("posted_date")
    val postedDate: String,
    
    val description: String, // DESKRIPSI LENGKAP!
    
    @SerializedName("salary_range")
    val salaryRange: String?,
    
    @SerializedName("job_type")
    val jobType: String?,
    
    val requirements: List<String>?,
    
    @SerializedName("source_url")
    val sourceUrl: String
)
```

---

### 2. API Service Interface

**File: `network/JobApiService.kt`**
```kotlin
package com.lokerid.network

import com.lokerid.models.JobsResponse
import com.lokerid.models.JobDetailResponse
import retrofit2.Response
import retrofit2.http.GET
import retrofit2.http.Query

interface JobApiService {
    
    @GET("api/jobs")
    suspend fun getJobs(): Response<JobsResponse>
    
    @GET("api/job")
    suspend fun getJobDetail(
        @Query("url") jobUrl: String
    ): Response<JobDetailResponse>
}
```

---

### 3. Retrofit Client

**File: `network/RetrofitClient.kt`**
```kotlin
package com.lokerid.network

import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

object RetrofitClient {
    
    // ⚠️ GANTI dengan URL Vercel Anda setelah deploy!
    private const val BASE_URL = "https://job-finder-api-xyz.vercel.app/"
    
    private val loggingInterceptor = HttpLoggingInterceptor().apply {
        level = HttpLoggingInterceptor.Level.BODY
    }
    
    private val okHttpClient = OkHttpClient.Builder()
        .addInterceptor(loggingInterceptor)
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .writeTimeout(30, TimeUnit.SECONDS)
        .build()
    
    val instance: JobApiService by lazy {
        val retrofit = Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
        
        retrofit.create(JobApiService::class.java)
    }
}
```

---

### 4. Repository Pattern

**File: `repository/JobRepository.kt`**
```kotlin
package com.lokerid.repository

import android.util.Log
import com.lokerid.models.Job
import com.lokerid.models.JobDetail
import com.lokerid.network.RetrofitClient

class JobRepository {
    
    private val apiService = RetrofitClient.instance
    
    suspend fun fetchJobs(): Result<List<Job>> {
        return try {
            val response = apiService.getJobs()
            
            if (response.isSuccessful && response.body() != null) {
                val jobs = response.body()!!.data.jobs
                Log.d("JobRepository", "Fetched ${jobs.size} jobs")
                Result.success(jobs)
            } else {
                Log.e("JobRepository", "Error: ${response.code()}")
                Result.failure(Exception("Failed to fetch jobs: ${response.code()}"))
            }
        } catch (e: Exception) {
            Log.e("JobRepository", "Exception: ${e.message}")
            Result.failure(e)
        }
    }
    
    suspend fun fetchJobDetail(jobUrl: String): Result<JobDetail> {
        return try {
            val response = apiService.getJobDetail(jobUrl)
            
            if (response.isSuccessful && response.body() != null) {
                val jobDetail = response.body()!!.data
                Log.d("JobRepository", "Fetched job detail: ${jobDetail.jobTitle}")
                Result.success(jobDetail)
            } else {
                Log.e("JobRepository", "Error: ${response.code()}")
                Result.failure(Exception("Failed to fetch job detail"))
            }
        } catch (e: Exception) {
            Log.e("JobRepository", "Exception: ${e.message}")
            Result.failure(e)
        }
    }
}
```

---

### 5. ViewModel (MVVM Pattern)

**File: `viewmodel/JobViewModel.kt`**
```kotlin
package com.lokerid.viewmodel

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.lokerid.models.Job
import com.lokerid.models.JobDetail
import com.lokerid.repository.JobRepository
import kotlinx.coroutines.launch

class JobViewModel : ViewModel() {
    
    private val repository = JobRepository()
    
    // LiveData for jobs list
    private val _jobs = MutableLiveData<List<Job>>()
    val jobs: LiveData<List<Job>> = _jobs
    
    // LiveData for loading state
    private val _isLoading = MutableLiveData<Boolean>()
    val isLoading: LiveData<Boolean> = _isLoading
    
    // LiveData for error messages
    private val _error = MutableLiveData<String?>()
    val error: LiveData<String?> = _error
    
    // LiveData for job detail
    private val _jobDetail = MutableLiveData<JobDetail>()
    val jobDetail: LiveData<JobDetail> = _jobDetail
    
    // Fetch jobs from API
    fun loadJobs() {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            
            val result = repository.fetchJobs()
            
            result.onSuccess { jobList ->
                _jobs.value = jobList
                _isLoading.value = false
            }
            
            result.onFailure { exception ->
                _error.value = exception.message
                _isLoading.value = false
            }
        }
    }
    
    // Fetch job detail
    fun loadJobDetail(jobUrl: String) {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            
            val result = repository.fetchJobDetail(jobUrl)
            
            result.onSuccess { detail ->
                _jobDetail.value = detail
                _isLoading.value = false
            }
            
            result.onFailure { exception ->
                _error.value = exception.message
                _isLoading.value = false
            }
        }
    }
    
    // Auto-refresh dengan interval
    fun startAutoRefresh(intervalMillis: Long = 900_000) { // 15 minutes
        viewModelScope.launch {
            while (true) {
                kotlinx.coroutines.delay(intervalMillis)
                loadJobs()
            }
        }
    }
}
```

---

### 6. Activity/Fragment Implementation

**File: `ui/MainActivity.kt`**
```kotlin
package com.lokerid.ui

import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.ViewModelProvider
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout
import com.lokerid.databinding.ActivityMainBinding
import com.lokerid.viewmodel.JobViewModel

class MainActivity : AppCompatActivity() {
    
    private lateinit var binding: ActivityMainBinding
    private lateinit var viewModel: JobViewModel
    private lateinit var adapter: JobAdapter
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)
        
        // Setup ViewModel
        viewModel = ViewModelProvider(this)[JobViewModel::class.java]
        
        // Setup RecyclerView
        setupRecyclerView()
        
        // Setup SwipeRefresh
        setupSwipeRefresh()
        
        // Observe LiveData
        observeViewModel()
        
        // Load jobs pertama kali
        viewModel.loadJobs()
        
        // ✅ AUTO-REFRESH setiap 15 menit (sesuai cache API)
        viewModel.startAutoRefresh(900_000) // 15 minutes
    }
    
    private fun setupRecyclerView() {
        adapter = JobAdapter { job ->
            // Handle click - navigate to detail
            navigateToDetail(job.sourceUrl)
        }
        
        binding.recyclerView.layoutManager = LinearLayoutManager(this)
        binding.recyclerView.adapter = adapter
    }
    
    private fun setupSwipeRefresh() {
        binding.swipeRefresh.setOnRefreshListener {
            viewModel.loadJobs()
        }
    }
    
    private fun observeViewModel() {
        // Observe jobs list
        viewModel.jobs.observe(this) { jobs ->
            adapter.submitList(jobs)
        }
        
        // Observe loading state
        viewModel.isLoading.observe(this) { isLoading ->
            binding.swipeRefresh.isRefreshing = isLoading
            binding.progressBar.visibility = if (isLoading) View.VISIBLE else View.GONE
        }
        
        // Observe errors
        viewModel.error.observe(this) { error ->
            error?.let {
                Toast.makeText(this, "Error: $it", Toast.LENGTH_SHORT).show()
            }
        }
    }
    
    private fun navigateToDetail(jobUrl: String) {
        // Navigate ke JobDetailActivity
        val intent = Intent(this, JobDetailActivity::class.java)
        intent.putExtra("JOB_URL", jobUrl)
        startActivity(intent)
    }
}
```

**File: `ui/JobDetailActivity.kt`**
```kotlin
package com.lokerid.ui

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.view.View
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.ViewModelProvider
import com.lokerid.databinding.ActivityJobDetailBinding
import com.lokerid.viewmodel.JobViewModel

class JobDetailActivity : AppCompatActivity() {
    
    private lateinit var binding: ActivityJobDetailBinding
    private lateinit var viewModel: JobViewModel
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityJobDetailBinding.inflate(layoutInflater)
        setContentView(binding.root)
        
        viewModel = ViewModelProvider(this)[JobViewModel::class.java]
        
        val jobUrl = intent.getStringExtra("JOB_URL") ?: return
        
        // Observe job detail
        viewModel.jobDetail.observe(this) { detail ->
            binding.apply {
                textJobTitle.text = detail.jobTitle
                textCompany.text = detail.company
                textLocation.text = detail.location
                textSalary.text = detail.salaryRange ?: "N/A"
                textJobType.text = detail.jobType ?: "N/A"
                textPostedDate.text = detail.postedDate
                
                // ✅ DESKRIPSI LENGKAP!
                textDescription.text = detail.description
                
                // Requirements list
                if (detail.requirements != null) {
                    val reqText = detail.requirements.joinToString("\n") { "• $it" }
                    textRequirements.text = reqText
                    textRequirements.visibility = View.VISIBLE
                } else {
                    textRequirements.visibility = View.GONE
                }
                
                // Button apply - open JobStreet
                buttonApply.setOnClickListener {
                    val intent = Intent(Intent.ACTION_VIEW, Uri.parse(detail.sourceUrl))
                    startActivity(intent)
                }
            }
        }
        
        // Observe loading
        viewModel.isLoading.observe(this) { isLoading ->
            binding.progressBar.visibility = if (isLoading) View.VISIBLE else View.GONE
        }
        
        // Load detail
        viewModel.loadJobDetail(jobUrl)
    }
}
```

---

## 🔄 Mekanisme Update Otomatis

### Opsi 1: Auto-Refresh dengan Interval (Recommended)
```kotlin
// Di ViewModel
viewModel.startAutoRefresh(900_000) // 15 menit (sama dengan cache API)
```

### Opsi 2: Pull-to-Refresh Manual
```kotlin
// SwipeRefreshLayout di XML
binding.swipeRefresh.setOnRefreshListener {
    viewModel.loadJobs() // User swipe down untuk refresh
}
```

### Opsi 3: Background Sync dengan WorkManager
```kotlin
// Untuk sync berkala di background
class JobSyncWorker(context: Context, params: WorkerParameters) : Worker(context, params) {
    override fun doWork(): Result {
        // Fetch jobs in background
        return Result.success()
    }
}

// Schedule periodic work
val syncWork = PeriodicWorkRequestBuilder<JobSyncWorker>(15, TimeUnit.MINUTES)
    .build()
WorkManager.getInstance(context).enqueue(syncWork)
```

---

## 📋 Layout XML Examples

**`activity_main.xml`:**
```xml
<?xml version="1.0" encoding="utf-8"?>
<androidx.swiperefreshlayout.widget.SwipeRefreshLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    android:id="@+id/swipeRefresh"
    android:layout_width="match_parent"
    android:layout_height="match_parent">

    <FrameLayout
        android:layout_width="match_parent"
        android:layout_height="match_parent">

        <androidx.recyclerview.widget.RecyclerView
            android:id="@+id/recyclerView"
            android:layout_width="match_parent"
            android:layout_height="match_parent"/>

        <ProgressBar
            android:id="@+id/progressBar"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:layout_gravity="center"
            android:visibility="gone"/>

    </FrameLayout>
</androidx.swiperefreshlayout.widget.SwipeRefreshLayout>
```

---

## ✅ Checklist Implementation

- [ ] Deploy API ke Vercel
- [ ] Copy URL production dan paste di `RetrofitClient.kt`
- [ ] Tambahkan dependencies di `build.gradle`
- [ ] Tambahkan internet permission di `AndroidManifest.xml`
- [ ] Copy semua class files di atas ke project Android
- [ ] Buat layout XML untuk MainActivity dan JobDetailActivity
- [ ] Build & Run aplikasi
- [ ] Test fetch jobs
- [ ] Test pull-to-refresh
- [ ] Test auto-refresh (tunggu 15 menit atau ubah interval untuk testing)

---

## 🎯 Next Steps

1. **Deploy dulu API-nya:**
   ```bash
   cd Job-Finder-API
   vercel --prod
   ```

2. **Copy URL Vercel ke Android:**
   Edit `RetrofitClient.kt` → ganti `BASE_URL`

3. **Test di Android:**
   - Build app
   - Check Logcat untuk debug
   - Pastikan internet permission enabled

4. **Optimize:**
   - Add caching dengan Room Database
   - Add offline mode
   - Add WorkManager untuk background sync

---

## 🚀 Kesimpulan

**Ya, REST API ini SIAP untuk Android!**

✅ API sudah production-ready  
✅ Support real-time scraping (on-request)  
✅ Auto-update setiap 15 menit (cache refresh)  
✅ Complete data (list + detail dengan deskripsi lengkap)  
✅ Android code examples lengkap (Kotlin + MVVM)

**Deploy sekarang dan mulai coding! 🎉**
