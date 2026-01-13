import { resolveTunaUrl } from "./baseUrl";

/**
 * Convert snake_case string to camelCase.
 * Example: total_value_usd -> totalValueUsd
 */
const snakeToCamel = (s: string) => s.replace(/_([a-z0-9])/g, (_, c: string) => c.toUpperCase());

/**
 * Convert camelCase string to snake_case.
 * Example: totalValueUsd -> total_value_usd
 */
const camelToSnake = (s: string) => s.replace(/[A-Z]/g, c => `_${c.toLowerCase()}`);

/**
 * Check that a value is a "plain" object (i.e. a JSON object).
 *
 * This excludes:
 * - Array
 * - Date
 * - PublicKey
 * - class instances
 *
 * We only want to recurse into real JSON objects.
 */
const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && Object.getPrototypeOf(v) === Object.prototype;

/**
 * =========================
 * Deep key/value transformer
 * =========================
 *
 * Recursively walks through a JSON-like structure and:
 * - optionally transforms values (onValue)
 * - transforms object keys (keyMap)
 */
function mapKeysDeep(value: unknown, keyMap: (k: string) => string, onValue?: (v: unknown) => unknown): unknown {
  // Apply value-level transformation first (e.g. string -> Date / BigInt / PublicKey)
  const patched = onValue ? onValue(value) : value;

  // Recurse into arrays
  if (Array.isArray(patched)) {
    return patched.map((x, _i) => mapKeysDeep(x, keyMap, onValue));
  }

  // Recurse into plain objects
  if (isPlainObject(patched)) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(patched)) {
      const nk = keyMap(k);
      out[nk] = mapKeysDeep(v, keyMap, onValue);
    }
    return out;
  }
  // Primitive values are returned as-is
  return patched;
}

// ISO-8601 date in UTC (Z)
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/;

// Integer represented as a string
const INT_STRING_RE = /^-?\d+$/;

/**
 * Convert scalar string values into richer runtime types.
 *
 * This function is intentionally conservative and defensive:
 * - It only runs on strings
 * - It uses try/catch
 */
function reviveScalars(v: unknown): unknown {
  if (typeof v !== "string") return v;

  // ISO date string -> Date
  if (ISO_DATE_RE.test(v)) {
    const d = new Date(v);
    if (!Number.isNaN(d.getTime())) return d;
  }

  // Integer string -> BigInt
  // Note:
  //  - This assumes backend sends large integers as strings.
  //  - If backend sends numbers, precision may already be lost.
  if (INT_STRING_RE.test(v)) {
    try {
      return BigInt(v);
    } catch {
      // Leave as string
    }
  }

  return v;
}

/**
 * =========================
 * Response normalization
 * =========================
 *
 * Order matters:
 * 1. First revive scalar values (Date, BigInt, PublicKey)
 * 2. Then convert keys from snake_case to camelCase
 */
export function normalizeResponseJson(raw: unknown) {
  // Step 1: revive values without changing keys
  const revived = mapKeysDeep(raw, k => k, reviveScalars);
  // Step 2: convert keys to camelCase
  return mapKeysDeep(revived, snakeToCamel);
}

/**
 * =========================
 * Request normalization
 * =========================
 *
 * Convert outgoing request bodies from camelCase to snake_case,
 * so frontend can work in camelCase while backend expects snake_case.
 */
function normalizeRequestBody(body: unknown) {
  return mapKeysDeep(body, camelToSnake);
}

/**
 * Convert camelCase query keys to snake_case,
 * and merge exploded query parameters into comma-separated form.
 *
 * Example:
 *   ?pool=a&pool=b&foo=1&openedAtFrom=123
 * becomes:
 *   ?pool=a,b&foo=1&opened_at_from=123
 *
 * This is required to support OpenAPI style=form + explode=false,
 * which is ignored by orval in current version.
 */
function modifyQuery(url: string): string {
  // Parse the input URL string
  const u = new URL(url);

  // Access query parameters
  const params = u.searchParams;

  // Group query values by parameter name
  // e.g. { pool: ["a", "b"], foo: ["1"] }
  const grouped = new Map<string, string[]>();

  for (const [key, value] of params.entries()) {
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(value);
  }

  // Build new query parameters
  const newParams = new URLSearchParams();

  for (const [key, values] of grouped.entries()) {
    // Multiple values are merged into a comma-separated string
    const snakeKey = camelToSnake(key);
    newParams.set(snakeKey, values.join(","));
  }

  // Replace query string in the URL
  u.search = newParams.toString();

  // Return the updated URL as a string
  return u.toString();
}

/**
 * =========================
 * Orval custom fetch (mutator)
 * =========================
 *
 * This function replaces the default fetch used by Orval-generated SDK.
 * It acts as a single transport-layer boundary.
 */
export async function customFetch<T>(url: string, init: RequestInit & { baseUrl?: string }): Promise<T> {
  // Make full from baseUrl and url strings
  const fullUrl = resolveTunaUrl(url, init);

  // Clone init to avoid mutating Orval's internal object
  const finalInit: RequestInit = { ...init };

  // If request body is a plain object:
  //  - convert keys to snake_case
  //  - JSON.stringify manually
  //  - ensure content-type header
  if (finalInit.body && typeof finalInit.body === "object" && !(finalInit.body instanceof FormData)) {
    const snaked = normalizeRequestBody(finalInit.body);
    finalInit.body = JSON.stringify(snaked);
    finalInit.headers = {
      "content-type": "application/json",
      ...(finalInit.headers || {}),
    };
  }

  // Fix queries with multiple values for the same parameter
  const fullUrlWithQuery = modifyQuery(fullUrl);

  // Perform HTTP request
  const res = await fetch(fullUrlWithQuery, finalInit);

  // Read body as text
  const text = await res.text();

  // Parse and normalize JSON, return undefined in case of errors
  let data: unknown = undefined;
  try {
    const raw = JSON.parse(text);
    // Normalize response payload
    data = normalizeResponseJson(raw);
  } catch {
    // data is undefined
  }

  // Orval fetch client typically expects:
  // { status, data }
  //
  // Adjust this shape if your generated client differs.
  return { status: res.status, data } as unknown as T;
}
