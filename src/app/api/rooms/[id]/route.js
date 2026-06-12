// GET /api/rooms/[id]
// 파트너 방 상세를 프록시한다.
import { NextResponse } from "next/server";
import { isPartnerConfigured } from "@/lib/partner/config";
import { getRoom } from "@/lib/partner/rooms";
import { withLocale } from "@/lib/partner/requestContext";
import { getListing } from "@/data/listings";

export const dynamic = "force-dynamic";

async function handleGET(request, { params }) {
  const { id } = params;

  if (!isPartnerConfigured()) {
    const mock = getListing(id);
    if (!mock) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json(
      { source: "mock", room: mock },
      { headers: { "X-Data-Source": "mock" } }
    );
  }

  try {
    const room = await getRoom(id);
    if (!room) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json(
      { source: "partner", room },
      { headers: { "X-Data-Source": "partner" } }
    );
  } catch (e) {
    return NextResponse.json(
      { source: "error", error: String(e?.message || e) },
      { status: 502 }
    );
  }
}

export const GET = withLocale(handleGET);
