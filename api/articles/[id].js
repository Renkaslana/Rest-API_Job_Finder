/**
 * Job Finder API - Article Detail Endpoint
 * 
 * Endpoint: GET /api/articles/[id]
 * 
 * Returns article preview with content preview and link to full article
 * 
 * Content Preview Structure:
 * - paragraph: Text paragraph (self-written)
 * - bullet: List of key points (self-written)
 * - No full article content from JobStreet
 * 
 * Cache: 24 hours (static content)
 */

const cache = require('../../utils/cache');

const CACHE_KEY_PREFIX = 'article_';
const CACHE_TTL = 24 * 60 * 60; // 24 hours

/**
 * Get articles data (embedded for Vercel compatibility)
 */
function getArticlesData() {
  return {
    articles: [
      {
        id: "tips-interview-kerja-sukses",
        title: "10 Tips Interview Kerja yang Efektif",
        category: "Pengembangan Karir",
        thumbnail: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800",
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
          },
          {
            type: "paragraph",
            text: "Ingat, interview adalah komunikasi dua arah. Anda juga perlu mengevaluasi apakah perusahaan dan budaya kerjanya cocok dengan Anda."
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
          },
          {
            type: "paragraph",
            text: "Negosiasi yang sukses adalah win-win solution. Tunjukkan bahwa Anda memahami nilai yang akan Anda bawa untuk perusahaan."
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
          },
          {
            type: "paragraph",
            text: "Kesehatan mental dan fisik adalah investasi jangka panjang. Prioritaskan kesejahteraan Anda untuk performa kerja yang berkelanjutan."
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
          },
          {
            type: "paragraph",
            text: "Resume yang ATS-friendly bukan berarti membosankan. Tetap tunjukkan pencapaian konkret dan value yang Anda tawarkan."
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
          },
          {
            type: "paragraph",
            text: "Networking adalah investasi jangka panjang. Bangun hubungan yang genuine, bukan hanya transaksional."
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
 * Load single article by ID with caching
 */
function loadArticleById(id) {
  const cacheKey = `${CACHE_KEY_PREFIX}${id}`;

  // Check cache first
  const cached = cache.get(cacheKey);
  if (cached) {
    console.log(`[Article Detail API] Using cached data for ${id}`);
    return cached;
  }

  // Load embedded data
  console.log(`[Article Detail API] Loading embedded data for ${id}`);
  const data = getArticlesData();

  // Find article by ID
  const article = data.articles?.find(a => a.id === id);

  if (article) {
    // Cache it
    cache.set(cacheKey, article, CACHE_TTL);
  }

  return article;
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
    // Get article ID from path parameter
    // Vercel uses req.query for dynamic routes
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        status: 'error',
        statusCode: 400,
        message: 'Article ID is required'
      });
    }

    // Cache headers (24 hours)
    res.setHeader(
      'Cache-Control',
      's-maxage=86400, stale-while-revalidate'
    );

    // Load article
    const article = loadArticleById(id);

    if (!article) {
      return res.status(404).json({
        status: 'error',
        statusCode: 404,
        message: `Article with ID '${id}' not found`
      });
    }

    // Success response with preview content only
    return res.status(200).json({
      status: 'success',
      statusCode: 200,
      message: 'Article found',
      id: article.id,
      title: article.title,
      category: article.category,
      coverImage: article.thumbnail,
      contentPreview: article.contentPreview || [],
      externalSource: {
        label: article.externalSource?.label || 'Baca selengkapnya di JobStreet',
        url: article.externalSource?.url || ''
      }
    });

  } catch (error) {
    console.error('[Article Detail API] Error:', error);

    return res.status(500).json({
      status: 'error',
      statusCode: 500,
      message: 'Failed to load article detail',
      ok: false,
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal error'
    });
  }
};
