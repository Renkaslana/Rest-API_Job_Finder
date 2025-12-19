/**
 * Test Scraper Locally
 * 
 * Jalankan: npm test
 * Atau: node test/test-scraper.js
 */

const scrapeJobs = require('../utils/scraper');

async function test() {
  console.log('🧪 Testing Job Scraper...\n');
  console.log('━'.repeat(50));
  
  try {
    const startTime = Date.now();
    
    const jobs = await scrapeJobs();
    
    const duration = Date.now() - startTime;
    
    console.log(`\n✅ Success! Scraped ${jobs.length} jobs in ${duration}ms\n`);
    console.log('━'.repeat(50));
    
    if (jobs.length > 0) {
      console.log('\n📋 Sample Jobs (showing first 3):\n');
      
      jobs.slice(0, 3).forEach((job, index) => {
        console.log(`${index + 1}. ${job.job_title}`);
        console.log(`   Company: ${job.company}`);
        console.log(`   Location: ${job.location}`);
        console.log(`   Posted: ${job.posted_date}`);
        console.log(`   Source: ${job.source_name}`);
        console.log(`   URL: ${job.source_url}`);
        console.log('');
      });
      
      console.log('━'.repeat(50));
      console.log('\n✨ All fields present:');
      
      const hasAllFields = jobs.every(job => 
        job.job_title && 
        job.company && 
        job.location && 
        job.posted_date && 
        job.source_name && 
        job.source_url
      );
      
      console.log(hasAllFields ? '   ✅ Yes' : '   ⚠️  Some jobs have missing fields');
      
    } else {
      console.log('\n⚠️  No jobs found. Check your selectors!\n');
    }
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('\nStack trace:', error.stack);
  }
  
  console.log('\n━'.repeat(50));
}

test();
