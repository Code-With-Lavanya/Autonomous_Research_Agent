import { NextResponse } from "next/server";
import { BACKEND_URL } from "@/lib/backend";

export async function GET() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4_000);

  try {
    const upstream = await fetch(`${BACKEND_URL}/`, {
      signal: controller.signal,
      cache: "no-store",
    });

    if (!upstream.ok) {
      return NextResponse.json({ ok: false, backendUrl: BACKEND_URL });
    }

    const data = await upstream.json().catch(() => ({}) as { message?: string });
    return NextResponse.json({ ok: true, backendUrl: BACKEND_URL, message: data?.message });
  } catch {
    return NextResponse.json({ ok: false, backendUrl: BACKEND_URL });
  } finally {
    clearTimeout(timeout);
  }
}
