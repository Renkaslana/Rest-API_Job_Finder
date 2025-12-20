# 🏠 Home Screen Implementation Guide

## 📌 Kesimpulan & Rekomendasi

### ❌ Jangan Gunakan `/api/jobs/latest`
- **Status:** ⚠️ Tidak stabil (scraping gagal)
- **Alasan:** JobStreet memblokir parameter `tags=new`
- **Return:** Sample data (bukan data real)

### ✅ Gunakan `/api/jobs/all` untuk Home Screen

**Kenapa `/api/jobs/all` lebih baik?**
1. ✅ **Data Real** - Scraping 30 lowongan nyata dari JobStreet
2. ✅ **Stabil** - Tidak ada blocking dari JobStreet
3. ✅ **Lengkap** - Termasuk `posted_date` dan `status` badge
4. ✅ **Fleksibel** - Bisa di-filter dan sort di client-side

---

## 🏠 Desain Home Screen yang Direkomendasikan

```
┌─────────────────────────────────┐
│  🏠 Cari Lowongan Kerja          │
│  🔍 [Search: posisi, skill...]   │
├─────────────────────────────────┤
│                                 │
│  ⚡ LOWONGAN URGENT              │  ← Filter: jobs.filter { status != null }
│  ┌──────────────────────────┐   │
│  │ 🔥 DIBUTUHKAN SEGERA     │   │
│  │ UI/UX Designer           │   │
│  │ PT Kreatif • Jakarta     │   │
│  │ 5 hari lalu • Rp 8-12jt  │   │
│  └──────────────────────────┘   │
│  [Scroll horizontal →]          │
│                                 │
├─────────────────────────────────┤
│                                 │
│  📌 SEMUA LOWONGAN    [Lihat >>]│  ← Sort by posted_date (newest first)
│  ┌──────────────────────────┐   │
│  │ Full Stack Developer     │   │
│  │ Tech Startup • Bandung   │   │
│  │ 2 hari lalu              │   │
│  └──────────────────────────┘   │
│  ┌──────────────────────────┐   │
│  │ Marketing Manager        │   │
│  │ E-commerce • Surabaya    │   │
│  │ 1 minggu lalu            │   │
│  └──────────────────────────┘   │
│                                 │
├─────────────────────────────────┤
│  🎯 KATEGORI POPULER            │
│  [IT] [Marketing] [Sales]       │
│  [Design] [Finance] [HR]        │
└─────────────────────────────────┘
```

---

## 📡 API Endpoint untuk Home

### GET `/api/jobs/all`

**URL:** `https://fahren-api.vercel.app/api/jobs/all`

**Query Parameters:**
```
page (optional) - Default: 1
```

**Response Structure:**
```json
{
  "success": true,
  "meta": {
    "totalJobs": 30,
    "page": 1,
    "source": "jobstreet",
    "type": "all",
    "scrapedAt": "2025-12-20T06:00:00.000Z"
  },
  "classifications": [
    { "name": "IT & Teknologi", "count": 8 },
    { "name": "Penjualan", "count": 6 },
    { "name": "Pemasaran & Komunikasi", "count": 4 }
  ],
  "jobs": [
    {
      "job_title": "Senior UI/UX Designer",
      "company": "PT Kreatif Indonesia",
      "location": "Jakarta",
      "category": "Design",
      "posted_date": "5 hari yang lalu",          // ✅ Tanggal posting real
      "status": "Dibutuhkan segera",              // ✅ Badge urgency (optional)
      "salary_range": "Rp 8.000.000 - Rp 12.000.000",
      "description": "Mencari UI/UX Designer berpengalaman...",
      "source_name": "JobStreet Indonesia",
      "source_url": "https://id.jobstreet.com/id/job/12345",
      "benefits": [
        "BPJS Kesehatan",
        "Insentif Menarik",
        "Full time"
      ]
    }
  ]
}
```

---

## 🎨 UI Components

### Urgent Job Card (Horizontal Scroll)
- ✅ Red badge dengan status ("🔥 DIBUTUHKAN SEGERA")
- ✅ Border warna primary (highlight)
- ✅ Card width: 280dp
- ✅ Horizontal RecyclerView

### Regular Job Card (Vertical List)
- ✅ Standard card layout
- ✅ Show posted_date di pojok kanan bawah
- ✅ Optional: Show status badge jika ada

---

## 📊 Data Flow

```
1. User opens app
   ↓
2. HomeViewModel.loadHomeData()
   ↓
3. API Call: GET /api/jobs/all
   ↓
4. Response: 30 jobs dengan posted_date & status
   ↓
5. Filter & Sort:
   - urgentJobs = jobs.filter { status != null }
   - allJobs = jobs.sortedBy { parsePostedDate() }
   ↓
6. Display:
   - Urgent section (horizontal scroll)
   - All jobs section (vertical list, show 10 first)
```

---

## ✅ Yang Ditampilkan di Home

1. **Section Urgent (Atas):**
   - Lowongan dengan badge "Akan segera berakhir" atau "Dibutuhkan segera"
   - Horizontal scroll untuk highlight
   - Maximum 5-7 cards

2. **Section Semua Lowongan (Tengah):**
   - 10 lowongan terbaru (sort by posted_date)
   - Vertical list
   - Button "Lihat Semua" untuk navigate ke full list

3. **Section Kategori (Bawah):**
   - Chips untuk kategori populer
   - Quick filter untuk user

---

## 🔗 File Implementation

Semua file sudah tersedia di folder `android-examples/`:
- ✅ `HomeFragment.kt` - Fragment dengan UI logic
- ✅ `HomeViewModel.kt` - ViewModel dengan business logic
- ✅ `fragment_home.xml` - Layout XML
- ✅ `item_job_urgent.xml` - Card layout untuk urgent jobs

---

**Last Updated:** December 20, 2025
