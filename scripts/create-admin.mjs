/**
 * Tạo tài khoản quản trị root.
 *   node scripts/create-admin.mjs <email> <mật khẩu>
 * Tạo user trong Firebase Auth (hoặc dùng lại nếu email đã tồn tại) và ghi
 * role 0 = root vào bảng `users` trên Cloudflare D1.
 * Cần file service account Firebase (SERVICE_ACCOUNT) và D1_PROXY_URL / D1_PROXY_TOKEN trong .env.
 */
import { existsSync, readFileSync } from "node:fs";
import { cert, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

for (const name of [".env.local", ".env"]) if (existsSync(name)) process.loadEnvFile(name);
const SERVICE_ACCOUNT = process.env.FIREBASE_SERVICE_ACCOUNT_FILE || "voice-b-dbb5e-firebase-adminsdk-fbsvc-1d3189699f.json";

const [email, password] = process.argv.slice(2);
if (!email || !password) {
  console.error("Cách dùng: node scripts/create-admin.mjs <email> <mật khẩu>");
  process.exit(1);
}

initializeApp({ credential: cert(JSON.parse(readFileSync(SERVICE_ACCOUNT, "utf8"))) });
const auth = getAuth();

let user;
try {
  user = await auth.createUser({ email, password });
  console.log("Đã tạo tài khoản Auth:", user.uid);
} catch (err) {
  if (err.code !== "auth/email-already-exists") throw err;
  user = await auth.getUserByEmail(email);
  await auth.updateUser(user.uid, { password });
  console.log("Email đã tồn tại — đã đặt lại mật khẩu:", user.uid);
}

const res = await fetch(`${process.env.D1_PROXY_URL}/query`, {
  method: "POST",
  headers: { authorization: `Bearer ${process.env.D1_PROXY_TOKEN}`, "content-type": "application/json" },
  body: JSON.stringify({
    statements: [{
      sql: "INSERT INTO users (uid, email, role, created_at) VALUES (?,?,0,?) ON CONFLICT(uid) DO UPDATE SET email = excluded.email, role = 0",
      params: [user.uid, email, Date.now()],
    }],
  }),
});
const json = await res.json();
if (!json.ok) throw new Error(`D1: ${json.error}`);
console.log("Đã cấp role root (0). Đăng nhập tại /admin/login");
