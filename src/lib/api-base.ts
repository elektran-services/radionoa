/**
 * Backend origin for API calls. Override with NEXT_PUBLIC_API_URL (no trailing slash).
 * In production builds, defaults to the deployed NOA API so Vercel previews work without env.
 */
const DEFAULT_PRODUCTION_ORIGIN = "https://noa.elektranbroadcast.com";

export function getApiBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  if (process.env.NODE_ENV === "production") return DEFAULT_PRODUCTION_ORIGIN;
  return "http://localhost:5000";
}

export const API_BASE_URL = getApiBaseUrl();
