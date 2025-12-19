// File: ui/JobAdapter.kt
// RecyclerView Adapter untuk menampilkan list jobs

package com.lokerid.ui

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.lokerid.databinding.ItemJobBinding
import com.lokerid.models.Job

class JobAdapter(
    private val onItemClick: (Job) -> Unit
) : ListAdapter<Job, JobAdapter.JobViewHolder>(JobDiffCallback()) {
    
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): JobViewHolder {
        val binding = ItemJobBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        )
        return JobViewHolder(binding, onItemClick)
    }
    
    override fun onBindViewHolder(holder: JobViewHolder, position: Int) {
        holder.bind(getItem(position))
    }
    
    class JobViewHolder(
        private val binding: ItemJobBinding,
        private val onItemClick: (Job) -> Unit
    ) : RecyclerView.ViewHolder(binding.root) {
        
        fun bind(job: Job) {
            binding.apply {
                textJobTitle.text = job.jobTitle
                textCompany.text = job.company
                textLocation.text = job.location
                textPostedDate.text = job.postedDate
                
                // Preview description (singkat)
                textDescription.text = job.description
                
                // Salary (optional)
                if (!job.salaryRange.isNullOrEmpty()) {
                    textSalary.text = job.salaryRange
                    textSalary.visibility = android.view.View.VISIBLE
                } else {
                    textSalary.visibility = android.view.View.GONE
                }
                
                // Click listener
                root.setOnClickListener {
                    onItemClick(job)
                }
            }
        }
    }
    
    class JobDiffCallback : DiffUtil.ItemCallback<Job>() {
        override fun areItemsTheSame(oldItem: Job, newItem: Job): Boolean {
            return oldItem.sourceUrl == newItem.sourceUrl
        }
        
        override fun areContentsTheSame(oldItem: Job, newItem: Job): Boolean {
            return oldItem == newItem
        }
    }
}
