// 플라트라이프 파트너 오픈 API 연동 설정 (서버 전용)
// 실제 값은 .env.local 에 넣는다. (.env.local 은 gitignore 됨)
//   PARTNER_API_BASE_URL       예) https://api.plott.life
//   PARTNER_OAUTH_CLIENT_ID
//   PARTNER_OAUTH_CLIENT_SECRET
// 인증은 client id/secret 으로 매 요청 Basic 인증한다. (별도 토큰 발급 없음)

export const partnerConfig = {
  baseUrl: (process.env.PARTNER_API_BASE_URL || "").replace(/\/$/, ""),
  clientId: process.env.PARTNER_OAUTH_CLIENT_ID || "",
  clientSecret: process.env.PARTNER_OAUTH_CLIENT_SECRET || "",
};

// 연동에 필요한 값이 모두 설정되어 있으면 true.
// false 면 화면은 mock 데이터로 폴백한다.
export function isPartnerConfigured() {
  const c = partnerConfig;
  return Boolean(c.baseUrl && c.clientId && c.clientSecret);
}
