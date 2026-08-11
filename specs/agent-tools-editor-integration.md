# Agent Tools ↔ Code Editor

Dua hal yang sering dianggap satu masalah, padahal terpisah:

1. **Bagaimana tahu agent tools masih bekerja** setelah cleanup besar — kebutuhan mendesak
2. **Bagaimana mengintegrasikannya dengan editor CodeMirror** — kebutuhan jangka menengah

Bagian 1 harus beres dulu. Tidak ada gunanya mengintegrasikan sesuatu yang belum
terbukti jalan.

---

# Bagian 1 — Memverifikasi agent tools

Ada 25 tool di `packages/opm/src/tool/`: `read`, `write`, `edit`, `apply_patch`,
`glob`, `grep`, `shell`, `task`, `todo`, `webfetch`, `websearch`, `lsp`, `skill`,
`question`, `plan`, `code-mode`, dan pendukungnya.

Repo ini **sudah punya** infrastruktur test berlapis. Tidak perlu bikin baru —
yang belum ada hanya kebiasaan menjalankannya.

## Lapis 1 — Unit test per tool (paling cepat, jalankan sekarang)

21 file test sudah ada di `packages/opm/test/tool/`:

```bash
cd packages/opm
bun test test/tool/
```

Ini menguji tiap tool secara terisolasi: `edit.test.ts` memverifikasi hasil patch,
`grep.test.ts` memverifikasi pencarian, `shell.test.ts` memverifikasi eksekusi
perintah, dan seterusnya.

**Ini yang harus Anda jalankan pertama.** Kalau ada yang gagal, kemungkinan besar
akibat rename `@opencode-ai/*` → `@opm/*`, bukan logika tool-nya.

## Lapis 2 — Alur agent end-to-end dengan LLM palsu

`packages/opm/test/lib/llm-server.ts` adalah HTTP server yang meniru LLM dan bisa
di-skrip. Ia bisa memancarkan `tool-start` dan `tool-args`, jadi Anda bisa menguji
**siklus penuh** — model minta tool → tool jalan → hasil balik ke model — tanpa
memanggil model sungguhan dan tanpa biaya.

Contoh pemakaiannya ada di `packages/opm/test/session/prompt.test.ts` (pola
`llm.text(...)`) dan `test/server/httpapi-session.test.ts`.

```bash
cd packages/opm
bun test test/session/prompt.test.ts
```

Kalau lapis 1 lolos tapi lapis 2 gagal, masalahnya di orkestrasi sesi
(permission, registry, streaming), bukan di tool-nya.

## Lapis 3 — Gate HTTP API

```bash
cd packages/opm
bun run test:httpapi
```

Memastikan setiap route yang dideklarasikan punya skenario yang menjalankannya.
Ini yang menangkap endpoint yatim — berguna justru setelah cleanup seperti kemarin.

> Catatan: skenario `tui.*` dan `global.upgrade` sudah dihapus dari gate ini
> karena endpoint-nya memang sudah tidak ada.

## Lapis 4 — Uji manual lewat UI sungguhan

Dua terminal:

```bash
# terminal 1
bun run dev:web

# terminal 2
bun run dev:full
```

Lalu di UI: buat sesi, minta agent melakukan sesuatu yang memakai tool, misalnya
*"baca file README.md lalu tambahkan satu baris di akhirnya"*. Yang harus terlihat:

| Yang dicek | Tanda berhasil |
|---|---|
| `read` | Isi file muncul di transkrip |
| `edit` | Diff tampil di pesan, file di disk berubah |
| Permission | Dialog izin muncul sebelum tulis |
| Streaming | Tool call muncul bertahap, bukan sekaligus di akhir |
| File tree | Berkas yang berubah ter-refresh sendiri |

Lapis 4 ini yang paling mendekati pengalaman pengguna, tapi paling lambat dan
paling sulit diulang. Pakai untuk konfirmasi akhir, bukan untuk iterasi.

## Yang harus dikerjakan

- [ ] Jalankan lapis 1. Perbaiki kegagalan akibat rename.
- [ ] Jalankan lapis 2 dan 3.
- [ ] Sekali saja lapis 4, untuk memastikan jalur UI hidup.
- [ ] Setelah hijau semua, catat perintahnya di `AGENTS.md` supaya tidak lupa.

---

# Bagian 2 — Integrasi dengan editor CodeMirror

## Yang sudah ada — jangan dibangun ulang

Ini temuan penting. Sebagian besar jembatan yang dibutuhkan **sudah terpasang**:

| Kemampuan | Sudah ada di |
|---|---|
| Tool `edit` menghasilkan unified diff | `packages/opm/src/tool/edit.ts` → `metadata.diff` |
| Event perubahan file | `file.watcher.updated` |
| App bereaksi ke event itu & memuat ulang file terbuka | `packages/app/src/context/file/watcher.ts` |
| Render tool call di transkrip | `packages/session-ui/src/components/basic-tool.tsx`, `tool-status-title.tsx`, `tool-error-card.tsx` |
| Cache isi file & view | `packages/app/src/context/file/{content-cache,view-cache}.ts` |
| Seleksi editor → konteks prompt | `packages/session-ui/src/pierre/selection-bridge.ts` |
| Render diff | `@pierre/diffs` |

Jadi integrasi ini **bukan** membangun jembatan baru, melainkan menyambungkan
CodeMirror ke jembatan yang sudah berdiri.

## Yang belum ada

1. **Editor-nya sendiri.** Belum ada CodeMirror di repo; tab file sekarang
   read-only, highlighting pakai Shiki.
