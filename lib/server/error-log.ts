import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";

function serializeError(error: unknown) {
  if (error instanceof Error) {
    const code = "code" in error && typeof error.code === "string" ? error.code : undefined;
    return {
      name: error.name,
      message: error.message,
      ...(code ? { code } : {}),
      ...(error.stack ? { stack: error.stack } : {}),
    };
  }

  return {
    name: "UnknownError",
    message: typeof error === "string" ? error : JSON.stringify(error),
  };
}

/** Append one structured error entry to the local/server error log. */
export async function writeErrorLog(context: string, error: unknown): Promise<boolean> {
  const entry = {
    timestamp: new Date().toISOString(),
    context: context.replace(/[\r\n]/g, " ").slice(0, 120),
    error: serializeError(error),
  };
  const logPath = process.env.ERROR_LOG_FILE || (
    process.env.VERCEL === "1"
      ? "/tmp/oto-luot-sg-errors.log"
      : path.join(process.cwd(), "logs", "errors.log")
  );

  try {
    await mkdir(path.dirname(logPath), { recursive: true });
    await appendFile(logPath, `${JSON.stringify(entry)}\n`, "utf8");
    console.error(`[${entry.context}]`, entry.error);
    return true;
  } catch (writeError) {
    console.error("Could not write error log file", writeError, entry);
    return false;
  }
}
