# Ô TÔ LƯỚT SÀI GÒN — Website mới (Next.js + Firebase)

Bản thiết kế website showroom Ô TÔ LƯỚT SÀI GÒN, giao diện hiện đại,
sáng sủa, tối ưu cho người dùng không rành công nghệ (nút gọi điện/Zalo luôn hiện sẵn,
chữ to, bố cục rõ ràng). Có sẵn trang quản trị (CMS) để tự đăng xe, viết bài, xem yêu cầu
tư vấn — không cần biết code.

## Công nghệ sử dụng
- **Next.js 14** (App Router) + TypeScript — deploy được thẳng lên **Vercel**
- **Tailwind CSS** + component kiểu **shadcn/ui**
- **Firebase**: Firestore (dữ liệu xe/bài viết/liên hệ), Firebase Auth (đăng nhập trang quản trị), Firebase Storage (lưu ảnh) — **không dùng database nào khác**
- SEO: metadata động, `sitemap.xml`, `robots.txt`, JSON-LD (schema.org) cho từng xe và cho doanh nghiệp

---

## 1. Cài đặt Firebase (bắt buộc trước khi chạy)

1. Vào [Firebase Console](https://console.firebase.google.com) → **Add project** → tạo project mới (ví dụ `oto-luot-sai-gon`).
2. Vào **Project settings → General → Your apps → Add app → Web (`</>`)**. Đặt tên bất kỳ,
   Firebase sẽ cho bạn một đoạn config — copy các giá trị đó vào file `.env.local`
   (xem bước 2 bên dưới).
3. Bật các dịch vụ cần dùng:
   - **Build → Firestore Database → Create database** (chọn chế độ Production).
   - **Build → Authentication → Get started → bật Sign-in method "Email/Password"**.
   - **Build → Storage → Get started**.
4. Vào **Firestore Database → Rules**, xóa hết nội dung mặc định và dán nội dung file
   `firestore.rules` trong project này vào, bấm **Publish**.
   Quy tắc này bao gồm collection `settings`, nơi CMS lưu thông tin showroom và các liên kết mạng xã hội.
5. Vào **Storage → Rules**, dán nội dung file `storage.rules` vào, bấm **Publish**.
6. Tạo tài khoản quản trị đầu tiên: **Authentication → Users → Add user**, nhập email +
   mật khẩu bạn sẽ dùng để đăng nhập trang `/admin`.

> Bất kỳ ai đăng nhập được bằng Firebase Auth đều có toàn quyền quản trị (theo rules ở trên) —
> chỉ tạo tài khoản cho người bạn tin tưởng.

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
NEXT_PUBLIC_SITE_URL=https://chootobinhtan.com
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
   `chootobinhtan.com`) để đăng nhập `/admin` hoạt động đúng.

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
  firebase/              Toàn bộ code kết nối Firestore/Auth/Storage
  types.ts, constants.ts Kiểu dữ liệu & hằng số (danh sách hãng xe, thông tin liên hệ...)
firestore.rules          Luật bảo mật Firestore — dán vào Firebase Console
storage.rules             Luật bảo mật Storage — dán vào Firebase Console
```

## Ghi chú
- Ảnh minh họa ở trang chủ (`/public/images/hero-car-*.jpg`, `about-*.jpg`) là **placeholder** —
  hãy thay bằng ảnh xe/showroom thật của bạn (cùng tên file, hoặc đổi đường dẫn trong
  `components/home/hero.tsx` và `about-section.tsx`).
- Toàn bộ dữ liệu xe, bài viết, yêu cầu tư vấn đều lưu trên Firestore — không cần chạy
  hay quản lý bất kỳ database server nào.
- Muốn đổi màu sắc/nhận diện thương hiệu: sửa các biến CSS trong `app/globals.css`
  (phần `:root`).