2. **Endpoint tulis.** `packages/protocol/src/groups/fs.ts` hanya punya
   `fs.read`, `fs.list`, `fs.find` — semuanya GET. Editor yang bisa menyimpan
   butuh `fs.write`.
3. **Penanganan konflik.** Kalau agent mengedit file yang buffer-nya sedang kotor,
   belum ada yang memutuskan siapa menang.

## Urutan integrasi

Dikerjakan berurutan; tiap langkah bisa diverifikasi sendiri.

### Langkah 1 — Endpoint tulis (prasyarat)

Tambahkan `fs.write` di `packages/protocol/src/groups/fs.ts`, implementasi di
`packages/server/src/handlers/fs.ts` memakai `FSUtil` dari `@opm/core/fs-util`.
Ikuti pola `RelativePath` + error schema yang sudah dipakai `fs.read`, termasuk
guard agar path di luar project root ditolak.

Lalu regenerate SDK: `bun run script/generate.ts`.

**Verifikasi:** `curl -X POST` ke endpoint itu, cek isi file di disk berubah.
Belum perlu UI.

### Langkah 2 — Komponen editor

`packages/app/src/components/editor/code-editor.tsx`.

CodeMirror memiliki DOM-nya sendiri, jadi komponen ini **uncontrolled**:
`onMount` membuat `EditorView`, `onCleanup` memanggil `view.destroy()`, dan
sinkronisasi prop → editor lewat `view.dispatch({ changes })` di dalam
`createEffect` — bukan lewat re-render Solid.

Tema: buat CodeMirror theme extension yang membaca CSS custom property yang sudah
dipakai `packages/ui`, supaya editor ikut dark/light mode tanpa palet kedua.

**Verifikasi:** buka file, edit, simpan, cek disk. Belum melibatkan agent.

### Langkah 3 — Agent mengedit → editor ikut berubah

Di sinilah integrasi sesungguhnya, dan sebagian besar sudah tersedia.

Alur yang sudah berjalan hari ini:

```
tool edit  →  tulis ke disk  →  event file.watcher.updated
           →  packages/app/src/context/file/watcher.ts
           →  content-cache di-invalidate  →  file terbuka dimuat ulang
```

Yang perlu ditambahkan: **membuat tab CodeMirror menghormati alur itu**, dengan
aturan konflik yang jelas.

| Kondisi buffer | Perilaku |
|---|---|
| Bersih (tidak diedit user) | Muat ulang diam-diam, pertahankan posisi kursor & scroll |
| Kotor (user sedang mengetik) | **Jangan timpa.** Tampilkan banner "agent mengubah file ini" + opsi lihat diff / ambil versi agent / pertahankan milik saya |

Aturan kedua itu wajib. Menimpa ketikan pengguna secara diam-diam adalah cara
tercepat membuat orang tidak percaya pada agent.

### Langkah 4 — Tampilkan diff agent di dalam editor

`metadata.diff` dari tool `edit` sudah berupa unified patch. Manfaatkan untuk
menandai baris yang baru saja diubah agent di gutter CodeMirror — hijau untuk
tambahan, merah untuk hapusan — dan biarkan memudar setelah beberapa detik.

Ini memberi jawaban visual atas pertanyaan *"agent barusan mengubah apa?"* tanpa
pengguna harus membaca transkrip.

### Langkah 5 — Permission inline

Saat ini permintaan izin muncul sebagai dialog. Untuk tool yang menyentuh file
tertentu, tampilkan di dekat file itu — di tab atau gutter yang bersangkutan —
sehingga pengguna melihat *apa* yang akan diubah saat memutuskan.

Dialog tetap dipertahankan untuk tool tanpa lokasi (`shell`, `webfetch`).

### Langkah 6 — Navigasi dari transkrip

Tool call di transkrip menyebut path dan rentang baris. Jadikan bisa diklik:
membuka tab dan menggulir ke baris tersebut. Berlaku untuk `read`, `edit`,
`grep`, dan `glob`.

Reuse mekanisme yang sudah ada di `packages/app/src/pages/session/file-tabs.tsx`.

## Yang sengaja ditunda

- **`grep`/`glob` → panel pencarian editor.** Menarik, tapi tidak menghalangi
  apa pun. Kerjakan setelah langkah 1–4 stabil.
- **Menampilkan output `shell` di panel terminal.** Panel terminal sudah ada
  (PTY websocket), tapi menyambungkannya ke tool `shell` adalah pekerjaan
  tersendiri.
- **Mengganti `@pierre/diffs` dengan CodeMirror merge view.** Diff yang ada sudah
  bekerja. CodeMirror menangani pengeditan, bukan menggantikan tampilan diff.

---

## Verifikasi keseluruhan

Setelah langkah 1–4:

1. `bun test test/tool/` di `packages/opm` — masih hijau
2. Buka file di editor, minta agent mengubah file yang sama → tab ikut ter-update,
   diff tersorot di gutter
3. Ketik sesuatu di file (buffer kotor), lalu minta agent mengubah file itu →
   **muncul peringatan konflik, ketikan tidak hilang**
4. Ubah file dari editor eksternal saat tab kotor → perilaku sama
5. Toggle dark/light → editor ikut

Poin 3 adalah yang paling penting dan paling mudah terlewat.

---

## Catatan

Rencana ini mengasumsikan Bagian 1 sudah hijau. Kalau `bun test test/tool/` masih
gagal setelah rename kemarin, perbaiki itu dulu — mengintegrasikan tool yang rusak
hanya akan membuat sumber masalah jadi kabur antara editor dan agent.
