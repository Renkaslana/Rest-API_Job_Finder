package com.lokerid.ui.home

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import com.lokerid.databinding.FragmentHomeBinding
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch

@AndroidEntryPoint
class HomeFragment : Fragment() {
    
    private var _binding: FragmentHomeBinding? = null
    private val binding get() = _binding!!
    
    private val viewModel: HomeViewModel by viewModels()
    
    private val urgentJobsAdapter = JobAdapter { job ->
        // Navigate to detail
        navigateToJobDetail(job)
    }
    
    private val allJobsAdapter = JobAdapter { job ->
        navigateToJobDetail(job)
    }
    
    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentHomeBinding.inflate(inflater, container, false)
        return binding.root
    }
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        setupRecyclerViews()
        setupObservers()
        setupListeners()
        
        // Load data
        viewModel.loadHomeData()
    }
    
    private fun setupRecyclerViews() {
        // Urgent jobs - horizontal scroll
        binding.rvUrgentJobs.apply {
            layoutManager = LinearLayoutManager(requireContext(), LinearLayoutManager.HORIZONTAL, false)
            adapter = urgentJobsAdapter
        }
        
        // All jobs - vertical
        binding.rvAllJobs.apply {
            layoutManager = LinearLayoutManager(requireContext())
            adapter = allJobsAdapter
            isNestedScrollingEnabled = false
        }
    }
    
    private fun setupObservers() {
        viewLifecycleOwner.lifecycleScope.launch {
            // Urgent jobs
            viewModel.urgentJobs.collect { jobs ->
                if (jobs.isEmpty()) {
                    binding.layoutUrgent.visibility = View.GONE
                } else {
                    binding.layoutUrgent.visibility = View.VISIBLE
                    urgentJobsAdapter.submitList(jobs)
                }
            }
        }
        
        viewLifecycleOwner.lifecycleScope.launch {
            // All jobs
            viewModel.allJobs.collect { jobs ->
                allJobsAdapter.submitList(jobs.take(10)) // Show first 10
            }
        }
        
        viewLifecycleOwner.lifecycleScope.launch {
            // Loading state
            viewModel.isLoading.collect { isLoading ->
                binding.progressBar.visibility = if (isLoading) View.VISIBLE else View.GONE
            }
        }
        
        viewLifecycleOwner.lifecycleScope.launch {
            // Error state
            viewModel.error.collect { error ->
                error?.let {
                    showError(it)
                }
            }
        }
    }
    
    private fun setupListeners() {
        // View all button
        binding.btnViewAll.setOnClickListener {
            // Navigate to jobs list fragment
            navigateToAllJobs()
        }
        
        // Category chips
        binding.chipIT.setOnClickListener {
            navigateToCategory("IT & Teknologi")
        }
        
        binding.chipMarketing.setOnClickListener {
            navigateToCategory("Pemasaran & Komunikasi")
        }
        
        binding.chipSales.setOnClickListener {
            navigateToCategory("Penjualan")
        }
        
        // Search
        binding.searchView.setOnQueryTextListener(object : androidx.appcompat.widget.SearchView.OnQueryTextListener {
            override fun onQueryTextSubmit(query: String?): Boolean {
                query?.let {
                    navigateToSearch(it)
                }
                return true
            }
            
            override fun onQueryTextChange(newText: String?): Boolean {
                return false
            }
        })
    }
    
    private fun navigateToJobDetail(job: Job) {
        // Implementation
    }
    
    private fun navigateToAllJobs() {
        // Implementation
    }
    
    private fun navigateToCategory(category: String) {
        // Implementation
    }
    
    private fun navigateToSearch(query: String) {
        // Implementation
    }
    
    private fun showError(message: String) {
        // Show snackbar or toast
    }
    
    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
