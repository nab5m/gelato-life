"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Minus, Plus } from "lucide-react";

export default function SearchBar({
  variant = "hero",
  initialWhere = "",
  initialCheckIn = "",
  initialCheckOut = "",
  initialGuests = 1,
}) {
  const router = useRouter();
  const [where, setWhere] = useState(initialWhere);
  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState(initialCheckOut);
  const [guests, setGuests] = useState(initialGuests || 1);
  const [openGuests, setOpenGuests] = useState(false);

  const submit = (e) => {
    e?.preventDefault();
    const params = new URLSearchParams();
    if (where) params.set("q", where);
    if (checkIn) params.set("checkIn", checkIn);
    if (checkOut) params.set("checkOut", checkOut);
    if (guests) params.set("guests", String(guests));
    router.push(`/search?${params.toString()}`);
  };

  const today = "2025-06-09";

  return (
    <form
      onSubmit={submit}
      className={`relative mx-auto w-full ${
        variant === "hero" ? "max-w-4xl" : "max-w-2xl"
      }`}
    >
      <div className="flex flex-col gap-1 rounded-3xl border border-gray-200 bg-white p-2 shadow-card md:flex-row md:items-center md:rounded-full md:p-1.5">
        {/* 여행지 */}
        <div className="flex-1 rounded-2xl px-5 py-2.5 transition hover:bg-gray-50 md:rounded-full">
          <label className="block text-xs font-semibold text-gray-800">
            여행지
          </label>
          <input
            value={where}
            onChange={(e) => setWhere(e.target.value)}
            placeholder="어디로 떠나볼까요?"
            className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
          />
        </div>
        <div className="hidden h-8 w-px bg-gray-200 md:block" />

        {/* 체크인 */}
        <div className="flex-1 rounded-2xl px-5 py-2.5 transition hover:bg-gray-50 md:rounded-full">
          <label className="block text-xs font-semibold text-gray-800">
            체크인
          </label>
          <input
            type="date"
            min={today}
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="w-full bg-transparent text-sm text-gray-600 outline-none"
          />
        </div>
        <div className="hidden h-8 w-px bg-gray-200 md:block" />

        {/* 체크아웃 */}
        <div className="flex-1 rounded-2xl px-5 py-2.5 transition hover:bg-gray-50 md:rounded-full">
          <label className="block text-xs font-semibold text-gray-800">
            체크아웃
          </label>
          <input
            type="date"
            min={checkIn || today}
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="w-full bg-transparent text-sm text-gray-600 outline-none"
          />
        </div>
        <div className="hidden h-8 w-px bg-gray-200 md:block" />

        {/* 인원 */}
        <div className="relative flex items-center gap-2 px-2">
          <button
            type="button"
            onClick={() => setOpenGuests((v) => !v)}
            className="flex-1 rounded-2xl px-3 py-2.5 text-left transition hover:bg-gray-50 md:rounded-full"
          >
            <span className="block text-xs font-semibold text-gray-800">
              여행자
            </span>
            <span className="text-sm text-gray-600">게스트 {guests}명</span>
          </button>

          <button
            type="submit"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-gelato-500 to-gelato-600 text-white shadow-soft transition hover:opacity-95"
            aria-label="검색"
          >
            <Search size={20} />
          </button>

          {openGuests && (
            <div className="absolute right-0 top-16 z-20 w-64 rounded-2xl border border-gray-200 bg-white p-4 shadow-card animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">게스트</p>
                  <p className="text-xs text-gray-500">인원을 선택하세요</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setGuests((g) => Math.max(1, g - 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:border-gray-800 disabled:opacity-40"
                    disabled={guests <= 1}
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-5 text-center text-sm font-medium">
                    {guests}
                  </span>
                  <button
                    type="button"
                    onClick={() => setGuests((g) => Math.min(16, g + 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:border-gray-800"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpenGuests(false)}
                className="mt-4 w-full rounded-xl bg-gray-900 py-2 text-sm font-semibold text-white"
              >
                완료
              </button>
            </div>
          )}
        </div>
      </div>
    </form>
  );
}
