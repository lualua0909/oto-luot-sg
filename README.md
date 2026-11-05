# Ô TÔ LƯỚT SÀI GÒN — Website mới (Next.js + Cloudflare D1/R2)

Bản thiết kế website showroom Ô TÔ LƯỚT SÀI GÒN, giao diện hiện đại,
sáng sủa, tối ưu cho người dùng không rành công nghệ (nút gọi điện/Zalo luôn hiện sẵn,
chữ to, bố cục rõ ràng). Có sẵn trang quản trị (CMS) để tự đăng xe, viết bài, xem yêu cầu
tư vấn — không cần biết code.

## Công nghệ sử dụng
- **Next.js 14** (App Router) + TypeScript — deploy được thẳng lên **Vercel**
- **Tailwind CSS** + component kiểu **shadcn/ui**
- **Cloudflare D1**: toàn bộ dữ liệu (xe, bài viết, liên hệ, thương hiệu, cài đặt, nội dung, quyền admin). Schema: `d1/schema.sql`. Website gọi D1 qua Worker `cloudflare/d1-proxy` (`D1_PROXY_URL`, `D1_PROXY_TOKEN`).
- **Cloudflare R2**: toàn bộ ảnh. Trình duyệt tải ảnh thẳng từ domain public R2 (`NEXT_PUBLIC_R2_PUBLIC_URL`), upload thẳng lên R2 bằng link ký sẵn. **Tuyệt đối không stream ảnh qua route/function của Next.js.** Ảnh cache trình duyệt 1 năm.
- **Firebase Auth**: chỉ dùng để đăng nhập trang quản trị (quyền nằm trong bảng `users` trên D1).
- SEO: metadata động, `sitemap.xml`, `robots.txt`, JSON-LD (schema.org) cho từng xe và cho doanh nghiệp

---

## 1. Cài đặt

1. **Firebase Auth** (chỉ để đăng nhập trang quản trị): Firebase Console → project → Authentication → bật Email/Password; điền các biến `NEXT_PUBLIC_FIREBASE_*` vào `.env.local`.
2. **Cloudflare D1**: tạo database, deploy Worker `node scripts/deploy-d1-proxy.mjs`, điền `D1_PROXY_URL`, `D1_PROXY_TOKEN`. Bảng được tạo từ `d1/schema.sql`.
3. **Cloudflare R2**: bucket `otoluotsaigon`, bật Public Development URL (hoặc custom domain), CORS cho GET/HEAD/PUT; điền `R2_*` và `NEXT_PUBLIC_R2_PUBLIC_URL`.
4. Cấp quyền root cho tài khoản đầu tiên: `node scripts/create-admin.mjs <email> <mật khẩu>`.

## 2. Cấu hình biến môi trường

Đổi tên file `.env.local.example` thành **`.env.local`**, rồi điền các giá trị lấy được ở
bước 1.2:

```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_SITE_URL=https://www.otoluotsaigon.com
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=... # tùy chọn, lấy từ Google Search Console
NEXT_PUBLIC_BING_SITE_VERIFICATION=...   # tùy chọn, lấy từ Bing Webmaster Tools
```

## 3. Chạy thử ở máy tính

```bash
npm install
npm run dev
```

Mở `http://localhost:3000` để xem trang chủ, và `http://localhost:3000/admin` để đăng
nhập trang quản trị bằng tài khoản đã tạo ở bước 1.6.

## 4. Thêm dữ liệu đầu tiên

Trang chủ sẽ hiển thị "Chưa có xe nào" cho tới khi bạn đăng xe đầu tiên. Vào
`/admin/xe/moi` để thêm xe (tải ảnh lên, nhập giá, năm, hộp số...), và `/admin/tin-tuc/moi`
để viết bài kiến thức đầu tiên.

## 5. Deploy lên Vercel

1. Đưa code này lên một repository GitHub/GitLab (hoặc kéo thả thư mục vào
   [vercel.com/new](https://vercel.com/new)).
2. Trong Vercel, chọn **Import Project**, trỏ tới repo này.
3. Ở bước cấu hình, vào **Environment Variables** và nhập đúng 7 biến trong file
   `.env.local` bạn đã tạo ở bước 2.
4. Bấm **Deploy**. Vercel tự nhận diện đây là dự án Next.js, không cần chỉnh gì thêm.
5. Sau khi deploy xong, vào **Firebase Console → Authentication → Settings →
   Authorized domains** và thêm domain Vercel cấp cho bạn (và domain riêng nếu có, ví dụ
   `www.otoluotsaigon.com`) để đăng nhập `/admin` hoạt động đúng.

## Cấu trúc thư mục chính

```
app/                    Các trang (route) của website — App Router của Next.js
  page.tsx              Trang chủ
  mua-ban-o-to/          Danh sách xe + trang theo từng hãng
  xe/[slug]/             Trang chi tiết 1 xe
  dich-vu/, tin-tuc/, gioi-thieu/, lien-he/   Các trang nội dung tĩnh
  admin/                 Toàn bộ trang quản trị (CMS), có bảo vệ đăng nhập
components/
  ui/                    Component nền tảng (Button, Input, Card...) kiểu shadcn/ui
  layout/                Header, Footer
  home/, car/, admin/    Component riêng theo từng khu vực
  shared/                Component dùng chung (thanh liên hệ dính, tiêu đề section)
lib/
  data/                  Đọc/ghi D1 (chỉ chạy trên server)
  actions.ts             Server actions cho component client (admin kiểm tra token + quyền)
  store/                 Hàm phía trình duyệt gọi server actions
  server/                D1, R2, xác thực admin, nén ảnh xe
  images/                URL ảnh R2, upload ảnh từ trình duyệt
  firebase/              Chỉ Firebase Auth (đăng nhập)
  types.ts, constants.ts Kiểu dữ liệu & hằng số (danh sách hãng xe, thông tin liên hệ...)
cloudflare/d1-proxy/     Worker trung gian tới D1 (node scripts/deploy-d1-proxy.mjs)
d1/schema.sql            Schema D1
```

## Ghi chú
- Ảnh xe tải lên từ trang quản trị được gửi vào `staging/cars/`, rồi server nén bằng Sharp thành WebP **tối đa 80 KiB**, cạnh dài **tối đa 1920 px**. Server chỉ trả URL `cars/` sau khi đã kiểm tra ảnh đầu ra. Cấu hình nằm trong `lib/server/image-compress.ts`; ảnh gốc tạm được xóa sau khi xử lý thành công. Giới hạn ảnh gốc là 20 MB.
- Ảnh minh họa ở trang chủ (`/public/images/hero-car-*.jpg`, `about-*.jpg`) là **placeholder** —
  hãy thay bằng ảnh xe/showroom thật của bạn (cùng tên file, hoặc đổi đường dẫn trong
  `components/home/hero.tsx` và `about-section.tsx`).
- Toàn bộ dữ liệu xe, bài viết, yêu cầu tư vấn lưu trên Cloudflare D1; ảnh trên Cloudflare R2.
  Không cache dữ liệu: mỗi lượt xem đọc D1 trực tiếp.
- Cấp quyền root: `node scripts/create-admin.mjs <email> <mật khẩu>` (cần file service account Firebase).
- Muốn đổi màu sắc/nhận diện thương hiệu: sửa các biến CSS trong `app/globals.css`
  (phần `:root`).
