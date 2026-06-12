// 파트너 오픈 API 호출 클라이언트 (서버 전용)
import { partnerConfig } from "./config";
import { getPartnerAcceptLanguage } from "./requestContext";

// 공통 요청 함수.
//  path:   "/open/v1/contract" 처럼 슬래시로 시작
//  params: query string 객체 (undefined/null/"" 은 제외)
//  method: GET(기본)/POST/PUT/DELETE
//  body:   JSON 직렬화할 객체 (GET 외)
export async function partnerRequest(path, { params = {}, method = "GET", body } = {}) {
  const { baseUrl, clientId, clientSecret } = partnerConfig;
  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const url = new URL(baseUrl + path);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, v);
  }

  // 자격증명 자체는 절대 로그에 남기지 않는다. client id 일부만 마스킹해 노출.
  const idHint = clientId ? `${clientId.slice(0, 4)}…(${clientId.length})` : "(empty)";
  const startedAt = Date.now();
  console.log(`[partner] → ${method} ${url.toString()} | auth=Basic id=${idHint}`);

  const headers = {
    Authorization: `Basic ${basic}`,
    Accept: "application/json",
    // 요청 컨텍스트(들어온 Accept-Language)를 그대로 파트너 API 로 전달. 없으면 ko-KR.
    "Accept-Language": getPartnerAcceptLanguage(),
  };
  const init = { method, headers, cache: "no-store" };
  if (body !== undefined && method !== "GET") {
    headers["Content-Type"] = "application/json";
    init.body = JSON.stringify(body);
    // 요청 본문 로깅(디버그용). 민감정보(입주자 연락처 등)가 포함될 수 있음.
    console.log(`[partner]   body: ${init.body}`);
  }

  let res;
  try {
    res = await fetch(url, init);
  } catch (e) {
    // DNS/연결/TLS 등 네트워크 단계 실패
    const ms = Date.now() - startedAt;
    console.error(
      `[partner] ✗ NETWORK ${method} ${url.toString()} (${ms}ms): ${e?.name || ""} ${e?.message || e}` +
        (e?.cause ? ` | cause: ${e.cause?.code || e.cause?.message || e.cause}` : "")
    );
    throw new Error(`파트너 API 연결 실패 ${path}: ${e?.message || e}`);
  }

  const ms = Date.now() - startedAt;
  const ct = res.headers.get("content-type") || "";

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error(
      `[partner] ✗ ${res.status} ${res.statusText} ${method} ${url.toString()} (${ms}ms) ` +
        `content-type=${ct}\n[partner]   body: ${text.slice(0, 1000)}`
    );
    const err = new Error(`파트너 API 호출 실패 ${path} (${res.status}): ${text.slice(0, 500)}`);
    err.status = res.status;
    throw err;
  }

  console.log(`[partner] ✓ ${res.status} ${method} ${url.toString()} (${ms}ms)`);

  // 204 No Content 또는 빈 본문
  if (res.status === 204) return null;
  if (!ct.includes("json")) {
    const text = await res.text().catch(() => "");
    if (!text) return null;
    console.error(
      `[partner] ✗ NON-JSON ${res.status} ${url.toString()} (${ms}ms) content-type=${ct}\n` +
        `[partner]   body: ${text.slice(0, 500)}`
    );
    throw new Error(
      `파트너 API 응답이 JSON 이 아님 ${path} (content-type=${ct}): ${text.slice(0, 300)}`
    );
  }
  return res.json();
}

// 기존 GET 헬퍼 (하위 호환). 방 조회 등에서 partnerFetch(path, params) 로 사용.
export async function partnerFetch(path, params = {}) {
  return partnerRequest(path, { params, method: "GET" });
}
