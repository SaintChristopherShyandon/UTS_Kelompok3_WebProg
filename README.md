UMN - Ucup Exploring the Archipelago
UTS IF352L - Pemrograman Web Dasar

---

## I. Tujuan Permainan

Tujuan: Jaga semua 4 Status Utama (> 0) saat menjelajahi 5 lokasi. Jika salah satu status mencapai 0, maka akan GAME OVER.

---

## II. Status Utama & Aturan

- Meal, Sleep, Hygiene: Berkurang terus-menerus setiap 30 menit *game*.
- Happiness: Berkurang sedikit. Menurun lebih cepat jika Meal atau Sleep $\le 20$.
- Money: Digunakan untuk aktivitas berbayar.

---

## III. Interaksi & Mekanisme

### A. Navigasi (Movement)

- Cara Gerak: Gunakan tombol panah di layar (UI) atau *keyboard*.
- Biaya Gerak: Setiap pindah, Sleep (-2) dan Hygiene (-1) berkurang.

### B. Aktivitas (Tergantung Lokasi)

- Home: Makan, Mandi, Tidur, dan *Do chores* (dapat uang +$500, tetapi Hygiene -15).
- Beach/Lake/Temple/Mountain: Aktivitas bervariasi (misal: *Hiking*, *Buy Drink*).
- Waktu: Setiap aktivitas membutuhkan waktu 5-180 menit *game*.
- Info Uang: Ikon (i) muncul pada tombol aktivitas untuk biaya/penghasilan.

### C. Simulasi Waktu

- Rasio: 1 detik nyata = 1 menit *game*.
- Game Over: Dipicu jika Meal, Sleep, Hygiene, atau Happiness mencapai 0
