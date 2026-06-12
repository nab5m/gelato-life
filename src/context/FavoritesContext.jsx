"use client";

import { createContext, useContext, useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  fetchFavorites,
  addFavorite,
  removeFavorite,
  toFavoriteSnapshot,
} from "@/lib/favoritesClient";

const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const { user, ready } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [items, setItems] = useState([]); // 저장한 매물(listing 형태) 목록
  const [loading, setLoading] = useState(true);

  // 로그인 상태가 정해지면 찜 목록 로드(비로그인 시 비움)
  useEffect(() => {
    if (!ready) return;
    let alive = true;
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchFavorites()
      .then((list) => alive && setItems(list))
      .catch(() => alive && setItems([]))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [user, ready]);

  const ids = useMemo(() => new Set(items.map((i) => String(i.roomId ?? i.id))), [items]);

  const isFavorited = useCallback((roomId) => ids.has(String(roomId)), [ids]);

  // 찜 토글. 비로그인 시 로그인 페이지로 보낸다(돌아올 경로 redirect 로 전달).
  const toggle = useCallback(
    async (listing) => {
      if (!user) {
        const next = encodeURIComponent(pathname || "/");
        router.push(`/login?next=${next}`);
        return;
      }

      const roomId = String(listing.id);
      const already = ids.has(roomId);

      if (already) {
        // 낙관적 제거
        setItems((prev) => prev.filter((i) => String(i.roomId ?? i.id) !== roomId));
        try {
          await removeFavorite(roomId);
        } catch {
          // 실패 시 서버 기준으로 재동기화
          fetchFavorites().then(setItems).catch(() => {});
        }
      } else {
        const snapshot = toFavoriteSnapshot(listing);
        // 낙관적 추가
        const optimistic = {
          id: roomId,
          roomId,
          title: snapshot.title,
          city: snapshot.city,
          thumb: snapshot.thumb,
          images: snapshot.thumb ? [snapshot.thumb] : [],
          price: snapshot.price,
          currency: snapshot.currency,
        };
        setItems((prev) => [optimistic, ...prev]);
        try {
          await addFavorite(snapshot);
        } catch {
          fetchFavorites().then(setItems).catch(() => {});
        }
      }
    },
    [user, ids, pathname, router]
  );

  return (
    <FavoritesContext.Provider value={{ items, loading, isFavorited, toggle }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
}
