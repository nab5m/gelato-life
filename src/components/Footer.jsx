"use client";

import Logo from "./Logo";
import { Globe, Instagram, Twitter, Facebook } from "lucide-react";
import { useT } from "@/context/LocaleContext";

const COLS = [
  {
    title: "지원",
    links: ["고객 센터", "안전 정보", "취소 옵션", "이웃 민원 신고", "도움말"],
  },
  {
    title: "호스팅",
    links: ["숙소 등록하기", "호스트 보호", "호스팅 자료", "커뮤니티 포럼", "책임감 있는 호스팅"],
  },
  {
    title: "젤라또 라이프",
    links: ["새로운 소식", "채용 정보", "투자자 정보", "지속가능성", "선물 카드"],
  },
];

export default function Footer() {
  const t = useT();
  return (
    <footer className="mt-16 border-t border-gray-200 bg-cream">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Logo />
            <p className="mt-3 max-w-xs text-sm text-gray-600">
              {t("어디서든 달콤한 머무름. 젤라또 라이프와 함께 특별한 여행을 시작하세요.")}
            </p>
          </div>
          {COLS.map((c) => (
            <div key={c.title}>
              <h4 className="mb-3 text-sm font-bold text-gray-900">{t(c.title)}</h4>
              <ul className="space-y-2">
                {c.links.map((l) => (
                  <li key={l}>
                    <a
                      href="#"
                      className="text-sm text-gray-600 transition hover:text-gelato-600 hover:underline"
                    >
                      {t(l)}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-gray-200 pt-6 text-sm text-gray-600 md:flex-row">
          <p>© 2026 Gelato Life, Inc. · {t("개인정보 처리방침")} · {t("이용약관")}</p>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-1 font-semibold text-gray-800">
              <Globe size={16} /> {t("한국어 (KR)")}
            </button>
            <span className="font-semibold">₩ KRW</span>
            <div className="flex items-center gap-3 text-gray-700">
              <Facebook size={18} />
              <Twitter size={18} />
              <Instagram size={18} />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
