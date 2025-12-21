# Job Detail Endpoint Refactor - Dokumentasi

## 📋 Ringkasan Perubahan

Refactor endpoint job detail dari `GET /api/job?url=...` menjadi `GET /api/jobs/:jobId` untuk meningkatkan stabilitas, konsistensi, dan kemudahan penggunaan dari Android client.

---

## 🏗️ Perubahan Arsitektur

### Sebelum Refactor
```
GET /api/job?url=https%3A%2F%2Fid.jobstreet.com%2Fid%2Fjob%2F89023836
```
**Masalah:**
- URL panjang dan harus di-encode
- Sering terjadi error parsing
- Response kadang kosong
- Debugging sulit

### Setelah Refactor
```
GET /api/jobs/89023836
```
**Keuntungan:**
- ✅ URL sederhana, tidak perlu encoding
- ✅ jobId sebagai identifier utama
- ✅ Validasi jelas (400 untuk invalid, 404 untuk not found)
- ✅ Error handling lebih baik
- ✅ Scraping lebih konsisten

---

## 📁 File yang Diubah/Dibuat

### 1. **File Baru: `api/jobs/[jobId].js`**
   - Endpoint baru untuk job detail berdasarkan jobId
   - Dynamic routing Vercel
   - Build URL JobStreet secara internal
   - Validasi jobId format (6-10 digit numeric)

### 2. **File Diubah: `api/search.js`**
   - Menambahkan field `jobId` pada response job list
   - Extract jobId dari `source_url` menggunakan regex
   - Field `applyUrl` tetap ada untuk browser redirect

### 3. **File Diubah: `api/jobs.js`**
   - Menambahkan field `jobId` pada response job list
   - Transform jobs untuk include jobId
   - Konsisten dengan format search endpoint

### 4. **File Tidak Diubah: `api/job.js`**
   - Endpoint lama tetap ada (backward compatibility)
   - Tidak dihapus untuk menghindari breaking change

---

## 🔌 Endpoint Baru

### GET /api/jobs/:jobId

**Deskripsi:** Mengambil detail lengkap job berdasarkan jobId

**Parameter:**
- `jobId` (path parameter, required): Job ID dari JobStreet (6-10 digit numeric)

**Contoh Request:**
```bash
GET /api/jobs/89023836
```

**Response Success (200):**
```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Job detail retrieved successfully",
  "jobId": "89023836",
  "title": "Area Workshop Manager",
  "company": "Perusahaan Rahasia",
  "location": "Jawa Tengah",
  "classification": null,
  "salary": "Rp 7.000.000 - Rp 9.000.000",
  "postedLabel": "Baru saja",
  "jobType": "Full time",
  "description": [
    "Memimpin operasional workshop",
    "Mengelola tim teknisi",
    "Memastikan kualitas produk"
  ],
  "requirements": [
    "Minimal S1 Teknik",
    "Pengalaman minimal 3 tahun",
    "Memiliki sertifikasi terkait"
  ],
  "applyUrl": "https://id.jobstreet.com/id/job/89023836",
  "updated_at": "2024-01-15T10:30:00.000Z"
}
```

**Response Error - Invalid jobId (400):**
```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Invalid jobId format. JobId must be numeric (6-10 digits).",
  "received": "abc123",
  "example": "/api/jobs/89023836"
}
```

**Response Error - Job Not Found (404):**
```json
{
  "status": "error",
  "statusCode": 404,
  "message": "Job with ID '89023836' not found on JobStreet",
  "jobId": "89023836",
  "hint": "The job may have been removed or the jobId is incorrect."
}
```

**Response Error - Server Error (500):**
```json
{
  "status": "error",
  "statusCode": 500,
  "message": "Failed to scrape job detail",
  "error": "Internal server error",
  "jobId": "89023836"
}
```

---

## 📊 Format Response Job List (Updated)

### GET /api/jobs & GET /api/search

