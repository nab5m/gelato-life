"use client";

import { Suspense, useMemo, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ShieldCheck } from "lucide-react";
import Header from "@/components/Header";
import { krw, formatDate } from "@/lib/format";
import { useRoom } from "@/lib/roomsClient";
import { computeContractPrice } from "@/lib/partner/contractPricing";
import { createReservation } from "@/lib/contractsClient";
import { useAuth } from "@/context/AuthContext";
import { useT } from "@/context/LocaleContext";

function CheckoutInner() {
  const t = useT();
  const { id } = useParams();
  const sp = useSearchParams();
  const router = useRouter();
  const { user, ready } = useAuth();

  const { room: listing, loading: roomLoading, error: roomError } = useRoom(id);

  const checkIn = sp.get("checkIn") || "";
  const checkOut = sp.get("checkOut") || "";
  const guests = Number(sp.get("guests") || 1);

  const [guest, setGuest] = useState({ name: "", email: "", phone: "" });
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState(null);

  // 로그인 정보가 있으면 1회 프리필
  const prefilled = useMemo(() => {
    if (user) return { name: user.name || "", email: user.email || "", phone: "" };
    return null;
  }, [user]);
  const g = {
    name: guest.name || prefilled?.name || "",
    email: guest.email || prefilled?.email || "",
    phone: guest.phone,
  };

  // 주 단위 견적 (플라트라이프 공식)
  const price = useMemo(() => {
    if (!listing) return null;
    return computeContractPrice({
      rentFeePerWeek: listing.price,
      managementFeePerWeek: listing.managementFeePerWeek,
      cleaningFee: listing.cleaningFee,
      deposit: listing.deposit,
      discountRules: listing.discountRules,
      depositRules: listing.depositRules,
      startDate: checkIn,
      endDate: checkOut,
    });
  }, [listing, checkIn, checkOut]);

  const datesValid = Boolean(checkIn && checkOut && price?.days > 0);
  const canSubmit = datesValid && g.name && g.email && !submitting;

  const submit = async () => {
    setErr(null);
    if (!canSubmit) {
      setErr(t("입주자 이름·이메일과 기간을 확인해주세요."));
      return;
    }
    setSubmitting(true);
    try {
      const reservation = await createReservation({
        buildingUnitTypeId: listing.id,
        guestName: g.name,
        guestEmail: g.email,
        guestPhone: g.phone,
        startDate: checkIn,
        endDate: checkOut,
      });
      router.push(`/reservations/${reservation.id}?new=1`);
    } catch (e) {
      setErr(String(e.message || e));
      setSubmitting(false);
    }
  };

  if (roomLoading || !ready) {
    return (
      <div className="min-h-screen bg-white">
        <Header showSearchPill={false} />
        <p className="py-32 text-center text-gray-400">{t("불러오는 중…")}</p>
      </div>
    );
  }
  if (ready && !user) {
    return (
      <div className="min-h-screen bg-white">
        <Header showSearchPill={false} />
        <div className="py-32 text-center">
          <p className="text-4xl">🔑</p>
          <p className="mt-3 font-semibold text-gray-800">{t("예약하려면 로그인이 필요해요")}</p>
          <Link
            href={`/login`}
            className="btn-primary mt-5 inline-block"
          >
            {t("로그인하러 가기")}
          </Link>
        </div>
      </div>
    );
  }
  if (roomError || !listing) {
    return (
      <div className="min-h-screen bg-white">
        <Header showSearchPill={false} />
        <div className="py-32 text-center">
          <p className="text-4xl">🍨</p>
          <p className="mt-3 font-semibold text-gray-800">{t("방을 찾을 수 없어요")}</p>
          <Link href="/search" className="mt-4 inline-block text-sm font-semibold text-gelato-600 underline">
            {t("검색으로 돌아가기")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header showSearchPill={false} />
      <main className="mx-auto max-w-5xl px-4 py-8 md:px-6">
        <Link
          href={`/rooms/${listing.id}`}
          className="mb-2 inline-flex items-center gap-1 text-sm font-semibold text-gray-700 hover:underline"
        >
          <ChevronLeft size={16} /> {t("뒤로")}
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{t("예약 신청 확인")}</h1>

        <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-2">
          {/* 좌측: 입력 */}
          <div className="space-y-8">
            {/* 계약 정보 */}
            <section>
              <h2 className="mb-3 text-lg font-bold">{t("계약 정보")}</h2>
              <div className="space-y-2 rounded-2xl border border-gray-200 p-4 text-sm">
                <Row label={t("기간")}>
                  {datesValid
                    ? `${formatDate(checkIn)} – ${formatDate(checkOut)} (${price.days}일)`
                    : t("기간이 선택되지 않았습니다")}
                </Row>
                <Row label={t("인원")}>{t("게스트 {guests}명", { guests })}</Row>
              </div>
            </section>

            {/* 입주자 정보 */}
            <section>
              <h2 className="mb-3 text-lg font-bold">{t("입주자 정보")}</h2>
              <div className="space-y-3">
                <input
                  className="input"
                  placeholder={t("이름")}
                  value={g.name}
                  onChange={(e) => setGuest({ ...guest, name: e.target.value })}
                />
                <input
                  className="input"
                  type="email"
                  placeholder={t("이메일")}
                  value={g.email}
                  onChange={(e) => setGuest({ ...guest, email: e.target.value })}
                />
                <input
                  className="input"
                  placeholder={t("전화번호 (국가코드 포함, 예: +821012345678)")}
                  value={g.phone}
                  onChange={(e) => setGuest({ ...guest, phone: e.target.value })}
                />
              </div>
            </section>

            <div className="flex items-start gap-2 rounded-xl bg-gelato-50 p-4 text-xs text-gray-600">
              <ShieldCheck size={16} className="mt-0.5 shrink-0 text-mint-500" />
              {listing.hasAutoApproval
                ? t("이 방은 자동 승인됩니다. 신청 즉시 승인되며, 이후 결제 안내를 받게 됩니다.")
                : t("호스트 승인 후 결제 안내를 받게 됩니다. 지금은 결제가 발생하지 않습니다.")}
            </div>

            {err && (
              <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{err}</p>
            )}

            <button onClick={submit} disabled={!canSubmit} className="btn-primary w-full">
              {submitting ? t("신청 처리 중…") : t("예약 신청하기")}
            </button>
          </div>

          {/* 우측: 요약 카드 */}
          <div>
            <div className="sticky top-24 rounded-2xl border border-gray-200 p-6 shadow-soft">
              <div className="flex gap-4 border-b border-gray-200 pb-4">
                {listing.thumb ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={listing.thumb}
                    alt={listing.title}
                    className="h-20 w-24 rounded-xl object-cover"
                  />
                ) : (
                  <div className="flex h-20 w-24 items-center justify-center rounded-xl bg-gray-100 text-xs text-gray-400">
                    {t("이미지 없음")}
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-500">{listing.type}</p>
                  <p className="line-clamp-2 font-semibold">{listing.title}</p>
                  <p className="mt-1 text-xs text-gray-500">{listing.city}</p>
                </div>
              </div>

              <h3 className="mt-4 font-bold">{t("예상 요금 (견적)")}</h3>
              {datesValid ? (
                <>
                  <div className="mt-3 space-y-2 text-sm text-gray-700">
                    <Row label={t("임대료 ({days}일)", { days: price.days })}>{krw(price.totalRentFee)}</Row>
                    {price.discountedRentFee > 0 && (
                      <Row label={t("기간 할인")}>- {krw(price.discountedRentFee)}</Row>
                    )}
                    <Row label={t("관리비")}>{krw(price.totalManagementFee)}</Row>
                    <Row label={t("청소비")}>{krw(price.cleaningFee)}</Row>
                    <Row label={t("서비스 수수료")}>{krw(price.commissionFee)}</Row>
                    <Row label={t("보증금")}>{krw(price.deposit)}</Row>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-gray-200 pt-3 font-bold">
                    <span>{t("총 예상 금액 (KRW)")}</span>
                    <span>{krw(price.totalPrice)}</span>
                  </div>
                  <p className="mt-2 text-xs text-gray-400">
                    {t("최종 금액은 승인 후 플라트라이프 계약서 기준으로 확정됩니다.")}
                  </p>
                </>
              ) : (
                <p className="mt-3 text-sm text-gray-500">{t("기간을 선택하면 견적이 표시됩니다.")}</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium text-gray-900">{children}</span>
    </div>
  );
}

export default function CheckoutPage() {
  const t = useT();
  return (
    <Suspense fallback={<div className="p-10 text-center text-gray-400">{t("불러오는 중…")}</div>}>
      <CheckoutInner />
    </Suspense>
  );
}
