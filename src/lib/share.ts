/**
 * BuildCalc Pro Shareable calculation links.
 *
 * Encodes a tool's input state into a URL hash (#s=<base64url>) so a
 * contractor can text/email an exact calculation to a client or crew member.
 * No server involved the link carries the numbers.
 */

function toBase64Url(json: string): string {
  const b64 =
    typeof window !== "undefined" && window.btoa
      ? window.btoa(unescape(encodeURIComponent(json)))
      : Buffer.from(json, "utf8").toString("base64");
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(s: string): string | null {
  try {
    let b64 = s.replace(/-/g, "+").replace(/_/g, "/");
    while (b64.length % 4) b64 += "=";
    if (typeof window !== "undefined" && window.atob) {
      return decodeURIComponent(escape(window.atob(b64)));
    }
    return Buffer.from(b64, "base64").toString("utf8");
  } catch {
    return null;
  }
}

export function encodeToolState(values: Record<string, unknown>): string {
  return toBase64Url(JSON.stringify({ v: 1, values }));
}

export function decodeToolState<T extends Record<string, unknown>>(
  hash: string,
  defaults: T,
): T | null {
  const m = hash.match(/#s=([A-Za-z0-9\-_]+)/);
  if (!m) return null;
  const json = fromBase64Url(m[1]);
  if (!json) return null;
  try {
    const parsed: unknown = JSON.parse(json);
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      (parsed as { v?: unknown }).v !== 1 ||
      typeof (parsed as { values?: unknown }).values !== "object"
    ) {
      return null;
    }
    const stored = (parsed as { values: Record<string, unknown> }).values;
    // Sanitize: known keys only, matching primitive types.
    const out: Record<string, unknown> = { ...defaults };
    for (const key of Object.keys(defaults)) {
      const sv = stored[key];
      const dv = defaults[key];
      if (typeof sv !== typeof dv) continue;
      if (typeof sv === "number" && !Number.isFinite(sv)) continue;
      out[key] = sv;
    }
    return out as T;
  } catch {
    return null;
  }
}

/** Build a shareable URL for the current page + tool state. */
export function buildShareUrl(values: Record<string, unknown>): string {
  const url = new URL(window.location.href);
  url.hash = `s=${encodeToolState(values)}`;
  // Drop volatile query params; the hash carries the state.
  return url.toString();
}
