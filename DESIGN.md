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
   - **Teknik *Seamless Blending***: Samakan warna latar belakang kontainer/sel grid dengan `#F7EEDB` (ditambah `mix-blend-multiply` pada mode terang bila di atas kertas hangat) sehingga goresan ilustrasi menyatu langsung dengan kertas halaman web tanpa terlihat tepi kotaknya.
2. **Figure Captions Wajib**:
   - Setiap ilustrasi wajib diberi keterangan di bawah atau di sampingnya menggunakan `font-mono text-[10px] tracking-[0.18em] uppercase opacity-60`.
3. **Pemetaan Resmi 6 Aset Ilustrasi**:
   - `hero-study-desk.jpg` → **`FIG. 0.1 — STRUCTURED STUDY DESK & ROADMAP NODES`** (Hero Landing Page).
   - `goals-roadmap-compass.jpg` → **`FIG. 1.1 — SEQUENTIAL SYLLABUS COMPASS`** (Layar 2 Landing Page, halaman Goals & Roadmaps).
   - `dashboard-progress.jpg` → **`FIG. 1.2 — CONSISTENCY & MILESTONE GROWTH`** (Layar 2 Landing Page, halaman Dashboard & Progress).
   - `notes-resources-journal.jpg` → **`FIG. 2.1 — DOT-GRID MANUSCRIPT & PDF ARCHIVE`** (Layar 3 Landing Page, halaman Notes, Resources & Summaries).
   - `ai-search-discovery.jpg` → **`FIG. 2.2 — SEMANTIC KNOWLEDGE CONSTELLATION`** (Layar 3 Landing Page, halaman AI Search & Recommendations).
   - `auth-library-window.jpg` → **`FIG. 3.1 — THE QUIET READING ROOM`** (Layar 4 Penutup Landing Page & halaman Login/Register).

---

## 5. Ritme Tata Letak Halaman Awal (*Landing Page Architecture*)

Dilarang mengulang tata letak simetris rata tengah. Gunakan **Exposed Hairline Grid** (`border-b border-[#E5DEC9]` dan `divide-x divide-[#E5DEC9]`) yang membentang tegas dari ujung ke ujung layar, dengan prinsip **1 Layar = 1 Section**.

- **Layar 1 (Hero — *Seamless Warm Paper Canvas* `#F7EEDB`)**:
  - `min-h-[calc(100vh-4rem)]`.
  - Wajib ada **Top Editorial Masthead** tipis di bawah navbar: berisi `VOL. I — PERSONAL LEARNING & KNOWLEDGE SYSTEM` di kiri dan `ACADEMIC EDITION` di kanan (`font-mono text-[11px] uppercase tracking-[0.16em]`).
  - Latar `#F7EEDB` penuh. 5 kolom kiri teks diatur sejajar bawah (*align-bottom* / `self-end`) terhadap ilustrasi besar `hero-study-desk.jpg` di 7 kolom kanan (lengkap dengan `FIG. 0.1`) agar tampil layaknya sampul jurnal arsitektur/akademik.
- **Layar 2 (Bab 01: Direction & Progress — *Asymmetric 2:4:6 Hairline Grid*)**:
  - `min-h-screen` dengan latar `#FAF8F4`. Gunakan pembagian kolom `2:4:6` yang dipisahkan garis vertikal tegas (`divide-x divide-[#E5DEC9]`).
  - **Kolom 1 (2 col)**: Nomor Indeks Bab `01` ukuran raksasa (`text-7xl lg:text-8xl font-serif italic font-light opacity-25`) + penanda vertikal bab.
  - **Kolom 2 (4 col)**: Narasi tajam dan daftar poin bernomor (`01.1 Learning Goals & Roadmaps`, `01.2 Study Rhythm & Progress`) yang dipisahkan garis horizontal tipis (`divide-y`).
  - **Kolom 3 (6 col)**: Dua sel kanvas `#F7EEDB` bertumpuk/bersebelahan tanpa ruang kosong terbuang yang memuat `goals-roadmap-compass.jpg` (`FIG. 1.1`) dan `dashboard-progress.jpg` (`FIG. 1.2`) secara *seamless*.
