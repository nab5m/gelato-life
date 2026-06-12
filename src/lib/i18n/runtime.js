// 브라우저 전용 locale 런타임 — React 밖(예: apiFetch)에서 현재 언어를 읽기 위한 모듈 싱글톤.
// LocaleContext 가 언어를 바꿀 때마다 setActiveLocale 로 동기화한다.
"use client";

import {
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  acceptLanguageFor,
  normalizeLocale,
} from "./config";

let activeLocale = DEFAULT_LOCALE;

// 최초 로드 시 localStorage 값을 한 번 반영(SSR 안전).
if (typeof window !== "undefined") {
  try {
    const saved = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    if (saved) activeLocale = normalizeLocale(saved);
  } catch {
    // localStorage 접근 불가(프라이빗 모드 등) — 기본값 유지
  }
}

export function setActiveLocale(code) {
  activeLocale = normalizeLocale(code);
}

export function getActiveLocale() {
  return activeLocale;
}

// 현재 언어에 대응하는 Accept-Language 태그
export function getActiveAcceptLanguage() {
  return acceptLanguageFor(activeLocale);
}
