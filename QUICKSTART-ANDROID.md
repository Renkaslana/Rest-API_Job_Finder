# 🚀 Quick Start - Deploy & Use di Android

## Step 1: Deploy API (5 menit)

```bash
# Di folder Job-Finder-API
vercel login
vercel --prod
```

**Copy URL yang muncul**, contoh:
```
https://job-finder-api-abc123.vercel.app
```

---

## Step 2: Setup Android Studio (10 menit)

### 1. Tambahkan di `build.gradle` (Module: app):
```gradle
dependencies {
    implementation 'com.squareup.retrofit2:retrofit:2.9.0'
    implementation 'com.squareup.retrofit2:converter-gson:2.9.0'
    implementation 'androidx.lifecycle:lifecycle-viewmodel-ktx:2.6.2'
}
```

### 2. Tambahkan di `AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.INTERNET" />
```

### 3. Copy Files dari folder `android-examples/`:
- Copy semua `.kt` files → `app/src/main/java/com/lokerid/`
- Copy semua `.xml` files → `app/src/main/res/layout/`

### 4. Update `RetrofitClient.kt`:
```kotlin
private const val BASE_URL = "https://job-finder-api-abc123.vercel.app/"
//                             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//                             GANTI dengan URL Vercel Anda!
```

---

## Step 3: Test (2 menit)

Build & Run aplikasi:
1. ✅ List jobs akan muncul otomatis
2. ✅ Pull-to-refresh untuk update manual
3. ✅ Klik job untuk lihat detail lengkap
4. ✅ Auto-refresh setiap 15 menit

---

## 🎯 Fitur Auto-Update

### ✅ Sudah Built-in:

1. **Cache API** - Server cache 15 menit
2. **Auto-refresh** - App refresh setiap 15 menit otomatis
3. **Pull-to-refresh** - User bisa refresh manual
4. **Real-time scraping** - Data selalu fresh dari JobStreet

### Code yang mengatur auto-update:

```kotlin
// Di MainActivity.onCreate()
viewModel.startAutoRefresh(900_000) // 15 minutes = 900,000 ms
```

**Ubah interval jika diperlukan:**
```kotlin
// 5 menit
viewModel.startAutoRefresh(300_000)

// 30 menit
viewModel.startAutoRefresh(1_800_000)

// Matikan auto-refresh (manual only)
// Jangan panggil startAutoRefresh()
```

---

## 📊 Data Flow

```
JobStreet Website
      ↓
[Vercel API] (scraping on-request, cache 15min)
      ↓
[Android App] (auto-refresh 15min + pull-to-refresh)
      ↓
User Interface
```

**Keuntungan:**
- ✅ Selalu up-to-date (max delay 15 menit)
- ✅ Hemat bandwidth (cache di server)
- ✅ Tidak perlu database (stateless)
- ✅ Scalable (serverless)

---

## 🔍 Testing Checklist

- [ ] Deploy API ke Vercel ✓
- [ ] Copy URL production ✓
- [ ] Update BASE_URL di Android ✓
- [ ] Build & Run app ✓
- [ ] Test list jobs muncul ✓
- [ ] Test click job → detail muncul ✓
- [ ] Test pull-to-refresh ✓
- [ ] Test auto-refresh (tunggu 15 menit atau ubah interval) ✓
- [ ] Test button "Apply" → buka JobStreet ✓

---

## 📱 Screenshots Reference

### Main Screen (List Jobs):
```
┌─────────────────────────┐
│  LokerID               ⟳ │  ← Pull to refresh
├─────────────────────────┤
│ ┌─────────────────────┐ │
│ │ Senior Engineer     │ │
│ │ PT Tech Indonesia   │ │
│ │ 📍 Jakarta          │ │
│ │ 💰 Rp 10-15 juta    │ │
│ │ Preview desc...     │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ Marketing Manager   │ │
│ │ ...                 │ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

### Detail Screen:
```
┌─────────────────────────┐
│ ← Senior Engineer       │
├─────────────────────────┤
│ 🏢 PT Tech Indonesia    │
│ 📍 Jakarta              │
├─────────────────────────┤
│ Salary: Rp 10-15 juta   │
│ Type: Full time         │
├─────────────────────────┤
│ Job Description         │
│ DESKRIPSI LENGKAP DI    │
│ SINI (2000+ chars)...   │
├─────────────────────────┤
│ Requirements            │
│ • Bachelor degree       │
│ • 5+ years experience   │
├─────────────────────────┤
│ [Apply on JobStreet]    │
└─────────────────────────┘
```

---

## 🎓 Resources

📖 **Dokumentasi Lengkap:**
- [ANDROID-INTEGRATION.md](ANDROID-INTEGRATION.md) - Complete Android guide
- [API-USAGE.md](API-USAGE.md) - API documentation
- [android-examples/](android-examples/) - Semua code yang siap copy-paste

🔧 **Troubleshooting:**
- Jika error "Unable to resolve host": Check internet permission
- Jika data tidak muncul: Check BASE_URL di RetrofitClient
- Jika app crash: Check Logcat untuk error message

---

## ✅ Summary

**Ya, REST API ini SIAP untuk Android LokerID!**

✅ **Up-to-date otomatis** - Auto-refresh setiap 15 menit  
✅ **Real-time data** - Langsung scrape dari JobStreet  
✅ **Deskripsi lengkap** - Endpoint detail dengan full description  
✅ **Production ready** - Serverless di Vercel  
✅ **Code examples** - Kotlin MVVM pattern lengkap  

**Total waktu setup: ~15 menit dari nol sampai running!** 🚀
