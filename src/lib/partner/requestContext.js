// 요청 단위로 Accept-Language 를 파트너 API 까지 전달하기 위한 컨텍스트(서버 전용).
// AsyncLocalStorage 를 써서 라우트 핸들러 → 파트너 호출 사이의 함수 시그니처를 바꾸지 않고
// 언어 정보를 흘려보낸다.
import { AsyncLocalStorage } from "node:async_hooks";

const store = new AsyncLocalStorage();

const DEFAULT_ACCEPT_LANGUAGE = "ko-KR";

// 현재 요청의 Accept-Language. 컨텍스트 밖이면 기본값(ko-KR).
export function getPartnerAcceptLanguage() {
  return store.getStore()?.acceptLanguage || DEFAULT_ACCEPT_LANGUAGE;
}

// 라우트 핸들러를 감싸 들어온 Accept-Language 를 컨텍스트에 실어준다.
//   export const GET = withLocale(async (request, ctx) => { ... });
export function withLocale(handler) {
  return (request, ctx) => {
    const acceptLanguage = request?.headers?.get?.("accept-language") || DEFAULT_ACCEPT_LANGUAGE;
    return store.run({ acceptLanguage }, () => handler(request, ctx));
  };
}
