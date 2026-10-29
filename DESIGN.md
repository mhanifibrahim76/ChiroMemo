# ChiroMemo — Design System & Editorial Direction (`DESIGN.md`)

Dokumen ini adalah acuan utama (*Single Source of Truth*) untuk arah visual, tipografi, warna, dan tata letak **ChiroMemo** (Personal Learning & Knowledge Management System untuk mahasiswa). Setiap perubahan UI wajib mematuhi panduan ini serta prinsip **Anti-Slop (`antislop-ui` & `antislop-copywriting`)**.

---

## 1. Identitas & Atmosfer Brand (*Brand Persona*)

- **Etimologi**: *Chiro* (tangan, kerajinan pena, manuskrip) + *Memo* (memori, catatan akademik).
- **Filosofi Visual**: **"The Warm Academic Studio"** — Perpaduan antara ketenangan meja perpustakaan universitas klasik, buku catatan kertas *dot-grid* (seperti Moleskine / Muji), dan ketajaman editorial majalah (*Kinfolk* / *The New Yorker* / *Readwise Reader*).
- **Kesan Utama**: Hangat di mata untuk sesi belajar malam hari, tenang (*distraction-free*), cerdas, dan organik—bukan seperti *dashboard* korporat yang kaku atau template SaaS buatan AI.

---

## 2. Sistem Warna & Radius (*Color Palette & Global Tokens*)

Mengikuti aturan **Anti-Slop Color Cap** (maksimal 3 warna dasar permukaan/teks + 1 aksen utama + 1 aksen pendukung):

| Peran Warna | Nama Token | Nilai Hex | Nilai CSS / OKLCH | Penggunaan Utama |
| :--- | :--- | :--- | :--- | :--- |
| **Warm Alabaster Paper** | `--background` | `#FAF8F4` | `oklch(0.982 0.008 85)` | Latar belakang utama halaman ruang kerja agar mata tidak cepat lelah. |
| **Illustration Cream Canvas** | `--secondary` | `#F7EEDB` | `oklch(0.948 0.024 84)` | **Warna latar asli ke-6 ilustrasi**. Digunakan pada blok/section tempat ilustrasi diletakkan agar gambar menyatu 100% (*seamless blending*). |
| **Crisp Manuscript Card** | `--card` | `#FDFCFA` | `oklch(0.996 0.004 85)` | Permukaan area bacaan catatan, form input, dan panel kerja. |
| **Deep Espresso Ink** | `--foreground` | `#1C1917` | `oklch(0.185 0.012 65)` | Warna teks utama dan garis tinta ilustrasi (bukan hitam murni `#000000`). |
| **Scholarly Forest Green** | `--primary` | `#166534` | `oklch(0.425 0.115 152)` | Warna aksen utama (tombol utama, status aktif, link penting, dan blok kontras gelap). |
| **Warm Amber Ochre** | Accent Highlight | `#D97706` | `oklch(0.665 0.145 72)` | Aksen sekunder untuk penanda progres, *milestone*, dan sorotan (*highlight*). |
| **Warm Stone Rule** | `--border` | `#E5DEC9` | `oklch(0.895 0.018 82)` | Garis pemisah tipis bergaya buku (*hairline rules*), bukan bayangan. |

### Aturan Radius Global (`globals.css`)
- Setel `--radius: 0.125rem` (`2px` / setara `rounded-sm`) di `globals.css` agar seluruh primitif UI (tombol, input, badge) otomatis bersudut tegas bergaya cetak (*editorial print*), tanpa perlu menimpa class satu per satu.
- Gunakan `rounded-none` (`0px`) untuk seluruh blok struktural, *section*, dan pembungkus kanvas ilustrasi.

---

## 3. Sistem Tipografi (*Editorial Typography*)

Untuk menghilangkan kesan "website template standar", ChiroMemo menggunakan **3 peran font yang kontras**:

1. **Editorial Serif (`--font-serif` — *Newsreader* via `next/font/google`)**:
   - **Penggunaan**: Judul utama (`h1`), judul *section* (`h2`), nomor indeks bab (`01`, `02`, `03`).
   - **Karakter**: HARUS menggunakan `font-normal` (400) atau `font-light` (300). **DILARANG menggunakan `font-bold`** pada *Newsreader* karena akan terlihat kaku. Gunakan *italic* pada kata kunci emosional/penting di dalam judul (contoh: *"One quiet book, not a pile of folders"*).
2. **Clean UI Sans (`--font-sans` — *Geist Sans*)**:
   - **Penggunaan**: Paragraf penjelasan, tombol, label form, menu navigasi, dan isi kerja aplikasi.
   - **Karakter**: Menjaga keterbacaan tinggi dengan `leading-[1.75]` pada paragraf panjang.
