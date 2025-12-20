/**
 * Job Finder API - Articles List Endpoint
 * 
 * Endpoint: GET /api/articles
 * 
 * Query Parameters:
 * - category: Filter by category (optional)
 * - limit: Number of articles to return (default: 10, max: 50)
 * - page: Page number (default: 1)
 * 
 * Returns list of article previews with external source references
 * Articles contain summary and link to full content on JobStreet
 * 
 * Cache: 24 hours (articles are static content)
 */

const cache = require('../utils/cache');

const CACHE_KEY = 'articles_data';
const CACHE_TTL = 24 * 60 * 60; // 24 hours

/**
 * Get articles data (embedded for Vercel compatibility)
 */
function getArticlesData() {
  return {
    metadata: {
      version: "2.0",
      lastUpdated: "2025-12-20",
      disclaimer: "Artikel ini adalah konten preview yang dibuat untuk tujuan referensi karir. Konten lengkap tersedia di sumber eksternal."
    },
    articles: [
      {
        id: "tips-interview-kerja-sukses",
        title: "10 Tips Interview Kerja yang Efektif",
        category: "Pengembangan Karir",
        thumbnail: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800",
        summary: "Persiapan interview yang matang adalah kunci sukses mendapatkan pekerjaan impian. Pelajari strategi komunikasi, cara menjawab pertanyaan sulit, dan tips membangun kesan profesional yang kuat kepada rekruter.",
        contentPreview: [
          {
            type: "paragraph",
            text: "Interview kerja adalah momen krusial dalam proses rekrutmen. Banyak kandidat yang sebenarnya berkualitas gagal karena kurang persiapan. Berikut tips yang dapat membantu Anda tampil maksimal."
          },
          {
            type: "bullet",
            items: [
              "Riset perusahaan dan posisi yang dilamar secara mendalam",
              "Siapkan jawaban untuk pertanyaan umum seperti 'Ceritakan tentang diri Anda'",
              "Latih body language dan kontak mata yang percaya diri",
              "Bawa portfolio atau dokumen pendukung yang relevan",
              "Siapkan 3-5 pertanyaan berkualitas untuk pewawancara"
            ]
          }
        ],
        externalSource: {
          name: "JobStreet Career Advice",
          label: "Baca artikel lengkap di JobStreet",
          url: "https://id.jobstreet.com/id/career-advice/interview-tips"
        }
      },
      {
        id: "negosiasi-gaji-efektif",
        title: "Panduan Negosiasi Gaji untuk Fresh Graduate",
        category: "Gaji & Benefit",
        thumbnail: "https://images.unsplash.com/photo-1554224311-beee460c201f?w=800",
        summary: "Negosiasi gaji bukan hanya tentang angka, tapi juga memahami nilai diri Anda di pasar kerja. Pelajari strategi negosiasi yang profesional, timing yang tepat, dan cara membangun argumen yang kuat berdasarkan riset pasar.",
        contentPreview: [
          {
            type: "paragraph",
            text: "Negosiasi gaji sering dianggap tabu, padahal ini adalah bagian penting dari proses rekrutmen. Dengan strategi yang tepat, Anda bisa mendapatkan kompensasi yang adil tanpa terkesan serakah."
          },
          {
            type: "bullet",
            items: [
              "Lakukan riset gaji pasar untuk posisi dan industri Anda",
              "Tunggu hingga perusahaan memberikan offer terlebih dahulu",
              "Fokus pada total kompensasi, bukan hanya gaji pokok",
              "Gunakan data konkret untuk mendukung ekspektasi Anda",
              "Bersikap fleksibel dan terbuka terhadap paket alternatif"
            ]
          }
        ],
        externalSource: {
          name: "JobStreet Career Advice",
          label: "Baca panduan lengkap di JobStreet",
          url: "https://id.jobstreet.com/id/career-advice/salary-negotiation"
        }
      },
      {
        id: "work-life-balance-tips",
        title: "Menjaga Work-Life Balance di Era Remote Working",
        category: "Kesejahteraan Kerja",
        thumbnail: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800",
        summary: "Remote working memberikan fleksibilitas, namun juga tantangan dalam memisahkan kehidupan kerja dan pribadi. Pelajari tips praktis mengelola waktu, mencegah burnout, dan membangun rutinitas yang sehat untuk produktivitas jangka panjang.",
        contentPreview: [
          {
            type: "paragraph",
            text: "Remote working mengaburkan batas antara kantor dan rumah. Tanpa strategi yang tepat, Anda bisa mengalami burnout atau justru kurang produktif. Berikut cara menjaga keseimbangan yang sehat."
          },
          {
            type: "bullet",
            items: [
              "Buat jadwal kerja yang konsisten dan komunikasikan ke tim",
              "Siapkan workspace khusus yang terpisah dari area pribadi",
              "Gunakan teknik time-blocking untuk mengatur prioritas",
              "Tetapkan ritual 'mulai' dan 'selesai' kerja setiap hari",
              "Jangan ragu untuk disconnect setelah jam kerja"
            ]
          }
        ],
        externalSource: {
          name: "JobStreet Career Advice",
          label: "Baca tips lengkap di JobStreet",
          url: "https://id.jobstreet.com/id/career-advice/work-life-balance"
        }
      },
      {
        id: "resume-ats-friendly",
        title: "Cara Membuat Resume yang ATS-Friendly",
        category: "Pengembangan Karir",
        thumbnail: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800",
        summary: "Banyak perusahaan menggunakan Applicant Tracking System (ATS) untuk menyaring CV. Resume Anda mungkin bagus, tapi jika tidak ATS-friendly, tidak akan pernah sampai ke rekruter. Pelajari cara mengoptimalkan format dan keyword yang tepat.",
        contentPreview: [
          {
            type: "paragraph",
            text: "ATS adalah software yang memindai dan meranking CV berdasarkan keyword dan format. Memahami cara kerjanya adalah kunci agar CV Anda tidak terfilter otomatis."
          },
          {
            type: "bullet",
            items: [
              "Gunakan format sederhana tanpa tabel, kolom, atau grafik rumit",
              "Masukkan keyword dari job description secara natural",
              "Hindari header/footer karena ATS sering tidak bisa membacanya",
              "Gunakan font standar seperti Arial, Calibri, atau Times New Roman",
              "Simpan dalam format .docx atau PDF (tergantung instruksi)"
            ]
          }
        ],
        externalSource: {
          name: "JobStreet Career Advice",
          label: "Baca panduan lengkap di JobStreet",
          url: "https://id.jobstreet.com/id/career-advice/ats-resume-tips"
        }
      },
      {
        id: "networking-karir-profesional",
        title: "Strategi Networking untuk Meningkatkan Karir",
        category: "Pengembangan Karir",
        thumbnail: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800",
        summary: "Networking bukan hanya soal mengumpulkan kontak, tapi membangun relasi profesional yang saling menguntungkan. Pelajari cara networking yang autentik, baik online maupun offline, untuk membuka peluang karir yang lebih luas.",
        contentPreview: [
          {
            type: "paragraph",
            text: "Banyak peluang karir terbaik tidak diiklankan secara publik. Networking yang efektif membuka akses ke hidden job market dan mempercepat perkembangan karir Anda."
          },
          {
            type: "bullet",
            items: [
              "Optimalkan profil LinkedIn dengan headline dan summary yang jelas",
              "Aktif di komunitas profesional yang relevan dengan industri Anda",
              "Berikan value terlebih dahulu sebelum meminta bantuan",
              "Follow up secara konsisten tanpa terkesan memaksa",
              "Hadiri seminar, workshop, atau meetup industri secara rutin"
            ]
          }
        ],
        externalSource: {
          name: "JobStreet Career Advice",
          label: "Baca artikel lengkap di JobStreet",
          url: "https://id.jobstreet.com/id/career-advice/networking-tips"
        }
      }
    ]
  };
}

