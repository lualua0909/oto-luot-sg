import { getAuth } from "firebase/auth";
import { firebaseApp } from "@/lib/firebase/client";

/** Best-effort report of an admin client error to the server-side log file. */
export async function reportAdminError(context: string, cause: unknown): Promise<void> {
  const error = cause instanceof Error ? cause : new Error(String(cause));
  try {
    const idToken = await getAuth(firebaseApp).currentUser?.getIdToken();
    if (!idToken) {
      console.error(`[${context}]`, error);
      return;
    }

    const response = await fetch("/api/admin/error-log", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        context,
        name: error.name,
        message: error.message,
        code: "code" in error && typeof error.code === "string" ? error.code : undefined,
        stack: error.stack,
      }),
    });

    if (!response.ok) {
      console.error(`Could not send ${context} error to server log`, await response.text());
    }
  } catch (loggingError) {
    console.error(`Could not send ${context} error to server log`, loggingError, error);
  }
}