3. **Academic Monospace (`--font-mono` — *Geist Mono*)**:
   - **Penggunaan**: *Top Masthead*, label bab (`CHAPTER 01 // DIRECTION`), metadata tanggal, *tag* catatan, dan *figure captions*.

---

## 4. Aturan Penggunaan Ilustrasi (*Seamless Editorial Illustrations*)

Seluruh 6 ilustrasi di `public/illustrations/` memiliki latar belakang krem hangat **`#F7EEDB`** dan garis tinta **`#1C1917`**.

1. **Jangan Mengurung Gambar di Kotak Sempit**:
   - Hindari menaruh ilustrasi di dalam kartu kecil berbingkai terpisah.
   - **Teknik *Seamless Blending***: Samakan warna latar belakang kontainer/sel grid dengan `#F7EEDB` sehingga goresan ilustrasi menyatu langsung dengan kertas halaman web tanpa terlihat tepi kotaknya.
2. **Aturan Rasio Gambar Asli (*Respect Native Aspect Ratio*)**:
   - Gambar persegi 1:1 (`2048 x 2048`) WAJIB dibungkus kontainer 1:1 (`square`: `h-24 w-24 sm:h-28 sm:w-28`). Dilarang membungkus gambar 1:1 ke dalam kontainer lanskap (`w-44`) karena akan menyisakan ruang border kosong yang melar ke samping.
   - Gambar lanskap 16:9 (`2752 x 1536`, misal `dashboard-progress.jpg`) dibungkus kontainer lanskap (`landscape`: `h-20 w-36 sm:h-24 sm:w-44`).
3. **Figure Captions Wajib**:
   - Setiap ilustrasi wajib diberi keterangan di bawah atau di sampingnya menggunakan `font-mono text-[9px] uppercase tracking-[0.16em] text-[#1C1917]/55`.
4. **Pemetaan Resmi 6 Aset Ilustrasi**:
   - `hero-study-desk.jpg` (16:9) → **`FIG. 0.1 — STRUCTURED STUDY DESK & ROADMAP NODES`** (Hero Landing Page).
   - `goals-roadmap-compass.jpg` (1:1) → **`FIG. 1.1 — SYLLABUS COMPASS`** (Landing Page, halaman Goals & Roadmaps).
   - `dashboard-progress.jpg` (16:9) → **`FIG. 0.2 / 1.2 — STUDY MOMENTUM & GROWTH`** (Landing Page, halaman Dashboard & Progress).
   - `notes-resources-journal.jpg` (1:1) → **`FIG. 2.1 — ARCHIVE PLATE & MANUSCRIPT`** (Landing Page, halaman Resources, Notes & Summaries).
   - `ai-search-discovery.jpg` (1:1) → **`FIG. 3.1 / 3.2 — KNOWLEDGE DISCOVERY & STRATEGY`** (Landing Page, halaman AI Search & Recommendations).
   - `auth-library-window.jpg` (3:4) → **`FIG. 3.1 — THE QUIET READING ROOM`** (Penutup Landing Page & halaman Login/Register).

---

## 5. Arsitektur Tata Letak Aplikasi (*App Architecture*)

### 5.1 Halaman Awal (*Landing Page Architecture — 1 Layar = 1 Section*)
- **Layar 1 (Hero — *Seamless Warm Paper Canvas* `#F7EEDB`)**:
  - `lg:h-[calc(100dvh-3.5rem)] lg:overflow-hidden`.
  - Top Editorial Masthead (`VOL. I — PERSONAL KNOWLEDGE SYSTEM`).
  - Grid 5:7 terbuka: teks kiri rata bawah (*align-bottom*), ilustrasi meja belajar `hero-study-desk.jpg` di kanan menyatu 100% tanpa kotak border.
- **Layar 2 (Bab 01: Direction & Progress — *Asymmetric 2:4:6 Hairline Grid*)**:
  - `lg:h-[calc(100dvh-3.5rem)] lg:overflow-hidden` di atas `#FAF8F4`.
  - Kolom 1 (2 col): Indeks `01` raksasa font serif italic tipis. Kolom 2 (4 col): Poin bernomor `01.1` & `01.2`. Kolom 3 (6 col): Dua sel kanvas `#F7EEDB` untuk `goals-roadmap-compass.jpg` dan `dashboard-progress.jpg`.
- **Layar 3 (Bab 02: Knowledge & AI Synthesis — *Editorial Spread / Deep Forest*)**:
  - `lg:h-[calc(100dvh-3.5rem)] lg:overflow-hidden` dengan latar kontras **Deep Scholarly Forest (`#166534`)**.
  - Tata letak Buku Terbuka: dua lembar manuskrip `#F7EEDB` dengan posisi tidak sejajar (*staggered offset* `lg:mb-6` dan `lg:mt-6`) untuk `notes-resources-journal.jpg` dan `ai-search-discovery.jpg`.
