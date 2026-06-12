// GET  /api/chat/[chatId]/messages   — 메시지 목록 (cursor 페이지네이션, 과거→최신)
// POST /api/chat/[chatId]/messages   — 메시지 전송 ({ message })
import { NextResponse } from "next/server";
import { isPartnerConfigured } from "@/lib/partner/config";
import { getUserIdFromRequest } from "@/lib/auth";
import { listMessages, sendMessage } from "@/lib/chat/service";
import { withLocale } from "@/lib/partner/requestContext";

export const dynamic = "force-dynamic";

async function handleGET(request, { params }) {
  const userId = getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  if (!isPartnerConfigured()) {
    return NextResponse.json({ configured: false, items: [], cursor: null });
  }

  const sp = request.nextUrl.searchParams;
  const cursor = sp.get("cursor") || undefined;
  const limit = sp.get("limit") ? Number(sp.get("limit")) : undefined;

  try {
    const { items, cursor: next } = await listMessages(userId, params.chatId, { cursor, limit });
    return NextResponse.json({ configured: true, items, cursor: next });
  } catch (e) {
    const status = e?.status === 404 ? 404 : 502;
    console.error(`[api/chat/messages] ${status} — 조회 실패: ${e?.message || e}`);
    return NextResponse.json({ error: String(e?.message || e) }, { status });
  }
}

async function handlePOST(request, { params }) {
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

  const message = (payload?.message || "").trim();
  if (!message) {
    return NextResponse.json({ error: "메시지 본문이 비어 있습니다." }, { status: 400 });
  }

  try {
    const sent = await sendMessage(userId, params.chatId, message);
    return NextResponse.json({ message: sent }, { status: 201 });
  } catch (e) {
    const status = e?.status === 404 ? 404 : 502;
    console.error(`[api/chat/messages] ${status} — 전송 실패: ${e?.message || e}`);
    return NextResponse.json({ error: String(e?.message || e) }, { status });
  }
}

export const GET = withLocale(handleGET);
export const POST = withLocale(handlePOST);
