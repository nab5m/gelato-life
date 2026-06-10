"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus } from "lucide-react";
import { krw, nightsBetween } from "@/lib/format";

export default function BookingWidget({ listing }) {
  const router = useRouter();
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);

  const nights = nightsBetween(checkIn, checkOut);
  const base = nights * listing.price;
  const service = Math.round(base * listing.serviceFeeRate);
  const total = base + (nights ? listing.cleaningFee : 0) + service;
  const valid = nights > 0;

  const reserve = () => {
    const params = new URLSearchParams({
      checkIn,
      checkOut,
      guests: String(guests),
    });
    router.push(`/checkout/${listing.id}?${params.toString()}`);
  };

  const today = "2025-06-09";

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-card">
      <div className="flex items-end justify-between">
        <p>
          <span className="text-2xl font-bold">{krw(listing.price)}</span>
          <span className="text-gray-600"> / 주</span>
        </p>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-gray-300">
        <div className="grid grid-cols-2">
          <label className="border-r border-gray-300 p-3">
            <span className="block text-[11px] font-bold uppercase text-gray-700">
              체크인
            </span>
            <input
              type="date"
              min={today}
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="w-full bg-transparent text-sm outline-none"
            />
          </label>
          <label className="p-3">
            <span className="block text-[11px] font-bold uppercase text-gray-700">
              체크아웃
            </span>
            <input
              type="date"
              min={checkIn || today}
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full bg-transparent text-sm outline-none"
            />
          </label>
        </div>
        <div className="flex items-center justify-between border-t border-gray-300 p-3">
          <div>
            <span className="block text-[11px] font-bold uppercase text-gray-700">
              인원
            </span>
            <span className="text-sm text-gray-700">게스트 {guests}명</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setGuests((g) => Math.max(1, g - 1))}
              disabled={guests <= 1}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:border-gray-800 disabled:opacity-40"
            >
              <Minus size={15} />
            </button>
            <span className="w-5 text-center text-sm">{guests}</span>
            <button
              onClick={() => setGuests((g) => Math.min(listing.guests, g + 1))}
              disabled={guests >= listing.guests}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:border-gray-800 disabled:opacity-40"
            >
              <Plus size={15} />
            </button>
          </div>
        </div>
      </div>

      <button
        onClick={reserve}
        disabled={!valid}
        className="btn-primary mt-4 w-full"
      >
        {valid ? "예약하기" : "날짜를 선택하세요"}
      </button>

      {valid && (
        <>
          <p className="mt-3 text-center text-sm text-gray-500">
            아직 예약 확정 전이에요
          </p>
          <div className="mt-4 space-y-3 text-sm text-gray-700">
            <Row
              label={`${krw(listing.price)} × ${nights}박`}
              value={krw(base)}
            />
            <Row label="청소비" value={krw(listing.cleaningFee)} />
            <Row label="젤라또 서비스 수수료" value={krw(service)} />
            <div className="border-t border-gray-200 pt-3">
              <Row label="총 합계" value={krw(total)} bold />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Row({ label, value, bold }) {
  return (
    <div className="flex items-center justify-between">
      <span className={`${bold ? "font-bold" : "underline decoration-gray-300"}`}>
        {label}
      </span>
      <span className={bold ? "font-bold" : ""}>{value}</span>
    </div>
  );
}