- **Layar 4 (Bab 03 / Colophon: Closing Invitation & Footer)**:
  - `lg:h-[calc(100dvh-3.5rem)] lg:overflow-hidden` di atas `#FAF8F4`.
  - Grid 7:5 terbuka: ajakan mendaftar di kiri, ilustrasi vertikal `auth-library-window.jpg` di kanan, dan baris Colophon Footer di bawah.

---

### 5.2 Halaman Autentikasi (`/login` & `/register`)
- **Pola Split-Screen Penuh (`lg:h-[calc(100dvh-3.5rem)] lg:overflow-hidden`)**:
  - **Sisi Kiri (5 kolom)**: Kanvas penuh `#F7EEDB` menampilkan `auth-library-window.jpg` (`FIG. 3.1 — THE READING ROOM`) secara *seamless* + kutipan ketenangan belajar.
  - **Sisi Kanan (7 kolom)**: Area form editorial berlatar `#FAF8F4`, sekat garis *hairline* `#E5DEC9`, judul font *Newsreader*, dan navigasi kembali ke beranda di bar atas.

---

### 5.3 Ruang Kerja Setelah Login (*Authenticated Workspace*)
- **Sticky Hairline Navigation Header (`h-14 / 56px`)**:
  - Border bawah `#E5DEC9`, logo vektor ChiroMemo di kiri, daftar 8 menu navigasi horizontal (dengan *overflow-x-auto* aman untuk layar kecil), serta informasi email sesi dan tombol Sign Out.
- **Komponen Header Terpadu (`<EditorialPageHeader />`)**:
  - Setiap halaman menu dalam aplikasi wajib menggunakan komponen ini di bagian atas.
  - Latar belakang kanvas `#F7EEDB` berbingkai `border border-[#E5DEC9]` dengan padding `p-5 sm:p-7`.
  - **Sisi Kiri**: Label bab *Monospace* (`CHAPTER XX // ...`), judul besar *Newsreader* dengan kata kunci *italic* hijau, deskripsi alur kerja, dan tombol aksi cepat (*action*).
  - **Sisi Kanan**: Kanvas ilustrasi *vignette* tanpa bingkai ganda (`bg-transparent`), otomatis menggunakan proporsi yang sesuai (`square` atau `landscape`), lengkap dengan *figure caption* di bawahnya.

---

## 6. Pola yang Dilarang Keras (*Anti-Slop Ban List*)

1. **Dilarang memakai *Floating Cards***: Jangan gunakan `gap-6` dengan kartu terpisah yang memiliki `shadow-lg`. Semua pemisahan ruang wajib menggunakan garis *border* tipis (`divide-x`, `divide-y`, `border-b`) yang saling menyambung layaknya tata letak buku/jurnal cetak.
2. **Dilarang memakai sudut membulat berlebihan**: Gunakan `rounded-none` (0px) untuk *section*/blok utama, dan maksimal `rounded-sm` (2px) untuk elemen UI (tombol/input).
3. **Dilarang memakai `font-bold` pada *Newsreader***: Selalu gunakan `font-normal` (400) atau `font-light` (300) dan manipulasi ukuran font (`text-3xl` s/d `text-7xl`) serta *tracking-tight* (`-0.03em`) untuk menciptakan hierarki visual.
4. **Dilarang membungkus gambar dengan rasio tidak sesuai**: Gambar 1:1 dilarang dimasukkan ke kontainer persegi panjang yang menyebabkan ruang kosong melar di kiri/kanan border.
5. **Dilarang memakai *fake browser window*** atau titik merah-kuning-hijau macOS pada gambar/kontainer.
6. **Dilarang memakai *pill badge*** (dengan titik berkedip atau warna gradasi). Gunakan teks *Monospace uppercase* yang solid.
7. **Dilarang menggunakan bahasa *AI Slop*** (*"Revolutionize"*, *"Supercharge"*, *"Unleash"*, *"Next-generation"*).

---

## 7. Sentuhan Interaksi Fisik (*Print Artifacts & Tactile Feel*)

- **Editorial Crosshairs (`+`)**: Tambahkan elemen tanda silang mikro (*registration marks / crosshairs* `+`) di beberapa sudut pertemuan *grid/border* utama menggunakan tanda `+` geometris tipis atau SVG kecil berwarna `#1C1917` (opacity `25%–35%`) untuk memperkuat kesan tata letak cetak biru (*print layout*) majalah akademik.
- **Hover States**: Hindari animasi *scale up* (`hover:scale-105`) atau bayangan berpendar saat *hover*. Gunakan perubahan instan warna latar (misal: dari `#FAF8F4` menjadi `#F7EEDB`) atau penebalan garis bawah tinta (*solid ink underline*).
