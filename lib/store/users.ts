import type { User } from "firebase/auth";
import { getMyProfileAction } from "@/lib/actions";
import { ROLE, type AppUser, type UserRole } from "@/lib/types";

/** Profile (role) of the signed-in account, created on first login with role 2 (user). */
export async function ensureUserProfile(user: User): Promise<AppUser> {
  return getMyProfileAction(await user.getIdToken());
}

export function isAdminRole(role: UserRole | null | undefined) {
  return role === ROLE.ROOT || role === ROLE.ADMIN;
}
