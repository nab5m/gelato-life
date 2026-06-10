"use client";

import { Suspense, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2, MapPin, Calendar, User, ChevronLeft,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GoogleMap from "@/components/GoogleMap";
import { krw, formatDateLong } from "@/lib/format";
import { useReservation, cancelReservation, completeReservation } from "@/lib/contractsClient";
import { statusLabel, statusTone } from "@/lib/partner/mapContract";

const TONE = {
  mint: "bg-mint-100 text-mint-700",
  amber: "bg-amber-100 text-amber-700",
  gray: "bg-gray-100 text-gray-600",
};

const CANCELABLE = new Set([
  "REQUESTED",
  "APPROVED",
  "PAYMENT_PENDING",
  "PENDING_PAYMENT",
  "PAID",
]);

// 결제 완료(COMPLETED) 전환 가능한 상태 (승인 이후, 아직 완료/취소 전)
const COMPLETABLE = new Set([
  "APPROVED",
  "PAYMENT_PENDING",
  "PENDING_PAYMENT",
  "PAID",
]);

// 취소/거절/종료/만료 등 비활성 상태 (이 상태에선 "접수" 배너 숨김)
const INACTIVE = new Set([
  "CANCELED",
  "CANCELLED",
  "REJECTED",
  "TERMINATED",
  "EXPIRED",
  "REFUNDED",
]);

function DetailInner() {
  const { id } = useParams();
  const sp = useSearchParams();
  const isNew = sp.get("new") === "1";
  const { reservation, loading, error } = useReservation(id);

  const [res, setRes] = useState(null);
  const [canceling, setCanceling] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [actionErr, setActionErr] = useState(null);

  // hook 결과를 로컬 상태에 동기화 (액션 후 갱신 위해)
  const r = res || reservation;

  if (loading && !res) {
    return <div className="p-20 text-center text-gray-400">불러오는 중…</div>;
  }
  if (error || !r) {
    return (
      <div className="p-20 text-center">
        <p className="text-gray-700">예약을 찾을 수 없어요.</p>
        <Link href="/reservations" className="mt-2 inline-block font-semibold text-gelato-600 underline">
          예약 내역으로
        </Link>
      </div>
    );
  }

  const onComplete = async () => {
    setActionErr(null);
    setCompleting(true);
    try {
      const updated = await completeReservation(r.id);
      setRes(updated);
    } catch (e) {
      setActionErr(String(e.message || e));
    } finally {
      setCompleting(false);
    }
  };

  const onCancel = async () => {
    if (!confirm("이 예약을 취소할까요?")) return;
    setActionErr(null);
    setCanceling(true);
    try {
      const updated = await cancelReservation(r.id);
      setRes(updated);
    } catch (e) {
      setActionErr(String(e.message || e));
    } finally {
      setCanceling(false);
    }
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 md:px-6">
      <Link
        href="/reservations"
        className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-gray-700 hover:underline"
      >
        <ChevronLeft size={16} /> 예약 내역
      </Link>

      {isNew && !INACTIVE.has(r.status) && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl bg-gradient-to-r from-mint-50 to-gelato-50 p-5 animate-fade-in">
          <CheckCircle2 className="shrink-0 text-mint-500" size={32} />
          <div>
            <p className="text-lg font-bold text-gray-900">예약 신청이 접수되었어요! 🍦</p>
            <p className="text-sm text-gray-600">
              {r.status === "APPROVED"
                ? "자동 승인되었습니다. 결제 안내를 기다려주세요."
                : "호스트 승인 후 결제 안내를 받게 됩니다."}
            </p>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-3xl border border-gray-200 shadow-soft">
        {r.roomThumb ? (
          <img src={r.roomThumb} alt={r.roomTitle || "방"} className="h-56 w-full object-cover md:h-72" />
        ) : (
          <div className="flex h-56 w-full items-center justify-center bg-gray-100 text-gray-400 md:h-72">
            등록된 이미지가 없습니다
          </div>
        )}
        <div className="p-6">
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
              TONE[statusTone(r.status)] || TONE.gray
            }`}
          >
            {statusLabel(r.status)}
          </span>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">
            {r.roomTitle || "이름 없는 숙소"}
          </h1>
          <p className="mt-1 flex items-center gap-1 text-gray-600">
            <MapPin size={15} /> {r.roomCity || "위치 정보 없음"}
          </p>
          <p className="mt-4 text-xs text-gray-400">계약번호 {r.externalId}</p>

          {/* 정보 그리드 */}
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Info icon={Calendar} title="시작일" value={formatDateLong(r.startAt)} />
            <Info icon={Calendar} title="종료일" value={formatDateLong(r.endAt)} />
          </div>

          {/* 입주자 */}
          <div className="mt-6 rounded-2xl bg-gray-50 p-4">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
              <User size={14} /> 입주자
            </p>
            <p className="mt-1 font-semibold text-gray-900">{r.guestName || "-"}</p>
            <p className="text-sm text-gray-500">
              {[r.guestEmail, r.guestPhone].filter(Boolean).join(" · ") || "연락처 없음"}
            </p>
          </div>

          {/* 결제 요약 */}
          <div className="mt-6">
            <h3 className="mb-3 font-bold">금액 정보</h3>
            <div className="space-y-2 text-sm text-gray-700">
              <Row label="총 임대료" value={krw(r.totalRentFee)} />
              {r.discountedRentFee > 0 && (
                <Row label="기간 할인" value={`- ${krw(r.discountedRentFee)}`} />
              )}
              <Row label="총 관리비" value={krw(r.totalManagementFee)} />
              <Row label="청소비" value={krw(r.cleaningFee)} />
              <Row label="보증금" value={krw(r.deposit)} />
              <div className="border-t border-gray-200 pt-2">
                <Row label="총 금액" value={krw(r.totalPrice)} bold />
              </div>
            </div>
          </div>

          {/* 지도 (Google Maps) */}
          {Number.isFinite(r.roomLat) && Number.isFinite(r.roomLng) ? (
            <div className="mt-6 h-48 overflow-hidden rounded-2xl border border-gray-200">
              <GoogleMap
                center={{ lat: r.roomLat, lng: r.roomLng }}
                markers={[{ lat: r.roomLat, lng: r.roomLng, label: r.roomTitle }]}
                zoom={15}
              />
            </div>
          ) : (
            <div className="mt-6 flex h-40 items-center justify-center gap-2 rounded-2xl bg-gray-50 text-sm text-gray-400">
              위치 정보가 없어요
            </div>
          )}

          {actionErr && (
            <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">{actionErr}</p>
          )}

          {/* 액션 */}
          <div className="mt-6 space-y-3">
            {COMPLETABLE.has(r.status) && (
              <button
                onClick={onComplete}
                disabled={completing || canceling}
                className="btn-primary w-full disabled:opacity-50"
              >
                {completing ? "결제 처리 중…" : "결제 완료"}
              </button>
            )}
            {CANCELABLE.has(r.status) && (
              <button
                onClick={onCancel}
                disabled={canceling || completing}
                className="w-full rounded-xl border border-gelato-200 px-5 py-3 text-sm font-semibold text-gelato-600 transition hover:bg-gelato-50 disabled:opacity-50"
              >
                {canceling ? "취소 처리 중…" : "예약 취소"}
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function Info({ icon: Icon, title, value }) {
  return (
    <div className="rounded-2xl border border-gray-200 p-4">
      <p className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
        <Icon size={14} /> {title}
      </p>
      <p className="mt-1 font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function Row({ label, value, bold }) {
  return (
    <div className={`flex items-center justify-between ${bold ? "font-bold text-gray-900" : ""}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

export default function ReservationDetailPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header showSearchPill={false} />
      <Suspense fallback={<div className="p-20 text-center text-gray-400">불러오는 중…</div>}>
        <DetailInner />
      </Suspense>
      <Footer />
    </div>
  );
}
