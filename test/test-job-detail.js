/**
 * Test script untuk endpoint job detail
 * Usage: node test/test-job-detail.js
 */

import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

async function scrapeJobDetail(url) {
  console.log('🔍 Fetching job detail from:', url);
  console.log('');

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7'
      }
    });

    const html = await response.text();
    const $ = cheerio.load(html);

    // DEBUG: Print all possible description containers
    console.log('🔍 DEBUGGING - Looking for description selectors:');
    console.log('');
    
    console.log('1. data-automation="jobDescription":', 
      $('[data-automation="jobDescription"]').length);
    
    console.log('2. #job-description:', 
      $('#job-description').length);
    
    console.log('3. .job-description:', 
      $('.job-description').length);
    
    console.log('4. div contains "Job Description":', 
      $('div:contains("Job Description")').length);
    
    console.log('5. All divs count:', 
      $('div').length);
    
    console.log('6. All paragraphs count:', 
      $('p').length);
    
    console.log('');
    console.log('📄 First 5 paragraphs found:');
    $('p').slice(0, 5).each((i, elem) => {
      const text = $(elem).text().trim();
      if (text) {
        console.log(`   P${i + 1} (${text.length} chars):`, text.substring(0, 100));
      }
    });
    
    console.log('');
    console.log('🏷️ Looking for specific text patterns:');
    const bodyText = $('body').text();
    console.log('   Contains "Responsibilities"?', bodyText.includes('Responsibilities'));
    console.log('   Contains "Requirements"?', bodyText.includes('Requirements'));
    console.log('   Contains "Deskripsi"?', bodyText.includes('Deskripsi'));
    console.log('   Contains "Kualifikasi"?', bodyText.includes('Kualifikasi'));
    console.log('');

    // Extract details
    const jobTitle = $('h1[data-automation="job-detail-title"]').text().trim() 
                  || $('h1').first().text().trim();
    
    const company = $('[data-automation="advertiser-name"]').text().trim() 
                 || 'N/A';
    
    const location = $('[data-automation="job-detail-location"]').text().trim()
                  || 'N/A';
    
    const salary = $('[data-automation="job-detail-salary"]').text().trim()
                || null;
    
    const jobType = $('[data-automation="job-detail-work-type"]').text().trim()
                 || null;
    
    const postedDate = $('[data-automation="job-detail-date"]').text().trim()
                    || 'N/A';

    // Full description - collect all meaningful paragraphs
    const allParagraphs = [];
    $('p').each((i, elem) => {
      const text = $(elem).text().trim();
      if (text.length > 30 && !text.includes('cookie') && !text.includes('JobStreet')) {
        allParagraphs.push(text);
      }
    });
    
    const description = allParagraphs.length > 0 
      ? allParagraphs.join('\n\n')
      : 'Tidak ditemukan';

    console.log('✅ JOB DETAIL:');
    console.log('━'.repeat(60));
    console.log('📌 Title:', jobTitle);
    console.log('🏢 Company:', company);
    console.log('📍 Location:', location);
    console.log('💰 Salary:', salary || 'N/A');
    console.log('💼 Type:', jobType || 'N/A');
    console.log('📅 Posted:', postedDate);
    console.log('');
    console.log('📝 DESCRIPTION:');
    console.log('━'.repeat(60));
    console.log(description.substring(0, 500));
    if (description.length > 500) {
      console.log('... (' + description.length + ' characters total)');
    }
    console.log('');
    console.log('━'.repeat(60));
    console.log('✨ Total description length:', description.length, 'characters');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Test dengan URL dari JobStreet
const testUrl = 'https://id.jobstreet.com/id/job/88747725?type=standard&ref=search-standalone&origin=cardTitle';

scrapeJobDetail(testUrl);
