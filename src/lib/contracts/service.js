// 계약 오케스트레이션 (서버 전용)
//  - 생성/수정/취소: 우리 → 파트너 outbound 호출 후 B(미러)→A(예약) 적재
//  - 동기화: webhook/재조회 시 파트너 계약을 B→A 로 반영
import crypto from "crypto";
import { prisma } from "@/lib/db";
import {
  createContract,
  updateContract,
  getContract,
} from "@/lib/partner/contracts";
import { toMirror, toReservation } from "@/lib/partner/mapContract";

// yyyy-MM-dd → UTC 자정 ISO. 이미 ISO 면 그대로.
function toUtcIso(d) {
  if (!d) return undefined;
  if (typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d)) {
    return new Date(`${d}T00:00:00Z`).toISOString();
  }
  const dt = new Date(d);
  return isNaN(dt) ? undefined : dt.toISOString();
}

// 파트너 계약 응답을 B→A 로 upsert. 트랜잭션으로 일관성 보장. 예약(A) 반환.
// opts.userId 가 있으면 최초 생성 시 예약 소유자로 연결한다(webhook 동기화 시엔 미지정).
export async function persistContract(contract, { userId } = {}) {
  const mirror = toMirror(contract);
  const resv = toReservation(contract);

  return prisma.$transaction(async (tx) => {
    await tx.plottLifeContract.upsert({
      where: { plottContractId: mirror.plottContractId },
      create: mirror,
      update: { ...mirror, createdAt: undefined },
    });
    return tx.reservation.upsert({
      where: { plottContractId: resv.plottContractId },
      // 계약 시점 스냅샷(방/입주자/금액)은 생성 때 박고, 갱신 시엔 상태 중심으로 반영
      create: { ...resv, userId: userId ?? null },
      update: {
        status: resv.status,
        startAt: resv.startAt,
        endAt: resv.endAt,
        guestName: resv.guestName,
        guestEmail: resv.guestEmail,
        guestPhone: resv.guestPhone,
        totalPrice: resv.totalPrice,
      },
    });
  });
}

// 예약 생성: 방 타입으로 계약 신청. autoApproval 이면 APPROVED, 아니면 REQUESTED.
//  input: { buildingUnitTypeId, buildingUnitTypeExternalId, autoApproval,
//           guestName, guestEmail, guestPhone, startDate, endDate, memo }
export async function createReservation(input, { userId } = {}) {
  const externalId = `gl_${crypto.randomUUID()}`;
  const contractStatus = input.autoApproval ? "APPROVED" : "REQUESTED";

  // buildingUnitTypeId 는 정수로 보내야 한다 (문자열이면 바인딩 실패 → 필수항목 null 오류)
  const typeId =
    input.buildingUnitTypeId != null && input.buildingUnitTypeId !== ""
      ? Number(input.buildingUnitTypeId)
      : undefined;

  // 전화번호 분리: "+821012345678" → code "+82", number "1012345678"
  const phone = input.guestPhone || "";
  const m = phone.match(/^(\+\d{1,3})(\d+)$/);
  const phoneCode = m ? m[1] : undefined;
  const phoneNumber = m ? m[2] : phone || undefined;

  const body = {
    externalId,
    buildingUnitTypeId: Number.isFinite(typeId) ? typeId : undefined,
    buildingUnitTypeExternalId: input.buildingUnitTypeExternalId ?? undefined,
    guestName: input.guestName || undefined,
    guestFirstName: input.guestName || undefined,
    guestLastName: input.guestName || undefined,
    guestEmail: input.guestEmail || undefined,
    guestFullPhoneNumber: phone || undefined,
    guestPhoneCode: phoneCode,
    guestPhoneNumber: phoneNumber,
    startAt: toUtcIso(input.startDate),
    endAt: toUtcIso(input.endDate),
    memo: input.memo || undefined,
    contractStatus,
  };

  const contract = await createContract(body);
  return persistContract(contract, { userId });
}

// 계약 응답 → OpenContractUpdateRequest 바디 재구성 (전체 덮어쓰기) + overrides
// PUT 은 buildingUnitExternalId 가 필수다. 현재 계약값을 그대로 실어 보낸다.
function buildUpdateBody(c, overrides = {}) {
  return {
    externalId: c.externalId,
    buildingUnitExternalId: c.buildingUnitExternalId ?? undefined,
    guestEmail: c.guestEmail ?? undefined,
    guestName: c.guestName ?? undefined,
    guestFirstName: c.guestFirstName ?? undefined,
    guestLastName: c.guestLastName ?? undefined,
    guestFullPhoneNumber: c.guestFullPhoneNumber ?? undefined,
    guestPhoneCode: c.guestPhoneCode ?? undefined,
    guestPhoneNumber: c.guestPhoneNumber ?? undefined,
    startAt: c.startAt,
    endAt: c.endAt,
    memo: c.memo ?? undefined,
    contractStatus: c.contractStatus,
    ...overrides,
  };
}

// 예약 수정/취소: 계약을 실시간 재조회해 현재값(버그유닛 외부ID 포함)으로 PUT 본문 구성.
export async function updateReservation(reservationId, overrides) {
  const resv = await prisma.reservation.findUnique({ where: { id: reservationId } });
  if (!resv) {
    const e = new Error("예약을 찾을 수 없습니다.");
    e.status = 404;
    throw e;
  }
  // 미러 raw 는 stale 할 수 있어, PUT 직전 현재 계약을 재조회한다.
  const current = await getContract(resv.plottContractId.toString());
  if (!current?.buildingUnitExternalId) {
    console.warn(
      `[contract] PUT 경고 #${resv.plottContractId}: buildingUnitExternalId 가 비어 있습니다. ` +
        `PUT 필수값이라 실패할 수 있습니다.`
    );
  }
  const body = buildUpdateBody(current, overrides);
  const contract = await updateContract(resv.plottContractId.toString(), body);
  return persistContract(contract);
}

// 예약 취소 (contractStatus = CANCELED)
export function cancelReservation(reservationId) {
  return updateReservation(reservationId, { contractStatus: "CANCELED" });
}

// 결제 완료 처리 (contractStatus = COMPLETED)
export function completeReservation(reservationId) {
  return updateReservation(reservationId, { contractStatus: "COMPLETED" });
}

// 파트너 계약 id 로 재조회 후 B→A 동기화 (webhook 용)
export async function syncContractById(plottContractId) {
  const contract = await getContract(plottContractId);
  return persistContract(contract);
}

// BigInt/Date 를 JSON 안전하게 직렬화한 예약 객체
export function serializeReservation(r) {
  if (!r) return null;
  return {
    ...r,
    plottContractId: r.plottContractId?.toString() ?? null,
    buildingUnitTypeId: r.buildingUnitTypeId?.toString() ?? null,
    startAt: r.startAt instanceof Date ? r.startAt.toISOString() : r.startAt,
    endAt: r.endAt instanceof Date ? r.endAt.toISOString() : r.endAt,
    createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt,
    updatedAt: r.updatedAt instanceof Date ? r.updatedAt.toISOString() : r.updatedAt,
    mirror: undefined,
  };
}
