// GET  /api/contracts        — 예약(계약) 목록 (DB)
// POST /api/contracts        — 계약 신청: 파트너 생성 → B(미러)→A(예약) 적재
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getRoom } from "@/lib/partner/rooms";
import { createReservation, serializeReservation } from "@/lib/contracts/service";
import { getUserIdFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const userId = getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  const list = await prisma.reservation.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ items: list.map(serializeReservation) });
}

export async function POST(request) {
  const userId = getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  let payload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청 본문" }, { status: 400 });
  }

  const { buildingUnitTypeId, guestName, guestEmail, guestPhone, startDate, endDate, memo } =
    payload || {};

  if (!buildingUnitTypeId) {
    return NextResponse.json({ error: "buildingUnitTypeId 가 필요합니다." }, { status: 400 });
  }
  if (!startDate || !endDate) {
    return NextResponse.json({ error: "startDate, endDate 가 필요합니다." }, { status: 400 });
  }
  if (!guestEmail || !guestName) {
    return NextResponse.json({ error: "입주자 이름/이메일이 필요합니다." }, { status: 400 });
  }

  try {
    // 자동 승인 여부는 클라이언트를 믿지 않고 방 상세에서 서버가 직접 확인한다.
    const room = await getRoom(buildingUnitTypeId);
    if (!room) {
      return NextResponse.json({ error: "방을 찾을 수 없습니다." }, { status: 404 });
    }

    const reservation = await createReservation(
      {
        buildingUnitTypeId,
        autoApproval: room.hasAutoApproval,
        guestName,
        guestEmail,
        guestPhone,
        startDate,
        endDate,
        memo,
      },
      { userId }
    );

    return NextResponse.json(
      { reservation: serializeReservation(reservation) },
      { status: 201 }
    );
  } catch (e) {
    const status = e?.status === 400 || e?.status === 404 ? e.status : 502;
    console.error(`[api/contracts] ${status} — 계약 생성 실패: ${e?.message || e}`);
    return NextResponse.json({ error: String(e?.message || e) }, { status });
  }
}
