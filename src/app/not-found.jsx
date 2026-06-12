"use client";

import { useT } from "@/context/LocaleContext";
import Link from "next/link";

export default function NotFound() {
  const t = useT();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gelato-50 via-cream to-mint-50 px-4 text-center">
      <span className="text-7xl">🍦</span>
      <h1 className="mt-6 text-3xl font-bold text-gray-900">
        {t("앗, 페이지가 녹아버렸어요")}
      </h1>
      <p className="mt-2 text-gray-500">
        {t("찾으시는 페이지를 찾을 수 없습니다.")}
      </p>
      <Link href="/" className="btn-primary mt-6">
        {t("홈으로 돌아가기")}
      </Link>
    </div>
  );
}
