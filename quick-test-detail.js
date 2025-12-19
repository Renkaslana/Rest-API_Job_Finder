/**
 * Quick test untuk /api/job endpoint (job detail)
 * Usage: node quick-test-detail.js
 */

const jobDetailHandler = require('./api/job.js');

// Mock request & response objects
const mockReq = {
  method: 'GET',
  query: {
    // Ganti dengan URL job dari hasil quick-test.js
    url: 'https://id.jobstreet.com/id/job/88747725?type=standard&ref=search-standalone&origin=cardTitle'
  }
};

const mockRes = {
  statusCode: 200,
  headers: {},
  body: null,
  
  setHeader(key, value) {
    this.headers[key] = value;
  },
  
  status(code) {
    this.statusCode = code;
    return this;
  },
  
  json(data) {
    this.body = data;
    
    // Pretty print hasil
    console.log('\n✅ JOB DETAIL API RESPONSE:');
    console.log('━'.repeat(70));
    console.log('');
    console.log('📌 Title:', data.data.job_title);
    console.log('🏢 Company:', data.data.company);
    console.log('📍 Location:', data.data.location);
    console.log('💰 Salary:', data.data.salary_range || 'N/A');
    console.log('💼 Type:', data.data.job_type || 'N/A');
    console.log('📅 Posted:', data.data.posted_date);
    console.log('');
    console.log('📝 DESCRIPTION:');
    console.log('━'.repeat(70));
    console.log(data.data.description.substring(0, 500));
    if (data.data.description.length > 500) {
      console.log('... (' + data.data.description.length + ' characters total)');
    }
    console.log('');
    
    if (data.data.requirements && data.data.requirements.length > 0) {
      console.log('✅ REQUIREMENTS (' + data.data.requirements.length + ' items):');
      console.log('━'.repeat(70));
      data.data.requirements.slice(0, 5).forEach((req, i) => {
        console.log(`${i + 1}. ${req.substring(0, 100)}`);
      });
      console.log('');
    }
    
    console.log('━'.repeat(70));
    console.log('🔗 Source:', data.data.source_url);
    console.log('');
    console.log('📊 SUMMARY:');
    console.log('   - Description length:', data.data.description.length, 'characters');
    console.log('   - Requirements count:', data.data.requirements ? data.data.requirements.length : 0);
    console.log('   - Status:', data.status);
    console.log('');
  },
  
  end() {
    // Do nothing for test
  }
};

// Run test
console.log('🧪 Testing /api/job endpoint...');
console.log('📎 URL:', mockReq.query.url);

jobDetailHandler.default(mockReq, mockRes)
  .then(() => {
    console.log('✨ Test completed successfully!');
    console.log('');
    console.log('💡 TIP: Copy any job URL from quick-test.js and test here');
    console.log('   Edit mockReq.query.url at the top of this file');
  })
  .catch(error => {
    console.error('❌ Test failed:', error);
  });
