/**
 * Quick Test untuk /api/search endpoint
 * Test location-first search strategy
 */

const scrapeJobs = require('./utils/scraper');
const { extractClassifications } = require('./utils/scraper');

async function testLocationSearch() {
  console.log('\n🧪 Testing Location-First Search\n');
  console.log('═'.repeat(60));
  
  try {
    // Test 1: Location only
    console.log('\n1️⃣  TEST: Location-only (Tegal)');
    console.log('─'.repeat(60));
    
    const jobs = await scrapeJobs({
      location: 'Tegal',
      q: null,
      category: null
    });
    
    console.log(`✅ Scraped ${jobs.length} jobs`);
    
    // Extract classifications
    const classifications = extractClassifications(jobs);
    
    console.log(`\n📊 Classifications found: ${classifications.length}`);
    classifications.slice(0, 10).forEach((c, i) => {
      console.log(`   ${i + 1}. ${c.name}: ${c.count} jobs`);
    });
    
    console.log(`\n📋 Sample jobs (first 3):`);
    jobs.slice(0, 3).forEach((job, i) => {
      console.log(`\n   ${i + 1}. ${job.job_title}`);
      console.log(`      Company: ${job.company}`);
      console.log(`      Location: ${job.location}`);
      console.log(`      Category: ${job.category || 'N/A'}`);
      console.log(`      Posted: ${job.posted_date}`);
    });
    
    // Test 2: With classification filter
    console.log('\n\n2️⃣  TEST: Location + Classification (Tegal + Akuntansi)');
    console.log('─'.repeat(60));
    
    const filteredJobs = await scrapeJobs({
      location: 'Tegal',
      category: 'Akuntansi',
      q: null
    });
    
    console.log(`✅ Scraped ${filteredJobs.length} jobs with Akuntansi filter`);
    
    if (filteredJobs.length > 0) {
      console.log(`\n📋 Sample filtered jobs (first 2):`);
      filteredJobs.slice(0, 2).forEach((job, i) => {
        console.log(`\n   ${i + 1}. ${job.job_title}`);
        console.log(`      Company: ${job.company}`);
        console.log(`      Category: ${job.category || 'N/A'}`);
      });
    }
    
    // Test 3: Keyword search
    console.log('\n\n3️⃣  TEST: Keyword + Location (admin + Tegal)');
    console.log('─'.repeat(60));
    
    const keywordJobs = await scrapeJobs({
      q: 'admin',
      location: 'Tegal',
      category: null
    });
    
    console.log(`✅ Scraped ${keywordJobs.length} jobs matching "admin"`);
    
    if (keywordJobs.length > 0) {
      console.log(`\n📋 Sample keyword matches (first 2):`);
      keywordJobs.slice(0, 2).forEach((job, i) => {
        console.log(`\n   ${i + 1}. ${job.job_title}`);
        console.log(`      Company: ${job.company}`);
        console.log(`      Match: ${job.job_title.toLowerCase().includes('admin')}`);
      });
    }
    
    console.log('\n\n' + '═'.repeat(60));
    console.log('✅ All tests completed successfully!');
    console.log('═'.repeat(60) + '\n');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
  }
}

// Run test
testLocationSearch();
