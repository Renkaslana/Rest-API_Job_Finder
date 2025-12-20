package com.lokerid.ui.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.lokerid.data.model.Job
import com.lokerid.data.repository.JobRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class HomeViewModel @Inject constructor(
    private val repository: JobRepository
) : ViewModel() {
    
    private val _urgentJobs = MutableStateFlow<List<Job>>(emptyList())
    val urgentJobs: StateFlow<List<Job>> = _urgentJobs.asStateFlow()
    
    private val _allJobs = MutableStateFlow<List<Job>>(emptyList())
    val allJobs: StateFlow<List<Job>> = _allJobs.asStateFlow()
    
    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()
    
    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()
    
    fun loadHomeData() {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            
            try {
                // Fetch all jobs
                val response = repository.getAllJobs()
                
                if (response.isSuccessful && response.body() != null) {
                    val jobsResponse = response.body()!!
                    val jobs = jobsResponse.jobs
                    
                    // Filter urgent jobs (yang ada status badge)
                    val urgent = jobs.filter { job ->
                        job.status != null && (
                            job.status.contains("segera", ignoreCase = true) ||
                            job.status.contains("berakhir", ignoreCase = true)
                        )
                    }
                    
                    // Sort all jobs by posted date (newest first)
                    val sorted = jobs.sortedBy { parsePostedDate(it.posted_date) }
                    
                    _urgentJobs.value = urgent
                    _allJobs.value = sorted
                    
                } else {
                    _error.value = "Gagal memuat data: ${response.message()}"
                }
                
            } catch (e: Exception) {
                _error.value = "Error: ${e.message}"
            } finally {
                _isLoading.value = false
            }
        }
    }
    
    /**
     * Parse posted date string to integer for sorting
     * "Baru saja" -> 0
     * "2 hari yang lalu" -> 2
     * "3 minggu yang lalu" -> 21
     * "1 bulan yang lalu" -> 30
     */
    private fun parsePostedDate(dateStr: String): Int {
        return when {
            dateStr.contains("Baru", ignoreCase = true) -> 0
            dateStr.contains("Hari ini", ignoreCase = true) -> 0
            dateStr.contains("Kemarin", ignoreCase = true) -> 1
            
            dateStr.contains("hari", ignoreCase = true) -> {
                // Extract number from "24 hari yang lalu"
                val number = dateStr.replace(Regex("[^0-9]"), "")
                number.toIntOrNull() ?: 999
            }
            
            dateStr.contains("minggu", ignoreCase = true) -> {
                val number = dateStr.replace(Regex("[^0-9]"), "")
                val weeks = number.toIntOrNull() ?: 1
                weeks * 7
            }
            
            dateStr.contains("bulan", ignoreCase = true) -> {
                val number = dateStr.replace(Regex("[^0-9]"), "")
                val months = number.toIntOrNull() ?: 1
                months * 30
            }
            
            else -> 999 // Unknown format, put at end
        }
    }
}
