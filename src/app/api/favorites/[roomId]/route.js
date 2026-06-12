// DELETE /api/favorites/[roomId] — 찜 해제
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserIdFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function DELETE(request, { params }) {
  const userId = getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const roomId = String(params.roomId);

  // 없으면 이미 해제된 상태로 보고 성공 처리(멱등).
  await prisma.favorite
    .delete({ where: { userId_roomId: { userId, roomId } } })
    .catch(() => null);

  return NextResponse.json({ ok: true });
}
