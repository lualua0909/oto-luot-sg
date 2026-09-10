/**
 * Tạo tài khoản quản trị root.
 *   node scripts/create-admin.mjs <email> <mật khẩu>
 * Tạo user trong Firebase Auth (hoặc dùng lại nếu email đã tồn tại) và ghi
 * /users/{uid} với role 0 = root.
 */
import { readFileSync } from "node:fs";
import { cert, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const SERVICE_ACCOUNT = "voice-b-dbb5e-firebase-adminsdk-fbsvc-1d3189699f.json";

const [email, password] = process.argv.slice(2);
if (!email || !password) {
  console.error("Cách dùng: node scripts/create-admin.mjs <email> <mật khẩu>");
  process.exit(1);
}

initializeApp({ credential: cert(JSON.parse(readFileSync(SERVICE_ACCOUNT, "utf8"))) });
const auth = getAuth();
const db = getFirestore();

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

await db.collection("users").doc(user.uid).set(
  { email, role: 0, createdAt: Date.now() },
  { merge: true }
);
console.log("Đã cấp role root (0). Đăng nhập tại /admin/login");
