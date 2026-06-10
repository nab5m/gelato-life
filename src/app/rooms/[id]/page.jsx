"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Star, Share, Heart, Award, MapPin, Wifi, Car, Waves,
  Snowflake, Tv, Utensils, ChevronLeft,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BookingWidget from "@/components/BookingWidget";
import { useRoom } from "@/lib/roomsClient";

const AMENITY_ICON = {
  "무선 인터넷": Wifi,
  "무료 주차": Car,
  수영장: Waves,
  에어컨: Snowflake,
  TV: Tv,
  주방: Utensils,
};

export default function RoomPage() {
  const { id } = useParams();
  const { room: listing, loading, error } = useRoom(id);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <p className="py-32 text-center text-gray-400">숙소 정보를 불러오는 중…</p>
        <Footer />
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="py-32 text-center">
          <p className="text-4xl">🍨</p>
          <p className="mt-3 font-semibold text-gray-800">
            숙소를 찾을 수 없어요
          </p>
          <Link
            href="/search"
            className="mt-4 inline-block text-sm font-semibold text-gelato-600 underline"
          >
            검색으로 돌아가기
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const imgs = (listing.images || []).filter(Boolean);
  const hasImage = imgs.length > 0;

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="mx-auto max-w-6xl px-4 py-6 md:px-6">
        <Link
          href="/search"
          className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-gray-700 hover:underline"
        >
          <ChevronLeft size={16} /> 검색으로 돌아가기
        </Link>

        <div className="flex flex-wrap items-end justify-between gap-3">
          <h1 className="text-2xl font-bold text-gray-900">{listing.title}</h1>
          <div className="flex items-center gap-4 text-sm">
            <button className="flex items-center gap-1.5 font-semibold underline">
              <Share size={16} /> 공유하기
            </button>
            <button className="flex items-center gap-1.5 font-semibold underline">
              <Heart size={16} /> 저장
            </button>
          </div>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-700">
          {listing.superhost && (
            <span className="flex items-center gap-1 font-semibold">
              <Award size={14} className="text-gelato-500" /> 슈퍼호스트 ·
            </span>
          )}
          <span className="flex items-center gap-1 underline">
            <MapPin size={14} /> {listing.city}
          </span>
        </div>

        {/* 갤러리 */}
        {hasImage ? (
          <div className="mt-5 grid h-[300px] grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-2xl md:h-[440px]">
            <div className="col-span-4 row-span-2 md:col-span-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imgs[0]} alt="" className="h-full w-full object-cover" />
            </div>
            {imgs.slice(1, 5).map((src, i) => (
              <div key={i} className="hidden md:block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-5 flex h-[300px] items-center justify-center rounded-2xl bg-gray-100 text-gray-400 md:h-[440px]">
            등록된 이미지가 없습니다
          </div>
        )}

        {/* 본문 */}
        <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between border-b border-gray-200 pb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {listing.host.name}님이 호스팅하는 {listing.type}
                </h2>
                <p className="mt-1 text-gray-600">
                  최대 인원 {listing.guests}명 · 침실 {listing.beds}개 · 침대{" "}
                  {listing.beds}개 · 욕실 {listing.baths}개
                </p>
              </div>
              <img
                src={listing.host.avatar}
                alt={listing.host.name}
                className="h-14 w-14 rounded-full object-cover ring-2 ring-gelato-100"
              />
            </div>

            {/* 하이라이트 */}
            <div className="space-y-4 border-b border-gray-200 py-6">
              <Highlight
                icon={Award}
                title="슈퍼호스트"
                desc={`${listing.host.name}님은 평점이 높고 경험이 풍부한 호스트입니다.`}
              />
              <Highlight
                icon={MapPin}
                title="최적의 위치"
                desc="최근 게스트들이 위치에 별점 5점을 줬어요."
              />
              <Highlight
                icon={Star}
                title="무료 취소"
                desc="체크인 5일 전까지 무료로 취소할 수 있어요."
              />
            </div>

            <p className="whitespace-pre-line border-b border-gray-200 py-6 leading-relaxed text-gray-700">
              {listing.description}
            </p>

            {/* 편의시설 */}
            <div className="border-b border-gray-200 py-6">
              <h3 className="mb-4 text-lg font-bold">숙소 편의시설</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {listing.amenities.map((a) => {
                  const Icon = AMENITY_ICON[a] || Star;
                  return (
                    <div key={a} className="flex items-center gap-3 text-gray-700">
                      <Icon size={20} className="text-gray-500" />
                      {a}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 요금 정책 (전기/수도/가스/인터넷 포함 여부) */}
            <div className="py-6">
              <h3 className="mb-4 text-lg font-bold">요금 정책</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <FeeRow label="전기" included={listing.utilityFees?.electric} />
                <FeeRow label="수도" included={listing.utilityFees?.water} />
                <FeeRow label="가스" included={listing.utilityFees?.gas} />
                <FeeRow label="인터넷" included={listing.utilityFees?.internet} />
              </div>
            </div>
          </div>

          {/* 예약 위젯 */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <BookingWidget listing={listing} />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

// 요금 포함 여부: true=임대료 포함, false=별도 부과, null/undefined=정보 없음
function FeeRow({ label, included }) {
  const text =
    included === true ? "임대료 포함" : included === false ? "별도 부과" : "정보 없음";
  const tone =
    included === true
      ? "text-mint-600"
      : included === false
      ? "text-gray-700"
      : "text-gray-400";
  return (
    <div className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3">
      <span className="text-gray-700">{label}</span>
      <span className={`text-sm font-semibold ${tone}`}>{text}</span>
    </div>
  );
}

function Highlight({ icon: Icon, title, desc }) {
  return (
    <div className="flex items-start gap-4">
      <Icon size={24} className="mt-0.5 shrink-0 text-gray-700" />
      <div>
        <p className="font-semibold text-gray-900">{title}</p>
        <p className="text-sm text-gray-500">{desc}</p>
      </div>
    </div>
  );
}