- **Layar 3 (Bab 02: Knowledge & AI Synthesis — *Editorial Spread / Deep Forest*)**:
  - `min-h-screen` dengan transisi ekstrem ke latar **`#166534`** (*Scholarly Forest Green*) dan teks `#FAF8F4`.
  - Tata letak **Buku Terbuka (*Editorial Spread*)**: Judul *Newsreader* besar di bagian atas dengan indeks `02`, diikuti dua "lembar manuskrip" (`bg-[#F7EEDB] text-[#1C1917] rounded-none`) yang posisinya sengaja **tidak sejajar tingginya (*staggered offset*, misal kanan turun `lg:mt-16`)** untuk menampilkan `notes-resources-journal.jpg` (`FIG. 2.1`) di lembar kiri dan `ai-search-discovery.jpg` (`FIG. 2.2`) di lembar kanan.
- **Layar 4 (Bab 03 / Colophon: Closing Invitation & Editorial Footer)**:
  - `min-h-screen` yang kembali ke suasana kertas terang `#FAF8F4` dengan struktur **Exposed Hairline Grid** (7 kolom kiri : 5 kolom kanan).
  - **Kolom Kiri (7 col)**: Indeks `03 // BEGIN YOUR SEMESTER`, judul penutup *Newsreader* berukuran besar dengan aksen *italic*, pengantar singkat, dan tombol aksi utama (`rounded-sm`).
  - **Kolom Kanan (5 col)**: Kanvas penuh `#F7EEDB` yang menampilkan ilustrasi vertikal `auth-library-window.jpg` (`FIG. 3.1 — THE QUIET READING ROOM`).
  - **Bagian Bawah Layar 4**: Baris *Editorial Colophon / Footer* tipis di atas garis batas `border-t border-[#E5DEC9]` yang memuat logo vektor ChiroMemo, informasi edisi akademik, dan tautan masuk/daftar.

---

## 6. Pola yang Dilarang Keras (*Anti-Slop Ban List*)

1. **Dilarang memakai *Floating Cards***: Jangan gunakan `gap-6` dengan kartu terpisah yang memiliki `shadow-lg`. Semua pemisahan ruang wajib menggunakan garis *border* tipis (`divide-x`, `divide-y`, `border-b`) yang saling menyambung layaknya tata letak buku/jurnal cetak.
2. **Dilarang memakai sudut membulat berlebihan**: Gunakan `rounded-none` (0px) untuk *section*/blok utama, dan maksimal `rounded-sm` (2px) untuk elemen UI (tombol/input).
3. **Dilarang memakai `font-bold` pada *Newsreader***: Selalu gunakan `font-normal` (400) atau `font-light` (300) dan manipulasi ukuran font (`text-5xl` s/d `text-7xl`) serta *tracking-tight* (`-0.03em`) untuk menciptakan hierarki visual.
4. **Dilarang memakai *fake browser window*** atau titik merah-kuning-hijau macOS pada gambar/kontainer.
5. **Dilarang menggunakan *pill badge*** (dengan titik berkedip atau warna gradasi). Gunakan teks *Monospace uppercase* yang solid.
6. **Dilarang menggunakan bahasa *AI Slop*** (*"Revolutionize"*, *"Supercharge"*, *"Unleash"*, *"Next-generation"*).

---

## 7. Sentuhan Interaksi Fisik (*Print Artifacts & Tactile Feel*)

- **Editorial Crosshairs (`+`)**: Tambahkan elemen tanda silang mikro (*registration marks / crosshairs* `+`) di beberapa sudut pertemuan *grid/border* utama menggunakan tanda `+` geometris tipis atau SVG kecil berwarna `#1C1917` (opacity `25%–35%`) untuk memperkuat kesan tata letak cetak biru (*print layout*) majalah akademik.
- **Hover States**: Hindari animasi *scale up* (`hover:scale-105`) atau bayangan berpendar saat *hover*. Gunakan perubahan instan warna latar (misal: dari `#FAF8F4` menjadi `#F7EEDB`) atau penebalan garis bawah tinta (*solid ink underline*).
