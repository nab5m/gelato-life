// GET  /api/favorites — 로그인 유저의 찜(저장한 매물) 목록
// POST /api/favorites — 매물 찜 추가 (멱등). body: { roomId, title, city, thumb, price, currency }
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserIdFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Favorite 레코드 → 위시리스트에서 ListingCard 가 쓰는 listing 형태로 직렬화
function serializeFavorite(f) {
  return {
    id: f.roomId,
    roomId: f.roomId,
    title: f.roomTitle || "이름 없는 숙소",
    city: f.roomCity || "위치 정보 없음",
    thumb: f.roomThumb || null,
    images: f.roomThumb ? [f.roomThumb] : [],
    price: f.roomPrice || 0,
    currency: f.roomCurrency || "KRW",
    createdAt: f.createdAt,
  };
}

export async function GET(request) {
  const userId = getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const list = await prisma.favorite.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ items: list.map(serializeFavorite) });
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

  const { roomId, title, city, thumb, price, currency } = payload || {};
  if (!roomId) {
    return NextResponse.json({ error: "roomId 가 필요합니다." }, { status: 400 });
  }

  const snapshot = {
    roomTitle: title ? String(title) : null,
    roomCity: city ? String(city) : null,
    roomThumb: thumb ? String(thumb) : null,
    roomPrice: Number.isFinite(Number(price)) ? Math.trunc(Number(price)) : 0,
    roomCurrency: currency ? String(currency) : "KRW",
  };

  // (userId, roomId) 유니크 — 이미 있으면 스냅샷만 갱신(멱등).
  const favorite = await prisma.favorite.upsert({
    where: { userId_roomId: { userId, roomId: String(roomId) } },
    create: { userId, roomId: String(roomId), ...snapshot },
    update: snapshot,
  });

  return NextResponse.json({ favorite: serializeFavorite(favorite) }, { status: 201 });
}
