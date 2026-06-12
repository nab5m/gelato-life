"use client";

import { useT } from "@/context/LocaleContext";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ListingCard from "@/components/ListingCard";
import { useAuth } from "@/context/AuthContext";
import { useFavorites } from "@/context/FavoritesContext";

export default function WishlistPage() {
  const t = useT();
  const { user, ready } = useAuth();
  const { items, loading } = useFavorites();

  // 비로그인 안내
  if (ready && !user) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="mx-auto max-w-4xl px-4 py-8 md:px-6">
          <h1 className="text-3xl font-bold text-gray-900">{t("위시리스트")}</h1>
          <div className="mt-8 rounded-2xl border border-dashed border-gray-300 p-10 text-center">
            <p className="text-4xl">🔑</p>
            <p className="mt-3 font-semibold text-gray-800">{t("로그인이 필요해요")}</p>
            <p className="mt-1 text-sm text-gray-500">
              {t("로그인하면 저장한 숙소를 모아볼 수 있어요.")}
            </p>
            <Link href="/login?next=%2Fwishlist" className="btn-primary mt-5 inline-block">
              {t("로그인")}
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <h1 className="text-3xl font-bold text-gray-900">{t("위시리스트")}</h1>
        <p className="mt-1 text-gray-500">{t("마음에 들어 저장한 숙소를 모아봤어요.")}</p>

        {(loading || !ready) && (
          <p className="py-20 text-center text-gray-400">{t("불러오는 중…")}</p>
        )}

        {ready && !loading && items.length === 0 && (
          <div className="mt-8 rounded-2xl border border-dashed border-gray-300 p-10 text-center">
            <p className="text-4xl">💖</p>
            <p className="mt-3 font-semibold text-gray-800">{t("아직 저장한 숙소가 없어요")}</p>
            <p className="mt-1 text-sm text-gray-500">
              {t("마음에 드는 숙소의 하트를 눌러 저장해보세요.")}
            </p>
            <Link href="/search" className="btn-primary mt-5 inline-block">
              {t("숙소 둘러보기")}
            </Link>
          </div>
        )}

        {ready && !loading && items.length > 0 && (
          <div className="grid grid-cols-1 gap-x-5 gap-y-8 py-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
