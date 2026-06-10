// POST /api/webhooks/plott — 플라트라이프 변경 구독 수신
// 페이로드: { eventId, eventType, occurredAt, resourceType, resourceId, version }
// CONTRACT_UPDATED 수신 시 resourceId 로 재조회 → B(미러)→A(예약) 동기화.
import { NextResponse } from "next/server";
import { syncContractById } from "@/lib/contracts/service";

export const dynamic = "force-dynamic";

// 공유 시크릿 검증. (플라트라이프 서명 스킴이 확정되면 HMAC 검증으로 교체)
function verify(request) {
  const secret = process.env.PLOTT_WEBHOOK_SECRET;
  if (!secret) return true; // 미설정 시 검증 생략(개발 편의)
  const got =
    request.headers.get("x-webhook-secret") ||
    request.headers.get("x-plott-secret") ||
    "";
  return got === secret;
}

export async function POST(request) {
  if (!verify(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let event;
  try {
    event = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }

  const { eventType, resourceType, resourceId } = event || {};
  console.log(`[webhook] ${eventType} ${resourceType} #${resourceId}`);

  // 우리가 처리하는 이벤트만 동기화. 그 외는 200 으로 흘려보낸다(재전송 방지).
  if (resourceType === "CONTRACT" && resourceId != null) {
    try {
      await syncContractById(resourceId);
    } catch (e) {
      // 5xx 를 주면 플라트라이프가 재전송한다(idempotent upsert 라 안전).
      console.error(`[webhook] 동기화 실패 #${resourceId}: ${e?.message || e}`);
      return NextResponse.json({ error: "sync failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
