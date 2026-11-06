# Sitemap và kiểm tra index — 2026-11-06

Tên miền chính: `https://www.otoluotsaigon.com`.
Sitemap: `/sitemap.xml`; robots: `/robots.txt`.
Có thể cấu hình origin qua `NEXT_PUBLIC_SITE_URL`.

## Cấu trúc

- Trang chủ, mua bán xe, dịch vụ, tin tức, giới thiệu, liên hệ, 3 dịch vụ chi tiết và 4 chính sách.
- Trang hãng chỉ khi có xe đang bán/đang cọc.
- Mọi xe công khai (status khác an), gồm cả xe đã bán còn trang công khai.
- Chỉ bài viết đã xuất bản.
- Không gồm quản trị/API, xe ẩn, bài nháp hoặc hãng không có xe.

## Thay đổi

Đọc các cột URL công khai trong một D1 batch, không tải nội dung record hoặc dùng giới hạn listing 500 xe/200 bài.
Giữ quy tắc không cache của repo. D1 lỗi trả lỗi server thay vì sitemap thành công nhưng thiếu URL.
Dùng timestamp cập nhật thật cho xe/bài; không bịa lastmod cho trang tĩnh. Loại URL trùng, priority và changefreq.
Robots chặn cả /admin và /api/; metadata quản trị giữ noindex.

## Xác minh

- ESLint các file thay đổi qua (dùng config Next core-web-vitals vì repo chưa có config ESLint).
- TypeScript và production build qua.
- 65 URL trong production build cục bộ: XML hợp lệ; toàn bộ trả 200, canonical khớp, không noindex và robots cho crawl.
- Trang đăng nhập quản trị giữ noindex.
- Mô phỏng D1 không truy cập được: sitemap trả 500, không xuất sitemap thiếu.

## Triển khai

Chưa deploy thay đổi. Sau deploy, gửi `https://www.otoluotsaigon.com/sitemap.xml`
trong Google Search Console của tên miền đã xác minh.
