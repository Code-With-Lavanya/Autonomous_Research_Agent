import { NextRequest, NextResponse } from "next/server";
import { BACKEND_URL, extractDetail, parseJsonBody, unreachableMessage } from "@/lib/backend";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  let incoming: FormData;
  try {
    incoming = await request.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart/form-data." }, { status: 400 });
  }

  const file = incoming.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }
  if (!file.name.toLowerCase().endsWith(".pdf")) {
    // Matches the exact restriction in backend/app/api/upload.py.
    return NextResponse.json({ error: "Only PDF files are allowed." }, { status: 400 });
  }

  const outgoing = new FormData();
  outgoing.append("file", file, file.name);

  try {
    const upstream = await fetch(`${BACKEND_URL}/api/v1/upload`, {
      method: "POST",
      body: outgoing,
    });

    const data = await parseJsonBody(upstream);

    if (!upstream.ok) {
      const detail = extractDetail(data) ?? `The backend responded with status ${upstream.status}.`;
      return NextResponse.json({ error: detail }, { status: upstream.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch {
    return NextResponse.json(
      {
        error: unreachableMessage(
          "If the backend is running, confirm the /upload router is included in main.py — see the README."
        ),
      },
      { status: 502 }
    );
  }
}
