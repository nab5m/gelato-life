"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, Globe, MessageCircle, Search, User, Check } from "lucide-react";
import Logo from "./Logo";
import { useAuth } from "@/context/AuthContext";
import { useLocale } from "@/context/LocaleContext";
import { LOCALES } from "@/lib/i18n/config";

export default function Header({ showSearchPill = true }) {
  const { user, logout } = useAuth();
  const { locale, setLocale, t } = useLocale();
  const [open, setOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">
        <Link href="/" className="shrink-0">
          <Logo />
        </Link>

        {/* 가운데 검색 pill */}
        {showSearchPill && (
          <button
            onClick={() => router.push("/search")}
            className="hidden items-center gap-3 rounded-full border border-gray-200 bg-white py-2 pl-5 pr-2 text-sm font-medium shadow-soft transition hover:shadow-card md:flex"
          >
            <span>{t("어디든지")}</span>
            <span className="h-5 w-px bg-gray-200" />
            <span>{t("언제든")}</span>
            <span className="h-5 w-px bg-gray-200" />
            <span className="text-gray-500">{t("게스트 추가")}</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-gelato-500 to-gelato-600 text-white">
              <Search size={16} />
            </span>
          </button>
        )}

        {/* 우측 메뉴 */}
        <div className="flex items-center gap-2">
          <Link
            href="/host"
            className="hidden rounded-full px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 lg:block"
          >
            {t("숙소를 등록하세요")}
          </Link>
          <Link
            href="/messages"
            className="relative hidden rounded-full p-2.5 text-gray-700 transition hover:bg-gray-100 sm:block"
            aria-label={t("메시지")}
          >
            <MessageCircle size={20} />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-gelato-500" />
          </Link>

          {/* 언어 선택 (지구본) */}
          <div className="relative hidden sm:block">
            <button
              onClick={() => setLangOpen((v) => !v)}
              className="rounded-full p-2.5 text-gray-700 transition hover:bg-gray-100"
              aria-label={t("언어 선택")}
            >
              <Globe size={20} />
            </button>

            {langOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setLangOpen(false)} />
                <div className="absolute right-0 top-12 z-40 w-44 overflow-hidden rounded-2xl border border-gray-100 bg-white py-2 shadow-card animate-fade-in">
                  <p className="px-4 py-1.5 text-xs font-semibold text-gray-400">{t("언어 선택")}</p>
                  {LOCALES.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLocale(l.code);
                        setLangOpen(false);
                      }}
                      className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <span className="flex items-center gap-2">
                        <span>{l.flag}</span>
                        <span>{l.nativeLabel}</span>
                      </span>
                      {locale === l.code && <Check size={16} className="text-gelato-500" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setOpen((v) => !v)}
              className="flex items-center gap-2 rounded-full border border-gray-200 py-1.5 pl-3 pr-1.5 transition hover:shadow-soft"
            >
              <Menu size={18} className="text-gray-700" />
              {user ? (
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gelato-500 text-xs font-bold text-white">
                  {(user.name || user.email || "U").trim().charAt(0).toUpperCase()}
                </span>
              ) : (
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-500 text-white">
                  <User size={16} />
                </span>
              )}
            </button>

            {open && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setOpen(false)}
                />
                <div className="absolute right-0 top-12 z-40 w-60 overflow-hidden rounded-2xl border border-gray-100 bg-white py-2 shadow-card animate-fade-in">
                  {user ? (
                    <>
                      <div className="px-4 py-2">
                        <p className="text-sm font-semibold">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      <div className="my-1 h-px bg-gray-100" />
                      <MenuLink href="/reservations" label={t("여행 / 예약 내역")} onClick={() => setOpen(false)} />
                      <MenuLink href="/messages" label={t("메시지")} onClick={() => setOpen(false)} />
                      <MenuLink href="/wishlist" label={t("위시리스트")} onClick={() => setOpen(false)} />
                      <div className="my-1 h-px bg-gray-100" />
                      <MenuLink href="/host" label={t("숙소를 등록하세요")} onClick={() => setOpen(false)} />
                      <button
                        onClick={() => {
                          logout();
                          setOpen(false);
                          router.push("/");
                        }}
                        className="block w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"
                      >
                        {t("로그아웃")}
                      </button>
                    </>
                  ) : (
                    <>
                      <MenuLink href="/signup" label={t("회원가입")} bold onClick={() => setOpen(false)} />
                      <MenuLink href="/login" label={t("로그인")} onClick={() => setOpen(false)} />
                      <div className="my-1 h-px bg-gray-100" />
                      <MenuLink href="/host" label={t("숙소를 등록하세요")} onClick={() => setOpen(false)} />
                      <MenuLink href="/help" label={t("고객센터")} onClick={() => setOpen(false)} />
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function MenuLink({ href, label, bold, onClick }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 ${
        bold ? "font-semibold" : ""
      }`}
    >
      {label}
    </Link>
  );
}
