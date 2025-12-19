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
        
        // Extract company - biasanya ada di link atau text "Lowongan di {Company}"
        let company = 'N/A';
        const companyText = $parent.text();
        
        // Try pattern 1: "Lowongan di {Company}"
        let companyMatch = companyText.match(/Lowongan di ([^\n\r]+?)(?:\s*Akan|Dibutuhkan|Ini adalah|\s*$)/i);
        if (companyMatch) {
          company = companyMatch[1].trim();
        }
        
        // Try pattern 2: "di{Company}" after job title
        if (company === 'N/A') {
          companyMatch = companyText.match(/di([A-Z][^\n\r]+?)(?:\s*Akan|Dibutuhkan|Ini adalah)/);
          if (companyMatch) {
            company = companyMatch[1].trim();
          }
        }
        
        // Clean up company name
        company = company.replace(/\s+jobs?$/i, '').trim();
        
        // Extract location - cari text yang berisi nama kota
        let location = 'Indonesia';
        const locationMatch = companyText.match(/(Jakarta|Bandung|Surabaya|Semarang|Medan|Yogyakarta|Bali|Tangerang|Bekasi|Depok|Bogor|Malang|Makassar|Palembang|Batam|Banten|Jawa [A-Za-z]+|Kalimantan [A-Za-z]+|Sulawesi [A-Za-z]+|Aceh)/i);
        if (locationMatch) {
          location = locationMatch[1];
        }
        
        // Extract posted date
        let postedDate = 'Recently';
        const dateMatch = companyText.match(/(\d+\+? hari yang lalu|Dibutuhkan segera|Akan segera berakhir)/i);
        if (dateMatch) {
          postedDate = dateMatch[1];
        }
        
        // Extract salary jika ada
        let salary = null;
        const salaryMatch = companyText.match(/Rp ([\d.,]+(?:\s*[–-]\s*Rp\s*[\d.,]+)?)\s*per\s*month/i);
        if (salaryMatch) {
          salary = salaryMatch[0];
        }
        
        // Extract description preview (snippet, bukan full description)
        let description = 'Klik link untuk melihat detail lengkap pekerjaan ini';
        
        // Cari deskripsi dari parent element
        const parentText = $parent.text().trim();
        
        // Hapus job title, company, location, date dari text
        let cleanText = parentText
          .replace(new RegExp(title.replace(/[()]/g, '\\$&'), 'gi'), '')
          .replace(new RegExp(company.replace(/[()]/g, '\\$&'), 'gi'), '')
          .replace(new RegExp(location.replace(/[()]/g, '\\$&'), 'gi'), '')
          .replace(new RegExp(postedDate.replace(/[()]/g, '\\$&'), 'gi'), '')
          .replace(/Akan segera berakhir|Dibutuhkan segera|Recently/gi, '')
          .replace(/Ini adalah lowongan kerja|Full time|Kontrak|Paruh waktu/gi, '')
          .replace(/di\s+PT\.?\s+[A-Z][^.!?]+/gi, '') // Remove company mentions
          .replace(/Jakarta|Surabaya|Bandung|Semarang|Medan/gi, '') // Remove cities
          .replace(/Jawa (Barat|Tengah|Timur)|Banten|Aceh|Kalimantan/gi, '') // Remove provinces
          .replace(/Rp\s*[\d.,]+/gi, '') // Remove salary
          .replace(/\s+/g, ' ')
          .trim();
        
        // Ambil 100 karakter pertama yang tersisa setelah cleaning
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
