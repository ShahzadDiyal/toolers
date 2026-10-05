/**
 * BuildCalc Pro JSON export / import file utilities.
 * Pure browser file I/O. No network, no cloud the user's estimate never
 * leaves their device except as a file they explicitly save.
 */

export interface ExportEnvelope<T> {
  app: "buildcalc-pro";
  exportedAt: string;
  data: T;
}

const APP_NAME = "buildcalc-pro";

/** Serialize state into a portable JSON string with an app envelope. */
export function serializeEstimate<T>(state: T): string {
  const envelope: ExportEnvelope<T> = {
    app: APP_NAME,
    exportedAt: new Date().toISOString(),
    data: state,
  };
  return JSON.stringify(envelope, null, 2);
}

/**
 * Parse an exported JSON string. Accepts both the envelope format and a
 * bare state document (hand-edited files).
 */
export function deserializeEstimate<T>(json: string): T {
  const parsed: unknown = JSON.parse(json);
  if (
    parsed !== null &&
    typeof parsed === "object" &&
    "app" in parsed &&
    "data" in parsed
  ) {
    const env = parsed as ExportEnvelope<T>;
    if (env.app !== APP_NAME) {
      throw new Error(`Not a ${APP_NAME} export file.`);
    }
    return env.data;
  }
  return parsed as T;
}

/** Trigger a browser download of a .json file. */
export function downloadJsonFile(filename: string, json: string): void {
  const blob = new Blob([json], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename.endsWith(".json") ? filename : `${filename}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  // Revoke on next tick so slow browsers finish the download first.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Read a user-selected .json file as text. */
export function readJsonFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Could not read the selected file."));
    reader.readAsText(file);
  });
}

/** Suggest a filename like buildcalc-estimate-2026-10-05.json */
export function estimateFilename(): string {
  const stamp = new Date().toISOString().slice(0, 10);
  return `buildcalc-estimate-${stamp}.json`;
}
