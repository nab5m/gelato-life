// 클라이언트에서 /api/favorites 를 호출하는 헬퍼 (찜/저장)
"use client";

import { apiFetch } from "./apiFetch";

export async function fetchFavorites() {
  const res = await apiFetch("/api/favorites");
  if (res.status === 401) return [];
  if (!res.ok) throw new Error(`찜 목록 조회 실패 (${res.status})`);
  const json = await res.json();
  return json.items || [];
}

// listing 객체에서 저장에 필요한 스냅샷만 추출
export function toFavoriteSnapshot(listing) {
  if (!listing) return null;
  return {
    roomId: String(listing.id),
    title: listing.title,
    city: listing.city,
    thumb: listing.thumb || (listing.images && listing.images[0]) || null,
    price: listing.price,
    currency: listing.currency || "KRW",
  };
}

export async function addFavorite(snapshot) {
  const res = await apiFetch("/api/favorites", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(snapshot),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.error || `찜 추가 실패 (${res.status})`);
  return json.favorite;
}

export async function removeFavorite(roomId) {
  const res = await apiFetch(`/api/favorites/${encodeURIComponent(roomId)}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`찜 해제 실패 (${res.status})`);
  return true;
}
