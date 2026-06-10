"use client";

import Link from "next/link";
import { useState } from "react";
import { Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { krw } from "@/lib/format";

export default function ListingCard({ listing }) {
  const [liked, setLiked] = useState(false);
  const [idx, setIdx] = useState(0);
  const images = (listing.images || []).filter(Boolean);
  const hasImage = images.length > 0;

  const go = (e, dir) => {
    e.preventDefault();
    e.stopPropagation();
    setIdx((i) => (i + dir + images.length) % images.length);
  };

  return (
    <Link href={`/rooms/${listing.id}`} className="group block">
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-gray-100">
        {hasImage ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={images[idx]}
            alt={listing.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-gray-400">
            이미지 없음
          </div>
        )}

        {listing.superhost && (
          <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-gray-800 shadow-soft">
            슈퍼호스트
          </span>
        )}

        <button
          onClick={(e) => {
            e.preventDefault();
            setLiked((v) => !v);
          }}
          className="absolute right-3 top-3 transition active:scale-90"
          aria-label="위시리스트"
        >
          <Heart
            size={24}
            className={
              liked
                ? "fill-gelato-500 text-gelato-500"
                : "fill-black/30 text-white"
            }
          />
        </button>

        {images.length > 1 && (
          <>
            <button
              onClick={(e) => go(e, -1)}
              className="absolute left-2 top-1/2 hidden h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-soft transition hover:scale-105 group-hover:flex"
              aria-label="이전 사진"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={(e) => go(e, 1)}
              className="absolute right-2 top-1/2 hidden h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-soft transition hover:scale-105 group-hover:flex"
              aria-label="다음 사진"
            >
              <ChevronRight size={16} />
            </button>
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
              {images.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 w-1.5 rounded-full transition ${
                    i === idx ? "bg-white" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="mt-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 font-semibold text-gray-900">
            {listing.city}
          </h3>
        </div>
        <p className="line-clamp-1 text-sm text-gray-500">{listing.title}</p>
        <p className="text-sm text-gray-500">
          게스트 {listing.guests}명 · 침대 {listing.beds}개
        </p>
        <p className="mt-1 text-gray-900">
          <span className="font-bold">{krw(listing.price)}</span>
          <span className="text-gray-600"> / 주</span>
        </p>
      </div>
    </Link>
  );
}
