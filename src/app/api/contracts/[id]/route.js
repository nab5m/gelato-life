// GET   /api/contracts/[id]  — 예약 단건 (DB)
// PATCH /api/contracts/[id]  — 취소({action:"cancel"}) 또는 수정(기간/입주자 정보)
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  cancelReservation,
  completeReservation,
  updateReservation,
  serializeReservation,
} from "@/lib/contracts/service";
import { getUserIdFromRequest } from "@/lib/auth";
import { withLocale } from "@/lib/partner/requestContext";

export const dynamic = "force-dynamic";

// 본인 소유 예약만 접근. 아니면 null.
async function findOwned(id, userId) {
  if (!userId) return null;
  const resv = await prisma.reservation.findUnique({ where: { id } });
  if (!resv || resv.userId !== userId) return null;
  return resv;
}

async function handleGET(request, { params }) {
  const userId = getUserIdFromRequest(request);
  const resv = await findOwned(params.id, userId);
  if (!resv) return NextResponse.json({ error: "예약을 찾을 수 없습니다." }, { status: 404 });
  return NextResponse.json({ reservation: serializeReservation(resv) });
}

async function handlePATCH(request, { params }) {
  const { id } = params;
  const userId = getUserIdFromRequest(request);
  const owned = await findOwned(id, userId);
  if (!owned) return NextResponse.json({ error: "예약을 찾을 수 없습니다." }, { status: 404 });

  let payload;
  try {
    payload = await request.json();
  } catch {
    payload = {};
  }

  try {
    let reservation;
    if (payload?.action === "cancel") {
      reservation = await cancelReservation(id);
    } else if (payload?.action === "complete") {
      reservation = await completeReservation(id);
    } else {
      // 기간/입주자 정보 수정 (전체 덮어쓰기 — 미러 raw 기반 + overrides)
      const overrides = {};
      if (payload.startDate) overrides.startAt = new Date(`${payload.startDate}T00:00:00Z`).toISOString();
      if (payload.endDate) overrides.endAt = new Date(`${payload.endDate}T00:00:00Z`).toISOString();
      if (payload.guestName != null) overrides.guestName = payload.guestName;
      if (payload.guestEmail != null) overrides.guestEmail = payload.guestEmail;
      if (payload.guestPhone != null) overrides.guestFullPhoneNumber = payload.guestPhone;
      if (payload.memo != null) overrides.memo = payload.memo;
      reservation = await updateReservation(id, overrides);
    }
    return NextResponse.json({ reservation: serializeReservation(reservation) });
  } catch (e) {
    const status = e?.status === 404 ? 404 : 502;
    console.error(`[api/contracts/${id}] ${status} — 계약 수정 실패: ${e?.message || e}`);
    return NextResponse.json({ error: String(e?.message || e) }, { status });
  }
}

export const GET = withLocale(handleGET);
export const PATCH = withLocale(handlePATCH);
