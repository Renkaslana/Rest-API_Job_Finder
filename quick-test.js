/**
 * Quick Test - Lihat Hasil Scraping
 * 
 * Run: node quick-test.js
 */

const scrapeJobs = require('./utils/scraper');

async function test() {
  console.log('\n🔍 Mulai scraping lowongan kerja...\n');
  console.log('━'.repeat(60));
  
  try {
    const jobs = await scrapeJobs();
    
    console.log(`\n✅ Berhasil scrape ${jobs.length} lowongan!\n`);
    console.log('━'.repeat(60));
    console.log('\n📋 DATA LOWONGAN (10 Pertama):\n');
    
    jobs.slice(0, 10).forEach((job, index) => {
      console.log(`${index + 1}. ${job.job_title}`);
      console.log(`   📍 Lokasi: ${job.location}`);
      console.log(`   🏢 Company: ${job.company}`);
      console.log(`   📅 Posted: ${job.posted_date}`);
      console.log(`   � Deskripsi: ${job.description}`);
      console.log(`   �🔗 Link: ${job.source_url}`);
      if (job.salary_range) {
        console.log(`   💰 Salary: ${job.salary_range}`);
      }
      console.log('');
    });
    
    console.log('━'.repeat(60));
    console.log('\n📊 RESPONSE JSON FORMAT:\n');
    
    const response = {
      status: 'success',
      creator: 'Job Finder API',
      statusCode: 200,
      statusMessage: 'OK',
      message: `Successfully scraped ${jobs.length} jobs`,
      ok: true,
      updated_at: new Date().toISOString(),
      data: {
        jobs: jobs.slice(0, 3), // Show only 3 for brevity
        metadata: {
          total: jobs.length,
          scraping_method: 'on-request',
          cache_duration: '15 minutes',
          source: 'JobStreet Indonesia'
        }
      }
    };
    
    console.log(JSON.stringify(response, null, 2));
    console.log('\n━'.repeat(60));
    console.log('\n✨ KESIMPULAN:');
    console.log(`   - Total jobs: ${jobs.length}`);
    console.log(`   - Source: JobStreet Indonesia`);
    console.log(`   - Format: JSON (ready for API)`);
    console.log(`   - Cache: 15 minutes`);
    console.log('\n💡 Next step: Deploy ke Vercel!\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
  }
}

test();
