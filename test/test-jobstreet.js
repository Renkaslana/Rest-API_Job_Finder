/**
 * Test JobStreet Scraper
 * 
 * Run this test to verify JobStreet scraper is working
 * Usage: node test/test-jobstreet.js
 */

const { scrapeJobStreet } = require('../utils/scraper-jobstreet');

async function testJobStreetScraper() {
  console.log('========================================');
  console.log('Testing JobStreet Scraper');
  console.log('========================================\n');

  try {
    // Test 1: Basic scraping (page 1, default limit)
    console.log('Test 1: Basic scraping (page 1)...');
    const result1 = await scrapeJobStreet({ page: 1, limit: 10 });
    
    console.log('Success:', result1.success);
    console.log('Total jobs:', result1.meta.total);
    console.log('Jobs returned:', result1.data.length);
    console.log('Has next page:', result1.meta.has_next_page);
    
    if (result1.data.length > 0) {
      console.log('\nSample job:');
      console.log(JSON.stringify(result1.data[0], null, 2));
    }
    
    console.log('\n----------------------------------------\n');

    // Test 2: Pagination (page 2)
    console.log('Test 2: Pagination (page 2)...');
    const result2 = await scrapeJobStreet({ page: 2, limit: 5 });
    
    console.log('Success:', result2.success);
    console.log('Page:', result2.meta.page);
    console.log('Jobs returned:', result2.data.length);
    console.log('Has next page:', result2.meta.has_next_page);
    
    console.log('\n----------------------------------------\n');

    // Test 3: Large limit
    console.log('Test 3: Large limit (50 jobs)...');
    const result3 = await scrapeJobStreet({ page: 1, limit: 50 });
    
    console.log('Success:', result3.success);
    console.log('Jobs returned:', result3.data.length);
    
    console.log('\n========================================');
    console.log('All tests completed!');
    console.log('========================================');

    // Show summary of all jobs
    if (result1.data.length > 0) {
      console.log('\nJobs Summary (Test 1):');
      result1.data.forEach((job, index) => {
        console.log(`${index + 1}. ${job.job_title} - ${job.company} (${job.location})`);
      });
    }

  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

// Run test
testJobStreetScraper();
