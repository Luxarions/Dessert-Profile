# 🛡️ DESSERT Vanity Proxy (Cloudflare Worker)

Panduan setup URL Proxy gratis untuk menyamarkan URL Vercel tanpa perlu membeli domain sendiri.

---

## 🎯 Hasil yang Didapatkan:

* **URL Publik Baru**: `https://dessert-ui.<username-anda>.workers.dev` atau `https://dessert-cdn.<username-anda>.workers.dev`
* **Jejak Vercel 100% Hilang**: Header seperti `x-vercel-id`, `x-vercel-cache`, dan `server: Vercel` otomatis dihapus.
* **Header Kustom**: Header server diganti menjadi `Server: DESSERT-Engine/2.0`.
* **CORS Aktif**: Semua file dapat dipanggil dari website publik mana pun tanpa kendala CORS.

---

## 🚀 Cara Pasang dalam 2 Menit (100% Gratis & Tanpa Kartu Kredit)

1. Buka [https://dash.cloudflare.com/](https://dash.cloudflare.com/) (buat akun gratis jika belum punya).
2. Di menu sebelah kiri, klik **Workers & Pages** ➔ **Create Application**.
3. Klik tombol **Create Worker**.
4. Beri nama Worker Anda, misalnya: `dessert-ui` atau `dessert-cdn`.
5. Klik **Deploy**.
6. Setelah ter-deploy, klik tombol **Edit Code** (Quick Edit).
7. Hapus semua kode default di editor Cloudflare, lalu salin dan tempelkan isi dari file `proxy/worker.js`.
8. Klik **Save and Deploy**.

Selesai! Sekarang Anda memiliki URL publik seperti:
`https://dessert-ui.<subdomain>.workers.dev`

---

## 🔗 Contoh Penggunaan Publik:

| Keperluan | URL Proxy Publik |
| :--- | :--- |
| **Halaman Showcase/Demo** | `https://dessert-ui.<username>.workers.dev/` |
| **Panggil CSS** | `https://dessert-ui.<username>.workers.dev/dist/dessert.min.css` |
| **Panggil JS Pustaka** | `https://dessert-ui.<username>.workers.dev/dist/dessert.umd.min.js` |
