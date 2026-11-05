# ADR 0001 — Ảnh chuyển từ Vercel Blob sang Cloudflare R2, cấm stream ảnh

- Ngày: 2026-11-05
- Trạng thái: Đã chấp nhận

## Bối cảnh

Ảnh xe và logo hãng (433 file, khoảng 33 MB) nằm trên Vercel Blob. Trang web hiển thị ảnh qua `/api/img/[store]/[...path]`, một route stream ảnh từ Blob, nên mỗi lượt xem ảnh tốn Vercel Function Duration. Upload dùng client token của Blob. Route liệt kê file `/api/blobs` không có xác thực.

## Quyết định

- Chép toàn bộ ảnh sang bucket R2 `otoluotsaigon` (`scripts/migrate-blob-to-r2.mjs`), kiểm tra sha256 từng file. Key là đường dẫn trong URL public của Blob, **kèm hậu tố ngẫu nhiên**, vì API list của Blob trả `pathname` không có hậu tố. Mọi URL ảnh trong dữ liệu đã đổi sang `NEXT_PUBLIC_R2_PUBLIC_URL`; 428/428 URL kiểm tra đều trả 200.
- Trình duyệt tải ảnh thẳng từ domain public R2. Xoá `/api/img`.
- **Upload:** `/api/upload` (chỉ admin) trả link PUT ký sẵn, trình duyệt upload thẳng lên R2 nên không vướng giới hạn body 4,5 MB của Vercel. Ảnh xe được `/api/upload/optimize` nén bằng Sharp, từ `staging/cars/` thành `cars/*.webp` (server đọc R2 để xử lý, không phải để trả ảnh). Xoá ảnh qua `/api/upload/delete`. Liệt kê qua `/api/images` (chỉ admin).
- Mọi object cache 1 năm: `public, max-age=31536000, immutable`. Bucket bật CORS GET/HEAD/PUT.
- Xoá toàn bộ code Vercel Blob: `@vercel/blob`, `lib/blob/*`, `/api/blobs`, `/api/img`, các script seed/recompress cho Blob. Chỉ còn script chuyển dữ liệu một lần.
- **Quy tắc cứng:** không thêm route, API, proxy hay rewrite nào đọc byte ảnh rồi trả về trình duyệt.

## Hệ quả

- Function Duration cho ảnh về 0. Không còn phí Blob.
- Bucket thành public.
- Sau khi deploy và kiểm tra xong, có thể xoá store Blob, biến `BLOB_READ_WRITE_TOKEN` và `scripts/migrate-blob-to-r2.mjs`.
