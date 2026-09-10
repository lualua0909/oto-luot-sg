import { doc, getDoc, setDoc } from "firebase/firestore";
import type { User } from "firebase/auth";
import { db } from "./client";
import { ROLE, type AppUser, type UserRole } from "../types";

const USERS = "users";

/**
 * Read the profile of a signed-in account, creating it on first login with the
 * default role (2 = user). Roles 0/1 are granted manually by a root account.
 */
export async function ensureUserProfile(user: User): Promise<AppUser> {
  const ref = doc(db, USERS, user.uid);
  const snap = await getDoc(ref);

  if (snap.exists()) return { uid: user.uid, ...(snap.data() as Omit<AppUser, "uid">) };

  const profile: Omit<AppUser, "uid"> = {
    email: user.email ?? "",
    role: ROLE.USER,
    createdAt: Date.now(),
  };
  await setDoc(ref, profile);
  return { uid: user.uid, ...profile };
}

export function isAdminRole(role: UserRole | null | undefined) {
  return role === ROLE.ROOT || role === ROLE.ADMIN;
}
