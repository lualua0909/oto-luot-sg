import "server-only";
import { getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { d1 } from "./d1";

/**
 * Firebase Auth is only used for sign-in. Roles live in D1 table `users`
 * (0 = root, 1 = admin, 2 = user).
 */
const APP_NAME = "otoluot-auth";

export class AuthError extends Error {
  constructor(message = "Bạn không có quyền thực hiện thao tác này.") {
    super(message);
    this.name = "AuthError";
  }
}

export type Account = { uid: string; email: string };

export async function verifyIdToken(idToken: string | null | undefined): Promise<Account> {
  if (!idToken) throw new AuthError("Vui lòng đăng nhập tài khoản quản trị.");
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) throw new Error("Thiếu NEXT_PUBLIC_FIREBASE_PROJECT_ID.");
  const app = getApps().find((a) => a.name === APP_NAME) ?? initializeApp({ projectId }, APP_NAME);
  try {
    const decoded = await getAuth(app).verifyIdToken(idToken);
    return { uid: decoded.uid, email: decoded.email ?? "" };
  } catch {
    throw new AuthError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
  }
}

export async function roleOf(uid: string): Promise<number | null> {
  const [row] = await d1<{ role: number }>("SELECT role FROM users WHERE uid = ?", [uid]);
  return row ? Number(row.role) : null;
}

/** Signed-in account with role 0 (root) or 1 (admin). */
export async function requireAdmin(idToken: string | null | undefined): Promise<Account> {
  const account = await verifyIdToken(idToken);
  const role = await roleOf(account.uid);
  if (role !== 0 && role !== 1) throw new AuthError();
  return account;
}

/** Reads "Authorization: Bearer <Firebase ID token>". */
export function bearer(request: Request) {
  const h = request.headers.get("authorization");
  return h?.startsWith("Bearer ") ? h.slice(7) : null;
}
