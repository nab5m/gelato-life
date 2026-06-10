// 클라이언트에서 /api/rooms 라우트를 호출하는 헬퍼 + hook
"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const DEFAULT_SIZE = 20;

// 방 목록 한 페이지 조회. { items, page, totalPages, totalItems, hasMore } 반환.
export async function fetchRoomsPage({
  q = "",
  category = "all",
  sort = "",
  startDate = "",
  endDate = "",
  minPrice,
  maxPrice,
  bbox, // { minLat, minLng, maxLat, maxLng }
  page = 0,
  size = DEFAULT_SIZE,
} = {}) {
  const sp = new URLSearchParams();
  if (q) sp.set("q", q);
  if (category && category !== "all") sp.set("category", category);
  if (sort) sp.set("sort", sort);
  if (startDate) sp.set("startDate", startDate);
  if (endDate) sp.set("endDate", endDate);
  if (minPrice != null && minPrice !== "") sp.set("minPrice", String(minPrice));
  if (maxPrice != null && maxPrice !== "") sp.set("maxPrice", String(maxPrice));
  if (bbox) {
    if (bbox.minLat != null) sp.set("minLat", String(bbox.minLat));
    if (bbox.minLng != null) sp.set("minLng", String(bbox.minLng));
    if (bbox.maxLat != null) sp.set("maxLat", String(bbox.maxLat));
    if (bbox.maxLng != null) sp.set("maxLng", String(bbox.maxLng));
  }
  sp.set("page", String(page));
  sp.set("size", String(size));
  const res = await fetch(`/api/rooms?${sp.toString()}`);
  if (!res.ok) throw new Error(`방 목록 조회 실패 (${res.status})`);
  return res.json();
}

export async function fetchRoom(id) {
  const res = await fetch(`/api/rooms/${id}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`방 상세 조회 실패 (${res.status})`);
  const json = await res.json();
  return json.room || null;
}

// 목록 hook (무한 스크롤): { rooms, loading, loadingMore, error, hasMore, loadMore, totalItems }
// 검색/정렬/필터 조건이 바뀌면 page 0 부터 다시 로드한다.
export function useRooms({
  q = "",
  category = "all",
  sort = "",
  startDate = "",
  endDate = "",
  minPrice,
  maxPrice,
  bbox,
  size = DEFAULT_SIZE,
} = {}) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [totalItems, setTotalItems] = useState(0);

  const pageRef = useRef(0); // 마지막으로 로드한 페이지
  const busyRef = useRef(false); // 중복 요청 가드
  const reqIdRef = useRef(0); // 필터 변경 시 stale 응답 무시용

  // 조건 객체를 의존성 배열에 안전하게 쓰기 위한 직렬화 키
  const key = JSON.stringify({ q, category, sort, startDate, endDate, minPrice, maxPrice, bbox, size });

  const load = useCallback(
    async (page, reqId) => {
      const json = await fetchRoomsPage({
        q, category, sort, startDate, endDate, minPrice, maxPrice, bbox, page, size,
      });
      if (reqId !== reqIdRef.current) return; // 더 최신 요청이 시작됨 → 버림
      const items = json.items || [];
      setRooms((prev) => (page === 0 ? items : [...prev, ...items]));
      setHasMore(Boolean(json.hasMore));
      setTotalItems(Number(json.totalItems) || 0);
      pageRef.current = page;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key]
  );

  // 조건 변경 / 최초 진입 → page 0 재로드
  useEffect(() => {
    const reqId = ++reqIdRef.current;
    busyRef.current = true;
    setLoading(true);
    setError(null);
    setRooms([]);
    setHasMore(false);
    pageRef.current = 0;

    load(0, reqId)
      .catch((e) => reqId === reqIdRef.current && setError(e))
      .finally(() => {
        if (reqId === reqIdRef.current) {
          setLoading(false);
          busyRef.current = false;
        }
      });
  }, [load]);

  const loadMore = useCallback(() => {
    if (busyRef.current || !hasMore) return;
    const reqId = reqIdRef.current;
    busyRef.current = true;
    setLoadingMore(true);

    load(pageRef.current + 1, reqId)
      .catch((e) => reqId === reqIdRef.current && setError(e))
      .finally(() => {
        if (reqId === reqIdRef.current) {
          setLoadingMore(false);
          busyRef.current = false;
        }
      });
  }, [load, hasMore]);

  return { rooms, loading, loadingMore, error, hasMore, loadMore, totalItems };
}

// 화면 하단 sentinel 이 뷰포트에 들어오면 loadMore 를 호출하는 훅.
// 반환된 ref 를 목록 끝의 빈 div 에 달아준다.
export function useInfiniteScroll(loadMore, enabled = true) {
  const ref = useRef(null);
  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: "400px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [loadMore, enabled]);
  return ref;
}

// 단건 hook: { room, loading, error }
export function useRoom(id) {
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    let alive = true;
    setLoading(true);
    setError(null);
    fetchRoom(id)
      .then((r) => alive && setRoom(r))
      .catch((e) => alive && setError(e))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [id]);

  return { room, loading, error };
}
