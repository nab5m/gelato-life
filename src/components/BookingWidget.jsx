"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, MessageCircle } from "lucide-react";
import { krw } from "@/lib/format";
import { computeContractPrice } from "@/lib/partner/contractPricing";
import { useBlockedDates } from "@/lib/roomsClient";
import { openChat } from "@/lib/chatClient";
import { useAuth } from "@/context/AuthContext";
import { useT } from "@/context/LocaleContext";
import DateRangePicker from "@/components/DateRangePicker";

export default function BookingWidget({ listing }) {
  const t = useT();
  const router = useRouter();
  const { user } = useAuth();
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);
  const [contacting, setContacting] = useState(false);
  const { blockedDates } = useBlockedDates(listing.id);

  // 실제 계약 금액과 동일한 플라트라이프 공식으로 견적 계산
  const price = useMemo(
    () =>
      computeContractPrice({
        rentFeePerWeek: listing.price,
        managementFeePerWeek: listing.managementFeePerWeek,
        cleaningFee: listing.cleaningFee,
        deposit: listing.deposit,
        discountRules: listing.discountRules,
        depositRules: listing.depositRules,
        startDate: checkIn,
        endDate: checkOut,
      }),
    [listing, checkIn, checkOut]
  );
  const valid = price.days > 0;

  const reserve = () => {
    const params = new URLSearchParams({
      checkIn,
      checkOut,
      guests: String(guests),
    });
    router.push(`/checkout/${listing.id}?${params.toString()}`);
  };

  // 호스트에게 문의: 채팅방을 생성/확보한 뒤 메시지 화면으로 이동.
  const contactHost = async () => {
    if (!user) {
      const next = encodeURIComponent(`/rooms/${listing.id}`);
      router.push(`/login?next=${next}`);
      return;
    }
    setContacting(true);
    try {
      const chatId = await openChat(listing.id);
      router.push(`/messages?chat=${chatId}`);
    } catch (e) {
      alert(e?.message || t("문의를 시작하지 못했어요."));
    } finally {
      setContacting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-card">
      <div className="flex items-end justify-between">
        <p>
          <span className="text-2xl font-bold">{krw(listing.price)}</span>
          <span className="text-gray-600"> {t("/ 주")}</span>
        </p>
      </div>

      <div className="mt-4 space-y-2">
        <DateRangePicker
          checkIn={checkIn}
          checkOut={checkOut}
          blockedDates={blockedDates}
          minDays={7}
          onChange={(ci, co) => {
            setCheckIn(ci);
            setCheckOut(co);
          }}
        />
        <div className="flex items-center justify-between rounded-xl border border-gray-300 p-3">
          <div>
            <span className="block text-[11px] font-bold uppercase text-gray-700">
              {t("인원")}
            </span>
            <span className="text-sm text-gray-700">{t("게스트 {guests}명", { guests })}</span>
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
        {valid ? t("예약하기") : t("날짜를 선택하세요")}
      </button>

      <button
        onClick={contactHost}
        disabled={contacting}
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-gray-300 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-gray-800 disabled:opacity-50"
      >
        <MessageCircle size={16} />
        {contacting ? t("문의 여는 중…") : t("호스트에게 문의하기")}
      </button>

      {valid && (
        <>
          <p className="mt-3 text-center text-sm text-gray-500">
            {t("아직 예약 확정 전이에요")}
          </p>
          <div className="mt-4 space-y-3 text-sm text-gray-700">
            <Row label={t("임대료 ({days}일)", { days: price.days })} value={krw(price.totalRentFee)} />
            {price.discountedRentFee > 0 && (
              <Row label={t("기간 할인")} value={`- ${krw(price.discountedRentFee)}`} />
            )}
            <Row label={t("관리비")} value={krw(price.totalManagementFee)} />
            <Row label={t("청소비")} value={krw(price.cleaningFee)} />
            <Row label={t("서비스 수수료")} value={krw(price.commissionFee)} />
            <Row label={t("보증금")} value={krw(price.deposit)} />
            <div className="border-t border-gray-200 pt-3">
              <Row label={t("총 예상 금액")} value={krw(price.totalPrice)} bold />
            </div>
          </div>
          <p className="mt-2 text-center text-xs text-gray-400">
            {t("최종 금액은 계약 시 플라트라이프 기준으로 확정됩니다.")}
          </p>
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
