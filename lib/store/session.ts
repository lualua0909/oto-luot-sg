import { getAuth } from "firebase/auth";
import { firebaseApp } from "@/lib/firebase/client";

/** Firebase ID token of the signed-in admin, sent with every admin server action. */
export async function idToken(): Promise<string> {
  const token = await getAuth(firebaseApp).currentUser?.getIdToken();
  if (!token) throw new Error("Vui lòng đăng nhập tài khoản quản trị.");
  return token;
}

/**
 * Tiny pub/sub so providers refresh after an admin saves (no realtime database).
 * `load` fetches the value once per subscriber and again whenever `notify()` runs.
 */
export function liveValue<T>(load: () => Promise<T>) {
  const listeners = new Set<(v: T) => void>();
  const refresh = async (only?: (v: T) => void, onError?: (e: Error) => void) => {
    try {
      const v = await load();
      if (only) only(v);
      else listeners.forEach((l) => l(v));
    } catch (e) {
      onError?.(e as Error);
    }
  };
  return {
    subscribe(callback: (v: T) => void, onError?: (e: Error) => void) {
      listeners.add(callback);
      void refresh(callback, onError);
      return () => {
        listeners.delete(callback);
      };
    },
    notify: () => refresh(),
  };
}
