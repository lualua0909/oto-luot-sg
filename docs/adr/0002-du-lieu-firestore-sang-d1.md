# ADR 0002 — Dữ liệu chuyển từ Firestore sang Cloudflare D1

- Ngày: 2026-11-05
- Trạng thái: Đã chấp nhận

## Bối cảnh

Xe, tin tức, liên hệ, thương hiệu, cài đặt, nội dung và phân quyền đều nằm trên Firestore. Cả trang server lẫn trình duyệt đọc/ghi bằng Firebase client SDK, được bảo vệ bằng Firestore rules. Rules đang chạy thật lỏng hơn file `firestore.rules`: collection `leads` (số điện thoại khách) và `users` **đọc được công khai qua REST API**. Chủ dự án muốn chuyển dữ liệu về Cloudflare D1.

## Quyết định

- **Schema** `d1/schema.sql`: các bảng `cars`, `news`, `leads`, `brands`, `settings`, `content`, `users`. Mỗi bảng có cột tra cứu (slug, status, created_at…) và cột `data` chứa bản ghi JSON. Kiểu dữ liệu (`lib/types.ts`) giữ nguyên.
- **Kết nối:** chỉ server gọi D1, qua Worker `cloudflare/d1-proxy` (`otoluotsaigon-d1`, `D1_PROXY_URL`, `D1_PROXY_TOKEN`).
- **Server:** `lib/data/*` (server-only) giữ tên hàm cũ. Trang server import từ đây.
- **Trình duyệt:** gọi server action trong `lib/actions.ts` qua `lib/store/*`. Action admin nhận Firebase ID token, server xác minh token (firebase-admin) và kiểm tra `users.role` 0/1 trong D1. Form liên hệ là action công khai, có giới hạn độ dài trường. Leads chỉ admin đọc được.
- **Firebase** chỉ còn dùng để đăng nhập (Auth). Profile và role tạo ở lần đăng nhập đầu, role mặc định 2. Cấp quyền root bằng `scripts/create-admin.mjs`.
- **Realtime** (`onSnapshot`) được thay bằng đọc một lần cộng pub/sub cục bộ: provider tự làm mới sau khi admin lưu (`liveValue`, `lib/store/session.ts`).
- **Chuyển dữ liệu:** `scripts/migrate-firestore-to-d1.mjs` đọc Firestore REST, đổi URL Blob sang R2, ghi mỗi collection trong một transaction. Số lượng khớp: 33 xe, 10 tin, 3 leads, 18 hãng, 1 cài đặt, 1 nội dung, 2 users.
- Xoá `firestore.rules`, `firestore.indexes.json`, `storage.rules` và các module Firestore. Không cache dữ liệu.

## Hệ quả

- Đóng lỗ hổng lộ `leads` và `users`, vì trình duyệt không còn truy cập dữ liệu trực tiếp.
- Mất cập nhật realtime giữa nhiều tab hoặc nhiều admin. Trang công khai luôn đọc mới khi tải lại.
- Mỗi thao tác là một server action, tức một request tới Vercel rồi tới Worker.
- Trước khi chuyển hẳn nên chạy lại script migrate để lấy leads hoặc xe mới phát sinh trên Firestore. Sau đó có thể tắt Firestore và xoá script.

## Phương án đã cân nhắc

- **Gọi REST API của D1 từ trình duyệt:** lộ token tài khoản. Loại.
- **API route REST cho từng thao tác:** nhiều boilerplate hơn server action mà không có lợi ích thêm. Loại.
