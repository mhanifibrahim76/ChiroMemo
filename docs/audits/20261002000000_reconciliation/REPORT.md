# Laporan Penutupan Defect Audit Statis & Rekonsiliasi Migrasi 20261002000000

**Target Migrasi**: [`supabase/migrations/20261002000000_learning_goals_relationships_and_priority.sql`](file:///c:/Users/mhanifibrahim7890/Documents/Aeu/CPP401/ChiroMemo/supabase/migrations/20261002000000_learning_goals_relationships_and_priority.sql)  
**Dokumen Acuan**: [`docs/PROJECT_CONTEXT.md`](file:///c:/Users/mhanifibrahim7890/Documents/Aeu/CPP401/ChiroMemo/docs/PROJECT_CONTEXT.md), [`docs/ROADMAP.md`](file:///c:/Users/mhanifibrahim7890/Documents/Aeu/CPP401/ChiroMemo/docs/ROADMAP.md)  
**Status**: 100% Inspeksi Statis & Kode SQL Teruji Sintaksis  
**Supabase Reference**: `fyqkemhkcoomeifstijh`  

---

## 1. Ringkasan Eksekutif (Executive Summary)

### 1.1. Latar Belakang Masalah
Pada proyek ChiroMemo, tabel metadata riwayat migrasi Supabase produksi (`supabase_migrations.schema_migrations`) sebelumnya dilaporkan hanya mencatat versi awal `20260930000000` ([`20260930000000_init_schema_and_rls.sql`](file:///c:/Users/mhanifibrahim7890/Documents/Aeu/CPP401/ChiroMemo/supabase/migrations/20260930000000_init_schema_and_rls.sql)). Sementara itu, migrasi perantara:
`20261002000000_learning_goals_relationships_and_priority.sql`
tidak tercatat, meskipun beberapa perubahan skema fisiknya terindikasi telah ada di lingkungan produksi.

Sebelum dua migrasi RPC Roadmap baru:
1. `20261013000000_reorder_roadmap_steps_rpc.sql`
2. `20261013000001_delete_and_reorder_roadmap_step_rpc.sql`
dapat diterapkan dengan aman ke produksi, status skema dan integritas data harus dibuktikan secara definitif. Menjalankan `supabase migration repair` secara buta tanpa bukti skema yang valid dapat mengunci *schema drift* dan merusak integritas data relasional.

### 1.2. Vonis Akhir Audit (Final Verdict)
- **Status Awal Script Audit**: `REQUIRES CORRECTION`  
  Draf awal SQL audit memiliki beberapa cacat logika PostgreSQL terbukti (seperti ekspansi baris pada PK count, ambiguitas alias kolom `polroles`, penanganan NULL pada konkatenasi string, dan asumsi tipe data enum yang keliru pada kolom prioritas).
- **Status Pasca-Revisi Definitif**: `STATICALLY SOUND & READY FOR OPERATOR EXECUTION`  
  Seluruh script audit SQL (Query 1, Query 1B, Query 1C, dan Query 2) telah direvisi secara komprehensif, dibersihkan dari potensi crash (read-only murni tanpa DDL/tabel temporer), dan divalidasi terhadap semantik katalog PostgreSQL 17.

---

## 2. Matriks Penutupan Defect (Defect Closure Matrix DEF-01 s/d DEF-17)

Setiap item defect diklasifikasikan ke dalam 5 status definitif:
1. `RESOLVED BY STATIC REVISION`: Cacat statis terbukti dan telah diperbaiki dalam SQL revisi.
2. `NOT A DEFECT`: Bukan cacat kode; klaim didasarkan pada asumsi salah terhadap DDL acuan.
3. `UNVERIFIABLE WITHOUT EXECUTION`: Tidak dapat dibuktikan hanya dari katalog statis (misal: otorisasi PostgREST JWT).
4. `UNVERIFIABLE — HISTORICAL EVIDENCE REQUIRED`: Memerlukan bukti historis pra-migrasi (misal: kelengkapan copy data kolom yang sudah di-drop).
5. `UNVERIFIABLE — SOURCE MISSING`: Referensi pelacak eksternal tidak ditemukan di repositori.

| ID | Komponen Terkait | Deskripsi Masalah | Klasifikasi | Status Penutupan | Tindakan / Penjelasan Teknis |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **DEF-01** | Query 1: S02, S05 | `COUNT(*)` pada PK menghitung baris unnest kolom komposit, menghasilkan nilai 2 alih-alih 1 constraint. | Logic Error | **RESOLVED BY STATIC REVISION** | Subquery dipisahkan: `pk_constraint_count` menghitung `contype = 'p'` (=1), `pk_col_count` menghitung elemen `conkey` (=2), dan urutan kolom diverifikasi via `array_agg(attname ORDER BY array_position)`. |
| **DEF-02** | Query 1: S02, S05 | Perbandingan array literal `ARRAY[...]` tanpa eksplisit cast `::text[]` berisiko mismatch tipe dengan `name[]`. | Type Coercion | **RESOLVED BY STATIC REVISION** | Seluruh nama atribut di-cast ke `::text` dan array pembanding menggunakan `ARRAY[...]::text[]`. |
| **DEF-03** | Query 1: S03, S06 | Filter `cardinality(conkey) = 1` berada di subquery agregat, sehingga menyembunyikan FK komposit asing dari metrik total. | False Sense of Security | **RESOLVED BY STATIC REVISION** | `total_fks` menghitung seluruh FK pada tabel (`contype = 'f'`) tanpa filter jumlah kolom. Validasi FK yang diharapkan tetap memverifikasi `convalidated = true` dan `confdeltype = 'c'`. |
| **DEF-04** | Query 1: S08 | Pemeriksaan FK `notes.step_id` tidak lengkap memverifikasi kolom target, aritas, dan aksi `SET NULL`. | Incomplete Assertion | **RESOLVED BY STATIC REVISION** | S08 diperketat: memeriksa nama kolom sumber `step_id`, tabel target `public.roadmap_steps`, kolom target `id`, `confdeltype = 'n'`, `convalidated = true`, dan `cardinality(conkey) = 1`. |
| **DEF-05** | Query 1: S09 | Validasi indeks tidak memeriksa `relkind = 'i'` dan menyalahartikan flag lifecycle sebagai disk corruption. | Catalog Semantics | **RESOLVED BY STATIC REVISION** | Ditambahkan pengecekan `c_idx.relkind = 'i'`. Penjelasan diagnostik diklarifikasi: `indisvalid=false` menandakan DDL concurrent gagal atau transaksi belum selesai, bukan korupsi disk fisik. |
| **DEF-06** | Query 1: CTE `pol` | Penggunaan `unnest(polroles)` tanpa alias kolom eksplisit menimbulkan ambiguitas nama kolom di PostgreSQL. | Syntax Ambiguity | **RESOLVED BY STATIC REVISION** | Menggunakan alias eksplisit: `FROM unnest(p.polroles) AS u(role_oid)` dengan `LEFT JOIN pg_catalog.pg_roles`. |
| **DEF-07** | Query 1B: RLS Details | Pemetaan role OID `0` ke `'PUBLIC'` tidak konsisten dan ekspresi RLS belum kanonikal. | RLS Logic | **RESOLVED BY STATIC REVISION** | OID `0` dipetakan secara kanonikal ke `'PUBLIC'`. Ekspresi USING dan WITH CHECK diekstrak via `pg_get_expr()`. |
| **DEF-08** | Query 2: Integritas Data | Konkatenasi string `|| '::' ||` menghasilkan `NULL` jika salah satu kolom bernilai NULL, menyembunyikan pelanggaran orphan data. | Data Distortion | **RESOLVED BY STATIC REVISION** | Konkatenasi string dihilangkan total. Menggunakan subquery murni `GROUP BY` dan `LEFT JOIN`, serta memisahkan metrik `problem_groups` dan `affected_rows`. |
| **DEF-09** | Query 1: S11 | Pemeriksaan penghapusan `roadmaps.goal_id` menghasilkan `PASS` palsu jika tabel `public.roadmaps` tidak ada. | False Pass | **RESOLVED BY STATIC REVISION** | S11 mewajibkan `to_regclass('public.roadmaps') IS NOT NULL` sebagai prasyarat utama sebelum memeriksa ketiadaan kolom `goal_id`. |
| **DEF-10** | Query 1: Stabilitas S16 | Query berpotensi crash jika tabel metadata riwayat migrasi Supabase tidak ada di skema database. | Crash Hazard | **RESOLVED BY STATIC REVISION** | S16 menggunakan `to_regclass('supabase_migrations.schema_migrations')`. Jika ada mengembalikan `INCONCLUSIVE` (untuk ditindaklanjuti Q1C), jika tidak mengembalikan `FAIL`. |
| **DEF-11** | Migrasi: H01 | Kelengkapan salinan data dari `roadmaps.goal_id` ke `goal_roadmaps` tidak dapat dibuktikan dari snapshot tabel saat ini. | Fundamental Limitation | **UNVERIFIABLE — HISTORICAL EVIDENCE REQUIRED** | Kolom `roadmaps.goal_id` telah dihapus secara fisik. Pembuktian kelengkapan 100% membutuhkan backup pra-migrasi (`pg_dump`). |
| **DEF-12** | Query 1: S14, S15 | Validasi kebijakan RLS `roadmaps` dan `notes` hanya memeriksa `has_ins` dan `has_upd`, membiarkan kebijakan liar tidak terdeteksi. | Incomplete Assertion | **RESOLVED BY STATIC REVISION** | Ditambahkan validasi `total_policies = 4` untuk memastikan tepat 4 kebijakan standar (`select`, `insert`, `update`, `delete`) yang terpasang. |
| **DEF-13** | Migrasi: ON UPDATE | Tuntutan pengujian `ON UPDATE CASCADE` pada foreign key relasional. | False Requirement | **NOT A DEFECT** | DDL sumber [`20261002000000`](file:///c:/Users/mhanifibrahim7890/Documents/Aeu/CPP401/ChiroMemo/supabase/migrations/20261002000000_learning_goals_relationships_and_priority.sql) tidak mendefinisikan klausa `ON UPDATE` (default `NO ACTION`). Menuntut `CASCADE` adalah ekspektasi keliru. |
| **DEF-14** | Migrasi: FK Naming | Tuntutan pencocokan nama literal constraint foreign key sistem secara spesifik. | Tooling Assumption | **NOT A DEFECT** | DDL sumber mendefinisikan FK inline tanpa nama eksplisit (kecuali `notes_step_id_fkey`). PostgreSQL menghasilkan nama sistematis (`tablename_col_fkey`). Audit memvalidasi kolom & semantik, bukan nama sembarang. |
| **DEF-15** | PostgREST / RLS | Pengujian otorisasi JWT runtime PostgREST melalui pemeriksaan katalog statis. | Layer Mismatch | **UNVERIFIABLE WITHOUT EXECUTION** | Pemeriksaan katalog pg_policy memvalidasi keberadaan AST ekspresi RLS, namun tidak dapat membuktikan perilaku runtime JWT gateway tanpa eksekusi HTTP/RPC. |
| **DEF-16** | Deteksi Dropped Col | Identifikasi nama kolom yang di-drop via `pg_attribute.attisdropped`. | Tooling Assumption | **NOT A DEFECT** | `attisdropped` menandai kolom anonim yang dihapus tetapi nomor kolomnya belum dibersihkan oleh VACUUM. Pemeriksaan ketiadaan kolom cukup dilakukan via `information_schema.columns`. |
| **DEF-17** | Pelacak Eksternal | Label tiket eksternal tanpa riwayat commit repositori. | Missing Reference | **UNVERIFIABLE — SOURCE MISSING** | Seluruh substansi teknis telah diintegrasikan ke DEF-01 s/d DEF-16. |

---

## 3. Detail Perbaikan Teknis Kritis (Before vs After)

### 3.1. Koreksi Evaluasi Primary Key (DEF-01 & DEF-02 pada S02 dan S05)
- **Sebelum**: Subquery melakukan `unnest(conkey)` sehingga menghasilkan baris terpisah untuk setiap kolom PK komposit. Fungsi `COUNT(*)` pada CTE menghasilkan `2`, menyebabkan perbandingan `COUNT(*) = 1` gagal (FAIL palsu).
- **Sesudah**:
```sql
-- Cuplikan Revisi S02 / S05:
pk_info AS (
    SELECT
        (SELECT COUNT(*) FROM pg_catalog.pg_constraint WHERE conrelid = to_regclass('public.goal_roadmaps') AND contype = 'p') AS pk_constraint_count,
        con.conkey,
        cardinality(con.conkey) AS pk_col_count,
        (
            SELECT array_agg(a.attname::text ORDER BY array_position(con.conkey, a.attnum))
            FROM pg_catalog.pg_attribute a
            WHERE a.attrelid = con.conrelid
              AND a.attnum = ANY(con.conkey)
        ) AS pk_columns
    FROM pg_catalog.pg_constraint con
    WHERE con.conrelid = to_regclass('public.goal_roadmaps')
      AND con.contype = 'p'
)
```

### 3.2. Koreksi Isolasi dan Penghitungan Foreign Key (DEF-03 pada S03 dan S06)
- **Sebelum**: `total_fks` dihitung dari subquery yang memfilter `cardinality(conkey) = 1`. Jika ada foreign key komposit tak diinginkan, FK tersebut tidak terhitung dan luput dari deteksi.
- **Sesudah**:
```sql
-- Cuplikan Revisi S03 / S06:
fk AS (
    SELECT
        (SELECT COUNT(*) FROM pg_catalog.pg_constraint WHERE conrelid = to_regclass('public.goal_roadmaps') AND contype = 'f') AS total_fks,
        bool_or(
            a_src.attname::text = 'goal_id'
            AND n_ref.nspname::text = 'public'
            AND c_ref.relname::text = 'learning_goals'
            AND a_ref.attname::text = 'id'
            AND con.confdeltype = 'c'
            AND con.convalidated
            AND cardinality(con.conkey) = 1
            AND cardinality(con.confkey) = 1
        ) AS has_goal_fk,
        ...
)
```

### 3.3. Koreksi Tipe Data Kolom Prioritas (S10 & D02)
- **Sebelum**: Script audit mengasumsikan `learning_goals.priority` bertipe `text` dengan domain `('low', 'medium', 'high')`.
- **Fakta DDL**: Bagian 4 migrasi `20261002000000` mendefinisikan:
  ```sql
  ALTER TABLE public.learning_goals
      ADD COLUMN priority integer NOT NULL DEFAULT 0;
  ```
- **Sesudah**:
  - `S10` memvalidasi `data_type = 'integer'`, `is_nullable = 'NO'`, dan `column_default IN ('0', '0::integer', '''0''::integer')`.
  - `D02A` memvalidasi `priority IS NULL` (0 pelanggaran).
  - `D02B` memvalidasi `priority < 0` (nilai negatif).

### 3.4. Eliminasi String Concatenation pada Query 2 (DEF-08)
- **Sebelum**: Menggunakan `COUNT(DISTINCT gr.goal_id || '::' || gr.roadmap_id)`. Bila salah satu bernilai NULL, hasil konkatenasi PostgreSQL adalah NULL, sehingga baris bermasalah hilang dari perhitungan `COUNT(DISTINCT)`.
- **Sesudah**:
```sql
-- Cuplikan Revisi Query 2 (D01A):
d01a AS (
    SELECT
        COUNT(*) AS problem_groups,
        COALESCE(SUM(cnt), 0) AS affected_rows
    FROM (
        SELECT goal_id, roadmap_id, COUNT(*) AS cnt
        FROM public.goal_roadmaps
        GROUP BY goal_id, roadmap_id
        HAVING COUNT(*) > 1
    ) sub
)
```

---

## 4. Pembatasan Operasional & Keterbatasan Statis

1. **Ketiadaan Akses Eksekusi Remote**: Sesuai batasan mutlak, agen AI tidak menghubungkan diri atau mengeksekusi SQL apa pun terhadap proyek Supabase remote (`fyqkemhkcoomeifstijh`).
2. **Keterbatasan Verifikasi Historis (H01)**: Kolom `roadmaps.goal_id` telah dihapus secara fisik oleh DDL `20261002000000`. Oleh karena itu, membuktikan secara retrospektif bahwa 100% baris lama telah tersalin sempurna ke `goal_roadmaps` adalah kemustahilan matematis pada database aktif tanpa cadangan (*backup snapshot*) pra-migrasi.
3. **Aturan Eksekusi Query 2**: Query 2 membaca tabel aplikasi secara langsung. Operator **dilarang mengeksekusi Query 2** jika gerbang struktural S01, S07, atau S10 pada Query 1 bernilai `FAIL`, guna mencegah *parse error*.

---

## 5. Prosedur Rekonsiliasi untuk Operator Produksi

Operator manusia dapat menjalankan rekonsiliasi produksi dengan langkah-langkah terstruktur berikut:

```
[Mulai Rekonsiliasi]
         │
         ▼
[Jalankan Query 1 (S01 - S16)]
         │
    Ada FAIL? ──► YA ──► [Hentikan: Terapkan DDL yang hilang secara manual]
         │
       TIDAK (Semua PASS / INCONCLUSIVE)
         │
         ▼
[Jalankan Query 1B (RLS) & Query 1C (Riwayat)]
         │
    RLS Valid & Versi Terdeteksi? ──► TIDAK ──► [Investigasi Drift Kebijakan / Runner]
         │
         YA
         │
         ▼
[Jalankan Query 2 (Integritas Data D01A - D04)]
         │
   Ada VIOLATION? ──► YA ──► [Bersihkan Data Orphan / Duplikat Sebelum Lanjut]
         │
       TIDAK (Semua PASS, affected_rows = 0)
         │
         ▼
[Eksekusi Penyelarasan Riwayat]:
   npx supabase migration repair --status applied 20261002000000
         │
         ▼
[Deploy RPC Roadmap Baru]:
   npx supabase db push
```

---

## 6. Berkas SQL Audit Final

Seluruh berkas SQL audit telah disimpan di repositori lokal pada folder:
`docs/audits/20261002000000_reconciliation/`

1. [`q1_catalog_audit.sql`](file:///c:/Users/mhanifibrahim7890/Documents/Aeu/CPP401/ChiroMemo/docs/audits/20261002000000_reconciliation/q1_catalog_audit.sql) (Pemeriksaan Katalog Struktural S01 s/d S16)
2. [`q1b_rls_policies.sql`](file:///c:/Users/mhanifibrahim7890/Documents/Aeu/CPP401/ChiroMemo/docs/audits/20261002000000_reconciliation/q1b_rls_policies.sql) (Inspeksi Mendalam Definisi Kebijakan RLS)
3. [`q1c_migration_history.sql`](file:///c:/Users/mhanifibrahim7890/Documents/Aeu/CPP401/ChiroMemo/docs/audits/20261002000000_reconciliation/q1c_migration_history.sql) (Pemeriksaan Tabel Riwayat Migrasi)
4. [`q2_data_integrity.sql`](file:///c:/Users/mhanifibrahim7890/Documents/Aeu/CPP401/ChiroMemo/docs/audits/20261002000000_reconciliation/q2_data_integrity.sql) (Audit Integritas Data Relasional & Orphan D01A s/d D04)
