// GET /api/rooms — 파트너 방 목록을 페이지 단위로 프록시한다. 자격증명은 서버에만 둔다.
// 지원 쿼리: q(=searchText) category sort startDate endDate
//            minPrice maxPrice minLat minLng maxLat maxLng operationStatus page size
import { NextResponse } from "next/server";
import { isPartnerConfigured } from "@/lib/partner/config";
import { listRoomsPage, DEFAULT_PAGE_SIZE } from "@/lib/partner/rooms";
import { withLocale } from "@/lib/partner/requestContext";
import { listings as mockListings } from "@/data/listings";

export const dynamic = "force-dynamic";

const numOrUndef = (v) => {
  if (v == null || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};

// mock 폴백 전용 필터/정렬 (파트너 path 는 API 가 서버 사이드로 처리)
function applyMock(items, { q, category, minPrice, maxPrice, sort }) {
  let result = items;
  if (category && category !== "all") {
    result = result.filter((l) => (l.cats || []).includes(category));
  }
  if (q) {
    const t = q.trim().toLowerCase();
    result = result.filter(
      (l) =>
        (l.title || "").toLowerCase().includes(t) ||
        (l.city || "").toLowerCase().includes(t) ||
        (l.type || "").toLowerCase().includes(t)
    );
  }
  if (minPrice != null) result = result.filter((l) => l.price >= minPrice);
  if (maxPrice != null) result = result.filter((l) => l.price <= maxPrice);
  if (sort === "PRICE_ASC") result = [...result].sort((a, b) => a.price - b.price);
  else if (sort === "PRICE_DESC") result = [...result].sort((a, b) => b.price - a.price);
  return result;
}

async function handleGET(request) {
  const sp = request.nextUrl.searchParams;
  const q = sp.get("q") || sp.get("searchText") || "";
  const category = sp.get("category") || "all";
  const sort = sp.get("sort") || undefined;
  const startDate = sp.get("startDate") || sp.get("checkIn") || undefined;
  const endDate = sp.get("endDate") || sp.get("checkOut") || undefined;
  const minPrice = numOrUndef(sp.get("minPrice"));
  const maxPrice = numOrUndef(sp.get("maxPrice"));
  const minLatitude = numOrUndef(sp.get("minLat"));
  const minLongitude = numOrUndef(sp.get("minLng"));
  const maxLatitude = numOrUndef(sp.get("maxLat"));
  const maxLongitude = numOrUndef(sp.get("maxLng"));
  // 공개 목록은 운영 상태 PUBLISHED 인 방만 노출한다. (필요 시 쿼리로 override)
  const operationStatus = sp.get("operationStatus") || "PUBLISHED";
  const page = Math.max(0, Number(sp.get("page")) || 0);
  const size = Math.min(50, Math.max(1, Number(sp.get("size")) || DEFAULT_PAGE_SIZE));

  // 자격증명 미설정 시 mock 으로 폴백 (개발 편의) — 필터/정렬 후 page/size 슬라이스
  if (!isPartnerConfigured()) {
    const all = applyMock(mockListings, { q, category, minPrice, maxPrice, sort });
    const start = page * size;
    const items = all.slice(start, start + size);
    return NextResponse.json(
      {
        source: "mock",
        items,
        page,
        size,
        totalItems: all.length,
        totalPages: Math.max(1, Math.ceil(all.length / size)),
        hasMore: start + size < all.length,
      },
      { headers: { "X-Data-Source": "mock" } }
    );
  }

  try {
    const result = await listRoomsPage({
      page,
      size,
      operationStatus,
      sort,
      searchText: q || undefined,
      startDate,
      endDate,
      minRentFeePerWeek: minPrice,
      maxRentFeePerWeek: maxPrice,
      minLatitude,
      minLongitude,
      maxLatitude,
      maxLongitude,
    });
    return NextResponse.json(
      {
        source: "partner",
        items: result.items,
        page: result.page,
        size,
        totalItems: result.totalItems,
        totalPages: result.totalPages,
        hasMore: result.hasMore,
      },
      { headers: { "X-Data-Source": "partner" } }
    );
  } catch (e) {
    console.error(`[api/rooms] 502 — partner 조회 실패: ${e?.message || e}`);
    if (e?.stack) console.error(e.stack);
    return NextResponse.json(
      { source: "error", error: String(e?.message || e), items: [], hasMore: false },
      { status: 502 }
    );
  }
}

export const GET = withLocale(handleGET);
