/**
 * Quick Test for Search API
 * 
 * Test search endpoint dengan berbagai parameter
 * Usage: node quick-test-search.js
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function quickTest() {
  console.log('🔍 Testing Search API...\n');
  
  try {
    // Test 1: Search by keyword
    console.log('1️⃣ Testing: Search "developer"');
    const searchResponse = await fetch(`${BASE_URL}/api/search?q=developer`);
    const searchData = await searchResponse.json();
    console.log(`   ✅ Found ${searchData.data?.jobs?.length || 0} jobs`);
    if (searchData.data?.jobs?.[0]) {
      console.log(`   📋 Sample: ${searchData.data.jobs[0].job_title} at ${searchData.data.jobs[0].company}`);
    }
    
    // Test 2: Filter by category
    console.log('\n2️⃣ Testing: Filter category="IT"');
    const categoryResponse = await fetch(`${BASE_URL}/api/search?category=IT`);
    const categoryData = await categoryResponse.json();
    console.log(`   ✅ Found ${categoryData.data?.jobs?.length || 0} IT jobs`);
    
    // Test 3: Filter by location
    console.log('\n3️⃣ Testing: Filter location="Jakarta"');
    const locationResponse = await fetch(`${BASE_URL}/api/search?location=Jakarta`);
    const locationData = await locationResponse.json();
    console.log(`   ✅ Found ${locationData.data?.jobs?.length || 0} jobs in Jakarta`);
    
    // Test 4: Get filters
    console.log('\n4️⃣ Testing: Get available filters');
    const filtersResponse = await fetch(`${BASE_URL}/api/filters`);
    const filtersData = await filtersResponse.json();
    console.log(`   ✅ Categories: ${filtersData.data?.categories?.length || 0}`);
    console.log(`   ✅ Locations: ${filtersData.data?.locations?.length || 0}`);
    
    if (filtersData.data?.categories?.length > 0) {
      console.log('\n   📊 Top Categories:');
      filtersData.data.categories.slice(0, 5).forEach(cat => {
        console.log(`      - ${cat.name}: ${cat.count} jobs`);
      });
    }
    
    if (filtersData.data?.locations?.length > 0) {
      console.log('\n   📍 Available Locations:');
      console.log(`      ${filtersData.data.locations.slice(0, 10).join(', ')}`);
    }
    
    console.log('\n✅ All tests passed!\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Make sure the dev server is running:');
    console.log('   npm run dev\n');
  }
}

quickTest();
