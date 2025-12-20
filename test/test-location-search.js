/**
 * Test Location-First Search Strategy
 * 
 * Test scenarios:
 * 1. Location-only search: Tegal
 * 2. Location + classification: Tegal + Akuntansi
 * 3. Keyword + location: admin + Tegal
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000'; // Change if different

async function testLocationSearch() {
  console.log('\n🧪 TEST 1: Location-only search (Tegal)');
  console.log('━'.repeat(60));
  
  try {
    const response = await fetch(`${BASE_URL}/api/search?location=Tegal`);
    const data = await response.json();
    
    console.log('Query:', data.query);
    console.log('Meta:', data.meta);
    console.log(`\n✅ Found ${data.jobs.length} jobs`);
    console.log(`\n📊 Classifications (${data.classifications.length}):`);
    data.classifications.slice(0, 5).forEach(c => {
      console.log(`   - ${c.name}: ${c.count}`);
    });
    
    console.log('\n📋 Sample jobs (first 3):');
    data.jobs.slice(0, 3).forEach((job, i) => {
      console.log(`   ${i + 1}. ${job.title}`);
      console.log(`      Company: ${job.company}`);
      console.log(`      Location: ${job.location}`);
      console.log(`      Category: ${job.category}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function testLocationWithClassification() {
  console.log('\n\n🧪 TEST 2: Location + Classification (Tegal + Akuntansi)');
  console.log('━'.repeat(60));
  
  try {
    const response = await fetch(`${BASE_URL}/api/search?location=Tegal&category=Akuntansi`);
    const data = await response.json();
    
    console.log('Query:', data.query);
    console.log('Meta:', data.meta);
    console.log(`\n✅ Found ${data.jobs.length} jobs`);
    
    console.log('\n📋 Sample jobs (first 3):');
    data.jobs.slice(0, 3).forEach((job, i) => {
      console.log(`   ${i + 1}. ${job.title}`);
      console.log(`      Company: ${job.company}`);
      console.log(`      Category: ${job.category}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function testKeywordWithLocation() {
  console.log('\n\n🧪 TEST 3: Keyword + Location (admin + Tegal)');
  console.log('━'.repeat(60));
  
  try {
    const response = await fetch(`${BASE_URL}/api/search?q=admin&location=Tegal`);
    const data = await response.json();
    
    console.log('Query:', data.query);
    console.log('Meta:', data.meta);
    console.log(`\n✅ Found ${data.jobs.length} jobs`);
    
    console.log('\n📋 Sample jobs (first 3):');
    data.jobs.slice(0, 3).forEach((job, i) => {
      console.log(`   ${i + 1}. ${job.title}`);
      console.log(`      Company: ${job.company}`);
      console.log(`      Keyword match: ${job.title.toLowerCase().includes('admin')}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run tests
async function runTests() {
  console.log('\n🎯 LOCATION-FIRST SEARCH STRATEGY TESTS');
  console.log('═'.repeat(60));
  
  await testLocationSearch();
  await testLocationWithClassification();
  await testKeywordWithLocation();
  
  console.log('\n\n✨ Tests completed!');
  console.log('═'.repeat(60));
}

runTests().catch(console.error);