**Response Format (Updated):**
```json
{
  "status": "success",
  "statusCode": 200,
  "jobs": [
    {
      "jobId": "89023836",
      "title": "Area Workshop Manager",
      "company": "Perusahaan Rahasia",
      "location": "Jawa Tengah",
      "classification": "IT & Teknologi",
      "salary": "Rp 7.000.000 - Rp 9.000.000",
      "postedLabel": "Baru saja",
      "applyUrl": "https://id.jobstreet.com/id/job/89023836"
    }
  ]
}
```

**Catatan:**
- ✅ `jobId` WAJIB ada (extracted dari `applyUrl`)
- ✅ `applyUrl` hanya untuk redirect browser
- ✅ Android menggunakan `jobId` untuk API call detail

---

## 🔧 Implementasi Teknis

### 1. Validasi jobId
```javascript
function isValidJobId(jobId) {
  if (!jobId || typeof jobId !== 'string') return false;
  // JobStreet jobId is numeric, typically 6-10 digits
  return /^\d{6,10}$/.test(jobId.trim());
}
```

### 2. Build URL Internal
```javascript
function buildJobStreetUrl(jobId) {
  return `https://id.jobstreet.com/id/job/${jobId}`;
}
```

### 3. Extract jobId dari URL
```javascript
function extractJobId(url) {
  if (!url) return null;
  const match = url.match(/\/job\/(\d+)/);
  return match ? match[1] : null;
}
```

### 4. Error Handling
- **400 Bad Request**: jobId tidak valid (format salah)
- **404 Not Found**: Job tidak ditemukan di JobStreet
- **500 Internal Server Error**: Error server/scraping

---

## ⚠️ Breaking Changes

### Tidak Ada Breaking Change
- ✅ Endpoint lama `/api/job?url=...` **MASIH BERFUNGSI**
- ✅ Endpoint baru `/api/jobs/:jobId` adalah **TAMBAHAN**
- ✅ Job list endpoints tetap sama, hanya **menambah field `jobId`**

### Migration Guide untuk Android
1. Update Android client untuk menggunakan endpoint baru
2. Extract `jobId` dari response job list
3. Gunakan `GET /api/jobs/{jobId}` untuk detail
4. Endpoint lama bisa tetap digunakan selama transisi

---

## ✅ Testing

### Test Cases
1. ✅ Valid jobId → 200 OK dengan data lengkap
2. ✅ Invalid jobId format → 400 Bad Request
3. ✅ Non-existent jobId → 404 Not Found
4. ✅ JobStreet down → 500 Internal Server Error
5. ✅ Job list includes jobId → Verified

### Manual Testing
```bash
# Test valid jobId
curl "https://your-api.vercel.app/api/jobs/89023836"

# Test invalid format
curl "https://your-api.vercel.app/api/jobs/abc123"

# Test non-existent
curl "https://your-api.vercel.app/api/jobs/99999999"
```

---

## 📝 Catatan Penting

1. **Cache:** Endpoint menggunakan cache 15 menit (s-maxage=900)
2. **CORS:** Sudah dikonfigurasi untuk allow all origins
3. **Scraping:** Menggunakan User-Agent yang proper
4. **Error Handling:** Tidak return 500 untuk input user yang salah
5. **Logging:** Console log untuk debugging (production-safe)

---

## 🚀 Deployment

### Vercel
- File `api/jobs/[jobId].js` otomatis terdeteksi sebagai dynamic route
- Tidak perlu konfigurasi tambahan
- Deploy langsung via GitHub push

### Testing di Production
1. Push ke GitHub
2. Vercel auto-deploy
3. Test endpoint baru
4. Monitor logs untuk error

---

## 📚 Referensi

- Vercel Dynamic Routes: https://vercel.com/docs/concepts/functions/serverless-functions
- JobStreet URL Pattern: `https://id.jobstreet.com/id/job/{jobId}`
- Original Endpoint: `api/job.js` (masih berfungsi)

---

**Refactor Date:** 2024-01-15  
**Status:** ✅ Completed & Ready for Production

