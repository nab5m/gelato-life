// GET /api/rooms/[id]/blocked-dates?startDate=yyyy-MM-dd&endDate=yyyy-MM-dd
// 파트너 방 예약 마감일(blocked date) 조회를 프록시한다.
// startDate/endDate 가 없으면 오늘부터 1년치를 기본 조회한다.
import { NextResponse } from "next/server";
import { isPartnerConfigured } from "@/lib/partner/config";
import { getBlockedDates } from "@/lib/partner/rooms";
import { withLocale } from "@/lib/partner/requestContext";

export const dynamic = "force-dynamic";

function ymd(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

async function handleGET(request, { params }) {
  const { id } = params;
  const sp = request.nextUrl.searchParams;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const oneYear = new Date(today);
  oneYear.setFullYear(oneYear.getFullYear() + 1);

  const startDate = sp.get("startDate") || ymd(today);
  const endDate = sp.get("endDate") || ymd(oneYear);

  // 연동 미설정(mock) 환경에서는 마감일 없음으로 폴백한다.
  if (!isPartnerConfigured()) {
    return NextResponse.json(
      { source: "mock", blockedDates: [] },
      { headers: { "X-Data-Source": "mock" } }
    );
  }

  try {
    const blockedDates = await getBlockedDates({ id, startDate, endDate });
    return NextResponse.json(
      { source: "partner", blockedDates },
      { headers: { "X-Data-Source": "partner" } }
    );
  } catch (e) {
    return NextResponse.json(
      { source: "error", error: String(e?.message || e), blockedDates: [] },
      { status: 502 }
    );
  }
}

export const GET = withLocale(handleGET);
