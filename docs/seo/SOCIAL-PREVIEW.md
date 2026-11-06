# Preview mạng xã hội — 2026-11-06

Website thật có og:image tải được, nhưng trang chủ thiếu og:type/og:site_name vì openGraph ở page ghi đè object trong layout.
Ảnh cũ qua /opengraph-image là PNG 1.031.259 byte. Chỉ mô phỏng user-agent chưa xác định được trạng thái cache/khả năng truy cập từ IP Meta thật.

Đã dùng helper tạo bộ OG/Twitter đầy đủ cho từng loại trang công khai: trang chủ, danh sách, hãng, xe, bài viết, dịch vụ, giới thiệu, liên hệ và chính sách.
Tiêu đề/mô tả/URL vẫn riêng từng trang, bài viết dùng article; ảnh preview chung là ảnh showroom thật.
Ảnh xe đang hiển thị không đổi. Một số object cũ có tên .jpg nhưng chứa WebP; không suy đoán MIME từ đuôi file để khai báo preview.

Ảnh showroom mới là JPEG 1200×630, 117.501 byte trên R2 tại branding/social-preview.jpg, đã đối chiếu SHA-256 và cache immutable 1 năm.
Xóa route đọc ảnh trả byte và chuyển URL legacy /opengraph-image sang edge redirect tới R2, kể cả URL có query cũ.
Cả GET và HEAD công khai trả 200 cho user-agent Facebook. Không thêm data cache hoặc truy vấn metadata ảnh trong request render.
Kiểm tra 16 trang thuộc các loại route công khai, tổng 21 tổ hợp URL/user-agent, gồm kiểm tra redirect ảnh cũ.

## Kiểm tra và triển khai

Đã chạy lint, TypeScript và production build. Kiểm tra HTTP cục bộ bằng facebookexternalhit, Facebot,
meta-externalagent, meta-externalfetcher, WhatsApp và Twitterbot; thẻ OG/Twitter nằm trong head,
URL HTTPS tuyệt đối, canonical khớp, ảnh trả 200 và MIME/kích thước khớp dữ liệu thực tế.
Không gửi bài đăng hoặc tin nhắn thử lên mạng xã hội.

Code chưa deploy. Sau deploy:
1. Kiểm tra lại trang chủ bằng user-agent facebookexternalhit và tải og:image từ Internet.
2. Mở https://developers.facebook.com/tools/debug/ và dùng Scrape Again cho URL cần chia sẻ.
3. Thử gửi một link mới sau khi Meta cập nhật cache. Không coi preview tin nhắn cũ là kết quả kiểm tra bản mới.

Các request mô phỏng user-agent không thay thế một lần scrape từ hạ tầng Meta thật.
Tài liệu giao thức: https://ogp.me/
