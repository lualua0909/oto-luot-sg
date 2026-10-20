import { getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const APP_NAME = "blob-upload-auth";

export class UploadAuthError extends Error {
  constructor(message = "Bạn không có quyền tải ảnh lên.") {
    super(message);
    this.name = "UploadAuthError";
  }
}

/** Verify the Firebase ID token and the current Firestore admin role. */
export async function requireUploadAdmin(idToken: string | null | undefined): Promise<string> {
  if (!idToken) throw new UploadAuthError("Vui lòng đăng nhập tài khoản quản trị.");
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) throw new Error("Thiếu NEXT_PUBLIC_FIREBASE_PROJECT_ID.");

  const app = getApps().find((candidate) => candidate.name === APP_NAME) ??
    initializeApp({ projectId }, APP_NAME);
  let uid: string;
  try {
    uid = (await getAuth(app).verifyIdToken(idToken)).uid;
  } catch {
    throw new UploadAuthError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
  }

  const documentUrl = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents/users/${encodeURIComponent(uid)}`;
  const response = await fetch(documentUrl, {
    headers: { Authorization: `Bearer ${idToken}` },
    cache: "no-store",
  });
  if (response.status === 403 || response.status === 404) throw new UploadAuthError();
  if (!response.ok) throw new Error("Không thể kiểm tra quyền quản trị lúc này.");

  const document = (await response.json()) as { fields?: { role?: { integerValue?: string } } };
  const role = Number(document.fields?.role?.integerValue);
  if (role !== 0 && role !== 1) throw new UploadAuthError();
  return uid;
}
