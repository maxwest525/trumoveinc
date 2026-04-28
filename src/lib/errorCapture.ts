// Lightweight global error capture used by the Diagnostics page.
// Stores last 200 errors in localStorage for later inspection.

const ERROR_LOG_KEY = "trumove_error_log";

export interface CapturedError {
  ts: string;
  type: "error" | "unhandledrejection" | "console.error";
  message: string;
  source?: string;
  stack?: string;
}

export function installGlobalErrorCapture() {
  if (typeof window === "undefined") return;
  if ((window as any).__trumoveErrCapInstalled) return;
  (window as any).__trumoveErrCapInstalled = true;

  const push = (entry: CapturedError) => {
    try {
      const raw = localStorage.getItem(ERROR_LOG_KEY);
      const list: CapturedError[] = raw ? JSON.parse(raw) : [];
      list.unshift(entry);
      localStorage.setItem(ERROR_LOG_KEY, JSON.stringify(list.slice(0, 200)));
    } catch {}
  };

  window.addEventListener("error", (e) => {
    push({
      ts: new Date().toISOString(),
      type: "error",
      message: e.message || String((e as any).error),
      source: `${(e as any).filename}:${(e as any).lineno}:${(e as any).colno}`,
      stack: (e as any).error?.stack,
    });
  });

  window.addEventListener("unhandledrejection", (e) => {
    const reason: any = (e as any).reason;
    push({
      ts: new Date().toISOString(),
      type: "unhandledrejection",
      message: reason?.message || String(reason),
      stack: reason?.stack,
    });
  });

  const origErr = console.error;
  console.error = (...args: any[]) => {
    try {
      push({
        ts: new Date().toISOString(),
        type: "console.error",
        message: args
          .map((a) => {
            if (typeof a === "string") return a;
            try {
              return JSON.stringify(a);
            } catch {
              return String(a);
            }
          })
          .join(" "),
      });
    } catch {}
    origErr(...args);
  };
}

export function readCapturedErrors(): CapturedError[] {
  try {
    const raw = localStorage.getItem(ERROR_LOG_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function clearCapturedErrors() {
  localStorage.removeItem(ERROR_LOG_KEY);
}
