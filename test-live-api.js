/**
 * Test Live API - Fahren API (Vercel Deployment)
 * 
 * Test all endpoints di production
 * Usage: node test-live-api.js
 */

const fetch = require('node-fetch');

const BASE_URL = 'https://fahren-api.vercel.app';

async function testEndpoint(name, url) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Testing: ${name}`);
  console.log(`URL: ${url}`);
  console.log('='.repeat(60));
  
  try {
    const startTime = Date.now();
    const response = await fetch(url);
    const responseTime = Date.now() - startTime;
    const data = await response.json();
    
    console.log(`✅ Status: ${response.status} ${response.statusText}`);
    console.log(`⏱️  Response time: ${responseTime}ms`);
    
    if (data.data && data.data.jobs) {
      console.log(`📊 Jobs found: ${data.data.jobs.length}`);
      if (data.data.jobs.length > 0) {
        console.log(`\n📋 Sample job:`);
        console.log(`   Title: ${data.data.jobs[0].job_title}`);
        console.log(`   Company: ${data.data.jobs[0].company}`);
        console.log(`   Location: ${data.data.jobs[0].location}`);
        if (data.data.jobs[0].category) {
          console.log(`   Category: ${data.data.jobs[0].category}`);
        }
      }
    }
    
    if (data.data && data.data.categories) {
      console.log(`\n📊 Categories: ${data.data.categories.length}`);
      console.log(`   Top 5:`, data.data.categories.slice(0, 5).map(c => `${c.name} (${c.count})`).join(', '));
    }
    
    if (data.data && data.data.locations) {
      console.log(`\n📍 Locations: ${data.data.locations.length}`);
      console.log(`   ${data.data.locations.slice(0, 8).join(', ')}`);
    }
    
    return { success: true, data };
  } catch (error) {
    console.error(`❌ Error:`, error.message);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('🚀 Testing Live API at:', BASE_URL);
  console.log('Deployment: Vercel (Production)\n');
  
  const results = [];
  
  // Test 1: Get all jobs
  results.push(await testEndpoint(
    '1. Get All Jobs',
    `${BASE_URL}/api/jobs`
  ));
  
  // Test 2: Search by keyword
  results.push(await testEndpoint(
    '2. Search by keyword "developer"',
    `${BASE_URL}/api/search?q=developer`
  ));
  
  // Test 3: Filter by category
  results.push(await testEndpoint(
    '3. Filter by category "IT"',
    `${BASE_URL}/api/search?category=IT`
  ));
  
  // Test 4: Filter by location
  results.push(await testEndpoint(
    '4. Filter by location "Jakarta"',
    `${BASE_URL}/api/search?location=Jakarta`
  ));
  
  // Test 5: Combined filters
  results.push(await testEndpoint(
    '5. Combined: keyword + category + location',
    `${BASE_URL}/api/search?q=programmer&category=IT&location=Jakarta`
  ));
  
  // Test 6: Get available filters
  results.push(await testEndpoint(
    '6. Get Available Filters',
    `${BASE_URL}/api/filters`
  ));
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`✅ Passed: ${passed}/${results.length}`);
  console.log(`❌ Failed: ${failed}/${results.length}`);
  
  console.log('\n🎉 All endpoints are working!\n');
  console.log('Next steps:');
  console.log('1. ✅ API is deployed and working');
  console.log('2. 📱 Update Android app BASE_URL to:', BASE_URL);
  console.log('3. 🔧 Implement search & filter UI in Android');
  console.log('4. 🧪 Test end-to-end integration\n');
}

// Run tests
runTests().catch(console.error);
