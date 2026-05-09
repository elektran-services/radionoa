import { NextRequest } from "next/server";
import { API_BASE_URL } from "@/lib/api-base";

// Proxy /api/proxy/* to the backend base URL.
const BACKEND = API_BASE_URL;

export async function GET(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  const subpath = Array.isArray(path) ? path.join("/") : "";
  const url = `${BACKEND}/${subpath}`;
  const res = await fetch(url, { headers: { accept: "*/*" }, cache: "no-store" });
  const contentType = res.headers.get("content-type") || "application/octet-stream";
  const body = await res.arrayBuffer();
  return new Response(body, { status: res.status, headers: { "content-type": contentType } });
} 