/**
 * Load articles with caching
 */
function loadArticles() {
  // Check cache first
  const cached = cache.get(CACHE_KEY);
  if (cached) {
    console.log('[Articles API] Using cached data');
    return cached;
  }

  // Load embedded data
  console.log('[Articles API] Loading embedded data');
  const data = getArticlesData();

  // Cache it
  cache.set(CACHE_KEY, data, CACHE_TTL);

  return data;
}

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only accept GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      status: 'error',
      statusCode: 405,
      message: 'Method not allowed. Use GET.'
    });
  }

  try {
    // Parse query parameters
    const {
      category = '',
      limit = '10',
      page = '1'
    } = req.query;

    const limitNum = Math.min(parseInt(limit) || 10, 50);
    const pageNum = Math.max(parseInt(page) || 1, 1);
    const offset = (pageNum - 1) * limitNum;

    // Cache headers (24 hours)
    res.setHeader(
      'Cache-Control',
      's-maxage=86400, stale-while-revalidate'
    );

    // Load articles data
    const data = loadArticles();
    let articles = data.articles || [];

    // Filter by category if provided
    if (category) {
      articles = articles.filter(article => article.category === category);
    }

    // Calculate pagination
    const totalResults = articles.length;
    const totalPages = Math.ceil(totalResults / limitNum);

    // Get articles for current page (preview only)
    const paginatedArticles = articles
      .slice(offset, offset + limitNum)
      .map(article => ({
        id: article.id,
        title: article.title,
        category: article.category,
        thumbnail: article.thumbnail,
        summary: article.summary,
        source: {
          name: article.externalSource?.name || 'JobStreet Career Advice',
          url: article.externalSource?.url || ''
        }
      }));

    // Success response with new structure
    return res.status(200).json({
      status: 'success',
      statusCode: 200,
      message: `Found ${totalResults} articles`,
      meta: {
        page: pageNum,
        limit: limitNum,
        total: totalResults,
        totalPages: totalPages,
        hasNext: pageNum < totalPages,
        hasPrevious: pageNum > 1
      },
      articles: paginatedArticles
    });

  } catch (error) {
    console.error('[Articles API] Error:', error);

    return res.status(500).json({
      status: 'error',
      statusCode: 500,
      message: 'Failed to load articles',
      ok: false,
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal error'
    });
  }
};
