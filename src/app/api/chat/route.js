// GET  /api/chat                 — 로그인 유저의 채팅방 목록 (cursor 페이지네이션)
// POST /api/chat                 — 방(buildingUnitTypeId)으로 채팅방 생성/확보
import { NextResponse } from "next/server";
import { isPartnerConfigured } from "@/lib/partner/config";
import { getUserIdFromRequest } from "@/lib/auth";
import { listUserChats, openChat } from "@/lib/chat/service";
import { withLocale } from "@/lib/partner/requestContext";

export const dynamic = "force-dynamic";

async function handleGET(request) {
  const userId = getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  // 연동 미설정 → 클라이언트가 mock 으로 폴백하도록 신호를 준다.
  if (!isPartnerConfigured()) {
    return NextResponse.json({ configured: false, items: [], cursor: null });
  }

  const sp = request.nextUrl.searchParams;
  const cursor = sp.get("cursor") || undefined;
  const limit = sp.get("limit") ? Number(sp.get("limit")) : undefined;

  try {
    const { items, cursor: next } = await listUserChats(userId, { cursor, limit });
    return NextResponse.json({ configured: true, items, cursor: next });
  } catch (e) {
    const status = e?.status === 404 ? 404 : 502;
    console.error(`[api/chat] ${status} — 목록 조회 실패: ${e?.message || e}`);
    return NextResponse.json({ error: String(e?.message || e) }, { status });
  }
}

async function handlePOST(request) {
  const userId = getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  if (!isPartnerConfigured()) {
    return NextResponse.json({ error: "채팅 연동이 설정되지 않았습니다." }, { status: 503 });
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청 본문" }, { status: 400 });
  }

  const { buildingUnitTypeId } = payload || {};
  if (!buildingUnitTypeId) {
    return NextResponse.json({ error: "buildingUnitTypeId 가 필요합니다." }, { status: 400 });
  }

  try {
    const { chatId } = await openChat(userId, buildingUnitTypeId);
    return NextResponse.json({ chatId }, { status: 201 });
  } catch (e) {
    const status = e?.status === 404 ? 404 : 502;
    console.error(`[api/chat] ${status} — 채팅방 생성 실패: ${e?.message || e}`);
    return NextResponse.json({ error: String(e?.message || e) }, { status });
  }
}

export const GET = withLocale(handleGET);
export const POST = withLocale(handlePOST);
