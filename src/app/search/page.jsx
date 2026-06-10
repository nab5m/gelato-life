"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import CategoryBar from "@/components/CategoryBar";
import ListingCard from "@/components/ListingCard";
import GoogleMap from "@/components/GoogleMap";
import { useRooms, useInfiniteScroll } from "@/lib/roomsClient";
import { krw } from "@/lib/format";

const SORT_OPTIONS = [
  { value: "", label: "추천순" },
  { value: "CREATED_AT_DESC", label: "최신순" },
  { value: "PRICE_ASC", label: "가격 낮은순" },
  { value: "PRICE_DESC", label: "가격 높은순" },
  { value: "POPULAR", label: "인기순" },
  { value: "UNIVERSITY_DIST_ASC", label: "대학교 거리순" },
];

function SearchInner() {
  const sp = useSearchParams();
  const router = useRouter();
  const q = sp.get("q") || "";
  const guests = sp.get("guests");
  const startDate = sp.get("checkIn") || "";
  const endDate = sp.get("checkOut") || "";
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("");
  // 가격: 입력(draft)과 실제 적용값(applied)을 분리해 키 입력마다 재조회되지 않게 한다.
  const [minDraft, setMinDraft] = useState("");
  const [maxDraft, setMaxDraft] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const applyPrice = (e) => {
    e?.preventDefault();
    setMinPrice(minDraft);
    setMaxPrice(maxDraft);
  };

  const { rooms: results, loading, loadingMore, error, hasMore, loadMore, totalItems } =
    useRooms({ q, category, sort, startDate, endDate, minPrice, maxPrice });
  const sentinelRef = useInfiniteScroll(loadMore, hasMore && !loading && !error);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="border-b border-gray-100 bg-white py-4">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <SearchBar
            key={`${q}|${startDate}|${endDate}|${guests || ""}`}
            variant="compact"
            initialWhere={q}
            initialCheckIn={startDate}
            initialCheckOut={endDate}
            initialGuests={Number(guests) || 1}
          />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <CategoryBar active={category} onChange={setCategory} />
      </div>

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 md:px-6">
        {/* 결과 목록 */}
        <div className="flex-1">
          {/* 필터 툴바: 정렬 + 가격 범위 */}
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <p className="text-sm text-gray-700">
              {q ? (
                <>
                  <span className="font-semibold">‘{q}’</span> 검색 결과{" "}
                </>
              ) : (
                "전체 숙소 "
              )}
              <span className="font-semibold">{totalItems}개</span>
              {guests && ` · 게스트 ${guests}명`}
            </p>

            <div className="ml-auto flex flex-wrap items-center gap-2">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="rounded-full border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-gray-800"
                aria-label="정렬"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>

              <form
                onSubmit={applyPrice}
                className="flex items-center gap-1.5 rounded-full border border-gray-300 px-3 py-1 text-sm"
              >
                <input
                  type="number"
                  min={0}
                  value={minDraft}
                  onChange={(e) => setMinDraft(e.target.value)}
                  placeholder="최소"
                  className="w-16 bg-transparent outline-none"
                  aria-label="최소 주당 임대료"
                />
                <span className="text-gray-400">–</span>
                <input
                  type="number"
                  min={0}
                  value={maxDraft}
                  onChange={(e) => setMaxDraft(e.target.value)}
                  placeholder="최대"
                  className="w-16 bg-transparent outline-none"
                  aria-label="최대 주당 임대료"
                />
                <span className="text-xs text-gray-400">/주</span>
                <button
                  type="submit"
                  className="ml-1 rounded-full bg-gray-900 px-3 py-1 text-xs font-semibold text-white"
                >
                  적용
                </button>
              </form>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">
            {results.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>

          {loading && (
            <p className="py-24 text-center text-gray-400">불러오는 중…</p>
          )}

          {/* 무한 스크롤 sentinel + 추가 로딩 표시 */}
          {!loading && !error && (
            <>
              <div ref={sentinelRef} aria-hidden className="h-px w-full" />
              {loadingMore && (
                <p className="py-8 text-center text-gray-400">더 불러오는 중…</p>
              )}
            </>
          )}

          {error && !loading && (
            <p className="py-24 text-center text-gray-500">
              숙소를 불러오지 못했어요. 잠시 후 다시 시도해주세요.
            </p>
          )}

          {!loading && !error && results.length === 0 && (
            <div className="py-24 text-center">
              <p className="text-4xl">🍨</p>
              <p className="mt-3 font-semibold text-gray-800">
                검색 결과가 없어요
              </p>
              <p className="mt-1 text-sm text-gray-500">
                다른 키워드로 검색해보세요. (예: 제주, 서울, 발리)
              </p>
            </div>
          )}
        </div>

        {/* 지도 (Google Maps) */}
        <div className="sticky top-24 hidden h-[calc(100vh-8rem)] w-[42%] shrink-0 overflow-hidden rounded-2xl border border-gray-200 lg:block">
          <GoogleMap
            onSelect={(id) => router.push(`/rooms/${id}`)}
            markers={results
              .filter((l) => Number.isFinite(l.lat) && Number.isFinite(l.lng))
              .map((l) => ({
                id: l.id,
                lat: l.lat,
                lng: l.lng,
                title: l.title,
                city: l.city,
                thumb: l.thumb,
                priceLabel: `${krw(l.price)} / 주`,
              }))}
          />
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-gray-400">불러오는 중…</div>}>
      <SearchInner />
    </Suspense>
  );
}
