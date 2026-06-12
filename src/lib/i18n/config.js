// 다국어(i18n) 공통 설정 — 클라이언트/서버 양쪽에서 import 가능 (순수 모듈).

// 지원 언어. code 는 내부 식별자, acceptLanguage 는 API 에 보낼 BCP-47 태그.
export const LOCALES = [
  { code: "ko", label: "한국어", nativeLabel: "한국어", acceptLanguage: "ko-KR", flag: "🇰🇷" },
  { code: "en", label: "English", nativeLabel: "English", acceptLanguage: "en-US", flag: "🇺🇸" },
  { code: "zh", label: "중국어", nativeLabel: "中文", acceptLanguage: "zh-CN", flag: "🇨🇳" },
  { code: "vi", label: "베트남어", nativeLabel: "Tiếng Việt", acceptLanguage: "vi-VN", flag: "🇻🇳" },
  { code: "ja", label: "일본어", nativeLabel: "日本語", acceptLanguage: "ja-JP", flag: "🇯🇵" },
];

export const LOCALE_CODES = LOCALES.map((l) => l.code);

// 기본 언어(원문). 사전에 없는 문자열은 이 언어 그대로 노출된다.
export const DEFAULT_LOCALE = "ko";

// localStorage / cookie 키
export const LOCALE_STORAGE_KEY = "gelato.locale";
export const LOCALE_COOKIE = "gelato_locale";

// 유효한 locale 코드인지 검사 후 정규화. 아니면 기본값.
export function normalizeLocale(code) {
  return LOCALE_CODES.includes(code) ? code : DEFAULT_LOCALE;
}

// locale 코드 → Accept-Language 태그
export function acceptLanguageFor(code) {
  const found = LOCALES.find((l) => l.code === normalizeLocale(code));
  return found ? found.acceptLanguage : "ko-KR";
}
