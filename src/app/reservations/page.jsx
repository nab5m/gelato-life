"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { krw, formatDate } from "@/lib/format";
import { useReservations } from "@/lib/contractsClient";
import { statusLabel, statusTone } from "@/lib/partner/mapContract";
import { useAuth } from "@/context/AuthContext";

const TONE = {
  mint: "bg-mint-100 text-mint-700",
  amber: "bg-amber-100 text-amber-700",
  gray: "bg-gray-100 text-gray-600",
};

// 진행 중(취소/종료/만료/거절 외)으로 볼 상태
const ACTIVE_STATUSES = new Set([
  "REQUESTED",
  "APPROVED",
  "PAYMENT_PENDING",
  "PENDING_PAYMENT",
  "PAID",
  "COMPLETED",
]);

export default function ReservationsPage() {
  const { user, ready } = useAuth();
  const { items, loading, error } = useReservations();

  const upcoming = items.filter((r) => ACTIVE_STATUSES.has(r.status));
  const past = items.filter((r) => !ACTIVE_STATUSES.has(r.status));

  // 비로그인 안내
  if (ready && !user) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="mx-auto max-w-4xl px-4 py-8 md:px-6">
          <h1 className="text-3xl font-bold text-gray-900">여행</h1>
          <div className="mt-8 rounded-2xl border border-dashed border-gray-300 p-10 text-center">
            <p className="text-4xl">🔑</p>
            <p className="mt-3 font-semibold text-gray-800">로그인이 필요해요</p>
            <p className="mt-1 text-sm text-gray-500">로그인하면 내 예약 내역을 볼 수 있어요.</p>
            <Link href="/login" className="btn-primary mt-5 inline-block">
              로그인
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
      <main className="mx-auto max-w-4xl px-4 py-8 md:px-6">
        <h1 className="text-3xl font-bold text-gray-900">여행</h1>

        {(loading || !ready) && <p className="py-16 text-center text-gray-400">불러오는 중…</p>}
        {error && !loading && (
          <p className="py-16 text-center text-gray-500">예약을 불러오지 못했어요.</p>
        )}

        {ready && !loading && !error && (
          <>
            <Section title="진행 중인 예약" items={upcoming} empty="진행 중인 예약이 없어요." />
            <Section title="지난/취소된 예약" items={past} empty="지난 예약 내역이 없어요." />
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

function Section({ title, items, empty }) {
  return (
    <section className="mt-8">
      <h2 className="mb-4 text-xl font-bold text-gray-900">{title}</h2>
      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
          {empty}{" "}
          <Link href="/search" className="font-semibold text-gelato-600 underline">
            숙소 둘러보기
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((r) => (
            <Link
              key={r.id}
              href={`/reservations/${r.id}`}
              className="flex items-center gap-4 rounded-2xl border border-gray-200 p-4 transition hover:shadow-card"
            >
              {r.roomThumb ? (
                <img
                  src={r.roomThumb}
                  alt={r.roomTitle || "방"}
                  className="h-24 w-32 shrink-0 rounded-xl object-cover"
                />
              ) : (
                <div className="flex h-24 w-32 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-xs text-gray-400">
                  이미지 없음
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      TONE[statusTone(r.status)] || TONE.gray
                    }`}
                  >
                    {statusLabel(r.status)}
                  </span>
                  <span className="truncate text-xs text-gray-400">{r.externalId}</span>
                </div>
                <p className="mt-1 truncate font-semibold text-gray-900">
                  {r.roomTitle || "이름 없는 숙소"}
                </p>
                <p className="truncate text-sm text-gray-500">{r.roomCity || "위치 정보 없음"}</p>
                <p className="mt-1 text-sm text-gray-700">
                  {formatDate(r.startAt)} – {formatDate(r.endAt)} · {krw(r.totalPrice)}
                </p>
              </div>
              <ChevronRight className="shrink-0 text-gray-400" />
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
