// 클라이언트에서 내부 /api 라우트를 호출할 때 사용하는 fetch 래퍼.
// 현재 선택된 언어에 맞춰 Accept-Language 헤더를 자동으로 붙인다.
// 라우트 핸들러는 이 헤더를 읽어 파트너 API 로 그대로 전달한다(src/lib/partner/requestContext.js).
"use client";

import { getActiveAcceptLanguage } from "./i18n/runtime";

export function apiFetch(input, init = {}) {
  const headers = new Headers(init.headers || {});
  if (!headers.has("Accept-Language")) {
    headers.set("Accept-Language", getActiveAcceptLanguage());
  }
  return fetch(input, { ...init, headers });
}
