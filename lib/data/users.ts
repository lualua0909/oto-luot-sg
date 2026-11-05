import "server-only";
import { d1 } from "@/lib/server/d1";
import { ROLE, type AppUser, type UserRole } from "@/lib/types";

/**
 * Profile of a signed-in Firebase account (table `users`), created on first login with
 * role 2 (user). Roles 0/1 are granted by a root account (or scripts/create-admin.mjs).
 */
export async function ensureUserProfile(uid: string, email: string): Promise<AppUser> {
  await d1("INSERT INTO users (uid, email, role, created_at) VALUES (?,?,?,?) ON CONFLICT(uid) DO NOTHING", [uid, email, ROLE.USER, Date.now()]);
  const [row] = await d1<{ uid: string; email: string; role: number; created_at: number }>("SELECT uid, email, role, created_at FROM users WHERE uid = ?", [uid]);
  return { uid: row.uid, email: row.email, role: row.role as UserRole, createdAt: Number(row.created_at) };
}
