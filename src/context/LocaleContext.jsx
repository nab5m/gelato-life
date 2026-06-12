"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  LOCALE_STORAGE_KEY,
  normalizeLocale,
} from "@/lib/i18n/config";
import { dictionary } from "@/lib/i18n/dictionary";
import { setActiveLocale } from "@/lib/i18n/runtime";

const LocaleContext = createContext(null);

// 원문(ko) 문자열 -> 현재 언어 번역. 사전에 없으면 원문 그대로.
// vars 가 있으면 "{name}" 형태 placeholder 를 치환한다.
function translate(locale, ko, vars) {
  let str = ko;
  if (locale !== DEFAULT_LOCALE) {
    const entry = dictionary[ko];
    if (entry && entry[locale]) str = entry[locale];
  }
  if (vars) {
    str = str.replace(/\{(\w+)\}/g, (m, k) =>
      vars[k] != null ? String(vars[k]) : m
    );
  }
  return str;
}

export function LocaleProvider({ children }) {
  const [locale, setLocaleState] = useState(DEFAULT_LOCALE);

  // 최초 진입 시 저장된 언어를 반영 (SSR 은 ko 로 렌더 → 하이드레이션 후 전환)
  useEffect(() => {
    let saved;
    try {
      saved = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    } catch {
      saved = null;
    }
    const next = normalizeLocale(saved);
    setLocaleState(next);
    setActiveLocale(next);
    document.documentElement.lang = next;
  }, []);

  const setLocale = useCallback((code) => {
    const next = normalizeLocale(code);
    setLocaleState(next);
    setActiveLocale(next);
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
    } catch {
      // 무시
    }
    // 서버에서도 읽을 수 있도록 쿠키에도 저장 (1년)
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    document.documentElement.lang = next;
  }, []);

  const t = useCallback((ko, vars) => translate(locale, ko, vars), [locale]);

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}

// 편의 훅: t 만 필요할 때
export function useT() {
  return useLocale().t;
}
