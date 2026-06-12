"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchBar from "@/components/SearchBar";
import ListingCard from "@/components/ListingCard";
import { useRooms, useInfiniteScroll } from "@/lib/roomsClient";
import { useT } from "@/context/LocaleContext";

export default function HomePage() {
  const t = useT();
  const { rooms: filtered, loading, loadingMore, error, hasMore, loadMore } =
    useRooms();
  const sentinelRef = useInfiniteScroll(loadMore, hasMore && !loading && !error);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gelato-50 via-cream to-mint-50">
        <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-gelato-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-0 h-72 w-72 rounded-full bg-mint-200/40 blur-3xl" />
        <div className="relative mx-auto max-w-5xl px-4 py-14 text-center md:py-20">
          <span className="inline-block rounded-full bg-white/70 px-4 py-1.5 text-sm font-semibold text-gelato-600 shadow-soft">
            🍦 {t("어디서든 달콤한 머무름")}
          </span>
          <h1 className="mt-5 text-3xl font-extrabold leading-tight text-gray-900 md:text-5xl">
            {t("오늘은 어디서")}{" "}
            <span className="bg-gradient-to-r from-gelato-500 to-mint-500 bg-clip-text text-transparent">
              {t("달콤하게")}
            </span>{" "}
            {t("쉬어볼까요?")}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-gray-600">
            {t("전 세계 200만 개의 숙소 중, 당신만의 한 스쿱을 찾아보세요.")}
          </p>
          <div className="mt-8">
            <SearchBar variant="hero" />
          </div>
        </div>
      </section>

      {/* 숙소 그리드 */}
      <main className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="grid grid-cols-1 gap-x-5 gap-y-8 py-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>

        {loading && (
          <p className="py-20 text-center text-gray-400">{t("숙소를 불러오는 중…")}</p>
        )}

        {/* 무한 스크롤 sentinel + 추가 로딩 표시 */}
        {!loading && !error && (
          <>
            <div ref={sentinelRef} aria-hidden className="h-px w-full" />
            {loadingMore && (
              <p className="py-8 text-center text-gray-400">{t("더 불러오는 중…")}</p>
            )}
          </>
        )}

        {error && !loading && (
          <p className="py-20 text-center text-gray-500">
            {t("숙소를 불러오지 못했어요. 잠시 후 다시 시도해주세요.")}
          </p>
        )}

        {!loading && !error && filtered.length === 0 && (
          <p className="py-20 text-center text-gray-500">
            {t("등록된 숙소가 아직 없어요.")}
          </p>
        )}
      </main>

      <Footer />
    </div>
  );
}
