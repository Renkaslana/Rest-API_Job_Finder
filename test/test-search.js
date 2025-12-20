/**
 * Test script for Search and Filters API endpoints
 * 
 * Usage:
 * node test/test-search.js
 */

const BASE_URL = 'http://localhost:3000';

async function testEndpoint(name, url) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Testing: ${name}`);
  console.log(`URL: ${url}`);
  console.log('='.repeat(60));
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log(`Response:`, JSON.stringify(data, null, 2));
    
    if (data.data && data.data.jobs) {
      console.log(`\nJobs found: ${data.data.jobs.length}`);
      if (data.data.jobs.length > 0) {
        console.log('First job:', data.data.jobs[0]);
      }
    }
    
    return data;
  } catch (error) {
    console.error(`❌ Error:`, error.message);
  }
}

async function runTests() {
  console.log('🧪 Starting API Tests...\n');
  
  // Test 1: Get all jobs
  await testEndpoint(
    'Get All Jobs',
    `${BASE_URL}/api/jobs`
  );
  
  // Test 2: Search by keyword
  await testEndpoint(
    'Search by keyword "developer"',
    `${BASE_URL}/api/search?q=developer`
  );
  
  // Test 3: Filter by category
  await testEndpoint(
    'Filter by category "IT"',
    `${BASE_URL}/api/search?category=IT`
  );
  
  // Test 4: Filter by location
  await testEndpoint(
    'Filter by location "Jakarta"',
    `${BASE_URL}/api/search?location=Jakarta`
  );
  
  // Test 5: Combined filters
  await testEndpoint(
    'Combined: keyword + category + location',
    `${BASE_URL}/api/search?q=developer&category=IT&location=Jakarta`
  );
  
  // Test 6: With limit
  await testEndpoint(
    'Search with limit=5',
    `${BASE_URL}/api/search?q=engineer&limit=5`
  );
  
  // Test 7: Get available filters
  await testEndpoint(
    'Get Available Filters',
    `${BASE_URL}/api/filters`
  );
  
  console.log('\n✅ All tests completed!\n');
}

// Run tests
runTests().catch(console.error);
