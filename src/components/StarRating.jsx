"use client";
import { Star } from "lucide-react";
import { useT } from "@/context/LocaleContext";

export default function StarRating({ rating, reviews, className = "" }) {
  const t = useT();
  return (
    <span className={`inline-flex items-center gap-1 text-sm ${className}`}>
      <Star size={14} className="fill-gelato-500 text-gelato-500" />
      <span className="font-semibold">{Number(rating).toFixed(2)}</span>
      {reviews != null && (
        <span className="text-gray-500">· {t("후기 {reviews}개", { reviews })}</span>
      )}
    </span>
  );
}
