/**
 * Web Scraper untuk Job Listings
 * 
 * Menggunakan Cheerio untuk parse HTML dan extract metadata
 * Target: Halaman job listing publik (contoh: Kalibrr public jobs)
 * 
 * PENTING:
 * - Hanya scrape metadata publik yang visible tanpa login
 * - Jangan scrape full job description untuk menghindari copyright issues
 * - Selalu sertakan source_url ke halaman asli
 * - Respect robots.txt dan rate limiting
 */

const fetch = require('node-fetch');
const cheerio = require('cheerio');

/**
 * Scrape job listings dari Kalibrr public page
 * 
 * Kalibrr dipilih karena:
 * - Halaman publik dapat diakses tanpa login
 * - Struktur HTML relatif stabil
 * - Tidak ada heavy JavaScript rendering
 * 
 * @returns {Promise<Array>} Array of job objects
 */
async function scrapeJobs() {
  try {
    /**
     * Target URL: Halaman job listing publik
     * 
     * JobStreet Indonesia dipilih karena:
     * - Halaman publik dengan 57,000+ lowongan kerja
     * - Data terstruktur dengan baik
     * - Informasi lengkap (title, company, location, salary, date)
     * 
     * Alternatif sumber yang bisa dicoba:
     * - https://www.kalibrr.com/id-ID/home/jobs
     * - https://id.indeed.com/jobs?q=programmer&l=Jakarta
     * 
     * CATATAN: Ganti URL sesuai sumber yang Anda pilih
     */
    const TARGET_URL = 'https://id.jobstreet.com/id/jobs/in-Indonesia';
    
    console.log(`[Scraper] Fetching jobs from: ${TARGET_URL}`);
    
    /**
     * HTTP Request ke target website
     * 
     * Headers penting:
     * - User-Agent: Identifikasi sebagai bot yang legitimate
     * - Accept: Specify bahwa kita request HTML
     */
    const response = await fetch(TARGET_URL, {
      headers: {
        'User-Agent': 'JobFinderBot/2.0 (Educational Purpose)',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'id-ID,id;q=0.9,en;q=0.8'
      },
      timeout: 10000 // 10 second timeout
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    
    /**
     * Load HTML ke Cheerio
     * Cheerio = jQuery-like syntax untuk server-side HTML parsing
     */
    const $ = cheerio.load(html);
    
    const jobs = [];

    /**
     * Parse Metadata dari HTML - JobStreet Indonesia
     * 
     * Struktur HTML JobStreet:
     * - Job cards menggunakan heading tags (h1, h3) untuk title
     * - Link wrap job details dengan href ke /id/job/{id}
     * - Info company dan location ada di text nodes
     * - Posted date dalam format relatif (X hari yang lalu)
     * 
     * TIPS CUSTOMIZE:
     * 1. Buka website di browser
     * 2. Inspect Element pada job card
     * 3. Catat selector yang konsisten
     * 4. Test di browser console terlebih dahulu
     */
    
    // JobStreet: Parse dari heading dan link structure
    $('h1, h3').each((index, element) => {
      try {
        const $heading = $(element);
        
        // Extract job title dari heading
        const title = $heading.text().trim();
        
        // Skip jika bukan job title (contoh: heading page)
        if (!title || title.length < 5 || title.includes('lowongan kerja')) {
          return;
        }
        
        // Cari link terdekat yang mengarah ke /id/job/
        const $parent = $heading.closest('article, div, section');
        let jobUrl = $heading.find('a').first().attr('href') || 
                     $parent.find('a[href*="/id/job/"]').first().attr('href');
        
        if (!jobUrl || !jobUrl.includes('/id/job/')) {
          return; // Skip jika bukan job listing
        }
        
        // Convert relative URL to absolute
        if (jobUrl && !jobUrl.startsWith('http')) {
          jobUrl = `https://id.jobstreet.com${jobUrl.startsWith('/') ? '' : '/'}${jobUrl}`;
        }
        
        const parentText = $parent.text();
        
        // IMPROVED: Extract company name dengan lebih akurat
        let company = 'Perusahaan Rahasia';
        
        // Try multiple patterns untuk company extraction
        const companyPatterns = [
          /Lowongan di\s+([^•\n]+?)(?:\s*•|\s*Akan|\s*Dibutuhkan|\s*\d+\s*hari|\s*$)/i,
          /di\s+(PT\.?\s+[^•\n]+?)(?:\s*•|\s*Akan|\s*Dibutuhkan|\s*\d+\s*hari)/i,
          /di\s+(CV\.?\s+[^•\n]+?)(?:\s*•|\s*Akan|\s*Dibutuhkan|\s*\d+\s*hari)/i,
          /di\s+([A-Z][a-zA-Z\s&]+(?:Indonesia|Tbk|Group)?)\s*(?:•|Akan|Dibutuhkan|\d+\s*hari)/i
        ];
        
        for (const pattern of companyPatterns) {
          const match = parentText.match(pattern);
          if (match && match[1]) {
            company = match[1]
              .replace(/\s+jobs?$/i, '')
              .replace(/Jakarta|Bandung|Surabaya|Semarang|Medan/gi, '')
              .replace(/\s+/g, ' ')
              .trim();
            if (company.length > 3 && company !== 'Perusahaan Rahasia') {
              break;
            }
          }
        }
        
        // IMPROVED: Extract location dengan lebih lengkap
        let location = 'Indonesia';
        const locationPatterns = [
          /(Jakarta\s+(?:Pusat|Selatan|Utara|Barat|Timur)?)/i,
          /(Bandung)/i,
          /(Surabaya)/i,
          /(Tangerang(?:\s+Selatan)?)/i,
          /(Bekasi)/i,
          /(Depok)/i,
          /(Bogor)/i,
          /(Semarang)/i,
          /(Medan)/i,
          /(Yogyakarta)/i,
          /(Bali)/i,
          /(Malang)/i,
          /(Makassar)/i,
          /(Palembang)/i,
          /(Batam)/i,
          /(Banten)/i,
          /(Jawa\s+(?:Barat|Tengah|Timur))/i,
          /(Kalimantan\s+(?:Barat|Tengah|Timur|Selatan|Utara))/i,
          /(Sulawesi\s+(?:Selatan|Utara|Tengah|Tenggara))/i,
          /(Aceh)/i
        ];
        
        for (const pattern of locationPatterns) {
          const match = parentText.match(pattern);
          if (match && match[1]) {
            location = match[1].trim();
            break;
          }
        }
        
        // IMPROVED: Extract posted date dengan format lebih akurat
        let postedDate = 'Baru saja';
        const datePatterns = [
          /(\d+\+?\s*hari\s+(?:yang\s+)?lalu)/i,
          /(\d+\+?\s*minggu\s+(?:yang\s+)?lalu)/i,
          /(\d+\+?\s*bulan\s+(?:yang\s+)?lalu)/i,
          /(Dibutuhkan\s+segera)/i,
          /(Akan\s+segera\s+berakhir)/i,
          /(Hari\s+ini)/i,
          /(Kemarin)/i
        ];
        
        for (const pattern of datePatterns) {
          const match = parentText.match(pattern);
          if (match && match[1]) {
            postedDate = match[1].trim();
            break;
          }
        }
        
        // IMPROVED: Extract salary dengan berbagai format
        let salary = null;
        const salaryPatterns = [
          /Rp\s*([\d.,]+(?:\s*[kK])?)\s*[-–—]\s*Rp\s*([\d.,]+(?:\s*[kK])?)\s*(?:per|\/)\s*(?:month|bulan)/i,
          /Rp\s*([\d.,]+)\s*[-–—]\s*Rp\s*([\d.,]+)/i,
          /Gaji:\s*Rp\s*([\d.,]+(?:\s*[kK])?)\s*[-–—]\s*Rp\s*([\d.,]+(?:\s*[kK])?)/i,
          /Salary:\s*Rp\s*([\d.,]+)\s*[-–—]\s*Rp\s*([\d.,]+)/i
        ];
        
        for (const pattern of salaryPatterns) {
          const match = parentText.match(pattern);
          if (match) {
            if (match[2]) {
              // Range format
              salary = `Rp ${match[1]} - Rp ${match[2]}`;
            } else {
              salary = match[0];
            }
            break;
          }
        }
        
        // Extract description preview (snippet, bukan full description)
        let description = 'Klik link untuk melihat detail lengkap pekerjaan ini';
        
        // Cari deskripsi dari parent element
        // Hapus job title, company, location, date dari text
        let cleanText = parentText
          .replace(new RegExp(title.replace(/[()]/g, '\\$&'), 'gi'), '')
          .replace(new RegExp(company.replace(/[()]/g, '\\$&'), 'gi'), '')
          .replace(new RegExp(location.replace(/[()]/g, '\\$&'), 'gi'), '')
          .replace(new RegExp(postedDate.replace(/[()]/g, '\\$&'), 'gi'), '')
          .replace(/Akan segera berakhir|Dibutuhkan segera|Baru saja|Recently/gi, '')
          .replace(/Ini adalah lowongan kerja|Full time|Kontrak|Paruh waktu/gi, '')
          .replace(/Lowongan di|di\s+PT\.?\s+[A-Z][^.!?]+/gi, '') // Remove company mentions
          .replace(/Jakarta|Surabaya|Bandung|Semarang|Medan|Tangerang|Bekasi/gi, '') // Remove cities
          .replace(/Jawa (Barat|Tengah|Timur)|Banten|Aceh|Kalimantan|Sulawesi/gi, '') // Remove provinces
          .replace(/Rp\s*[\d.,]+(?:\s*[kK])?/gi, '') // Remove salary mentions
          .replace(/\d+\s*(?:hari|minggu|bulan)\s+(?:yang\s+)?lalu/gi, '') // Remove date mentions
          .replace(/\s+/g, ' ')
          .trim();
        
        // Ambil 150 karakter pertama yang tersisa setelah cleaning
        if (cleanText.length > 50) {
          description = cleanText.substring(0, 150).trim();
          if (description.length === 150) {
            description += '...';
          }
        }

        // Validasi: hanya tambahkan jika ada title dan jobUrl valid
        if (title && jobUrl && title.length > 5) {
          const jobData = {
            job_title: title,
            company: company,
            location: location,
            posted_date: postedDate,
            description: description || 'Lihat detail di source untuk informasi lengkap',
            source_name: 'JobStreet Indonesia',
            source_url: jobUrl
          };
          
          // Tambahkan salary jika ada
          if (salary) {
            jobData.salary_range = salary;
          }
          
          jobs.push(jobData);
        }

      } catch (parseError) {
        console.warn('[Scraper] Failed to parse job item:', parseError.message);
      }
    });

    /**
     * Deduplikasi berdasarkan URL
     * Menghilangkan job yang URL-nya sama
     */
    const uniqueJobs = Array.from(
      new Map(jobs.map(job => [job.source_url, job])).values()
    );
    
    console.log(`[Scraper] Successfully scraped ${uniqueJobs.length} unique jobs (from ${jobs.length} total)`);

    /**
     * Limit hasil untuk performance
     * Ambil maksimal 30 jobs terbaru
     */
    const limitedJobs = uniqueJobs.slice(0, 30);

    /**
     * Fallback: Jika scraping gagal (struktur HTML berubah)
     * Return sample data agar API tidak error
     */
    if (limitedJobs.length === 0) {
      console.warn('[Scraper] No jobs found. Returning sample data.');
      return getSampleJobs();
    }

    return limitedJobs;

  } catch (error) {
    console.error('[Scraper] Error:', error.message);
    
    /**
     * Fallback ke sample data jika scraping gagal
     * Ini memastikan API tetap berfungsi meskipun target website down
     */
    return getSampleJobs();
  }
}

/**
 * Sample data sebagai fallback
 * Digunakan ketika scraping gagal atau untuk testing
 */
function getSampleJobs() {
  return [
    {
      job_title: 'Full Stack Developer - SAMPLE',
      company: 'PT Tech Indonesia',
      location: 'Jakarta',
      posted_date: '2 hari lalu',
      source_name: 'Sample Data (Scraping Failed)',
      source_url: 'https://id.jobstreet.com/id/jobs/in-Indonesia'
    },
    {
      job_title: 'UI/UX Designer - SAMPLE',
      company: 'Creative Studio',
      location: 'Bandung',
      posted_date: '3 hari lalu',
      source_name: 'Sample Data (Scraping Failed)',
      source_url: 'https://id.jobstreet.com/id/jobs/in-Indonesia'
    },
    {
      job_title: 'Data Analyst - SAMPLE',
      company: 'Finance Corp',
      location: 'Surabaya',
      posted_date: '1 minggu lalu',
      source_name: 'Sample Data (Scraping Failed)',
      source_url: 'https://id.jobstreet.com/id/jobs/in-Indonesia'
    }
  ];
}

module.exports = scrapeJobs;
