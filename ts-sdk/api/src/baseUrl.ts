let baseUrl = "https://api.defituna.com/api";

export function setTunaBaseUrl(url: string) {
  baseUrl = url.replace(/\/$/, "");
}

export function resolveTunaUrl(url: string, init?: { baseUrl?: string }): string {
  // Resolve baseUrl priority:
  // 1. per-request override
  // 2. globally set baseUrl
  const resolvedBaseUrl = init?.baseUrl?.replace(/\/$/, "") ?? baseUrl;

  const fullUrl =
    resolvedBaseUrl && !url.startsWith("http") ? `${resolvedBaseUrl}${url.startsWith("/") ? "" : "/"}${url}` : url;

  return fullUrl;
}
