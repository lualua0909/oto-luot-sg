"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { firebaseApp } from "./client";
import { ensureUserProfile, isAdminRole } from "./users";
import type { AppUser } from "../types";

interface AuthContextValue {
  user: User | null;
  profile: AppUser | null;
  /** true when the signed-in account has role 0 (root) or 1 (admin) */
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth(firebaseApp);
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (!u) {
        setProfile(null);
      } else {
        try {
          setProfile(await ensureUserProfile(u));
        } catch {
          // Firestore unreachable or rules deny → treat as the lowest role.
          setProfile(null);
        }
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  async function login(email: string, password: string) {
    await signInWithEmailAndPassword(getAuth(firebaseApp), email, password);
  }

  async function logout() {
    await signOut(getAuth(firebaseApp));
  }

  return (
    <AuthContext.Provider value={{ user, profile, isAdmin: isAdminRole(profile?.role), loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
