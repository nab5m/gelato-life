// 플라트라이프 계약(OpenContractDetailResponse) → 미러(B)/예약(A) 변환 + 상태 매핑.

// nullable 필드가 { value } 로 감싸져 올 가능성까지 방어.
function val(v) {
  if (v !== null && typeof v === "object" && !Array.isArray(v) && "value" in v) return v.value;
  return v;
}
const int = (v) => {
  const n = Number(val(v));
  return Number.isFinite(n) ? Math.round(n) : 0;
};
const bigintOrNull = (v) => {
  const x = val(v);
  if (x === null || x === undefined || x === "") return null;
  try {
    return BigInt(x);
  } catch {
    return null;
  }
};
const dateOrNull = (v) => {
  const x = val(v);
  if (!x) return null;
  const d = new Date(x);
  return isNaN(d) ? null : d;
};

// 계약 상태 코드 → 화면 표시 라벨 + 톤(색상). 미지정 코드는 코드 그대로 노출.
export const CONTRACT_STATUS_LABELS = {
  REQUESTED: { label: "승인 대기", tone: "amber" },
  APPROVED: { label: "승인됨", tone: "mint" },
  REJECTED: { label: "거절됨", tone: "gray" },
  PAYMENT_PENDING: { label: "결제 대기", tone: "amber" },
  PENDING_PAYMENT: { label: "결제 대기", tone: "amber" },
  PAID: { label: "결제 완료", tone: "mint" },
  COMPLETED: { label: "이용 확정", tone: "mint" },
  CANCELLED: { label: "취소됨", tone: "gray" },
  CANCELED: { label: "취소됨", tone: "gray" },
  TERMINATED: { label: "종료됨", tone: "gray" },
  REFUNDED: { label: "환불 완료", tone: "gray" },
  EXPIRED: { label: "만료됨", tone: "gray" },
};

export function statusLabel(code) {
  return CONTRACT_STATUS_LABELS[code]?.label || code || "알 수 없음";
}
export function statusTone(code) {
  return CONTRACT_STATUS_LABELS[code]?.tone || "gray";
}

// 입주자 표시 이름/전화 구성
function guestName(c) {
  return (
    val(c.guestName) ||
    [val(c.guestFirstName), val(c.guestLastName)].filter(Boolean).join(" ") ||
    null
  );
}
function guestPhone(c) {
  return val(c.guestFullPhoneNumber) || val(c.guestPhoneNumber) || null;
}

// 이미지 식별자 → CDN URL. 이미 전체 URL 이면 그대로 사용.
const CDN_BASE = (process.env.PARTNER_CDN_BASE_URL || "https://cdn.dev.plott.co.kr").replace(/\/$/, "");
function imageUrl(idOrUrl) {
  if (!idOrUrl) return null;
  if (typeof idOrUrl === "string" && /^https?:\/\//.test(idOrUrl)) return idOrUrl;
  return `${CDN_BASE}/images/${idOrUrl}.webp?w=1600`;
}

// 방 스냅샷(표시용) — 계약 상세의 buildingUnitType(object).
// 응답 형태: { name, address, mainImage(이미지 id), latitude, longitude, ... }
function roomSnapshot(c) {
  const t = val(c.buildingUnitType) || {};
  const lat = Number(val(t.latitude));
  const lng = Number(val(t.longitude));
  return {
    roomTitle: val(t.name) || null,
    roomCity: val(t.address) || val(t.city) || val(t.fullAddress) || null,
    // mainImage 우선, 없으면 images 배열의 첫 항목
    roomThumb:
      imageUrl(val(t.mainImage)) ||
      imageUrl(
        Array.isArray(t.images) && t.images.length
          ? typeof t.images[0] === "string"
            ? t.images[0]
            : t.images[0]?.image
          : null
      ),
    roomLat: Number.isFinite(lat) ? lat : null,
    roomLng: Number.isFinite(lng) ? lng : null,
  };
}

// B(plottLifeContract) 미러 레코드
export function toMirror(c) {
  return {
    plottContractId: BigInt(c.id),
    externalId: val(c.externalId) ?? null,
    no: val(c.no) ?? null,
    status: val(c.contractStatus) || "UNKNOWN",
    raw: c,
    plottUpdatedAt: dateOrNull(c.updatedAt),
  };
}

// A(reservation) 도메인 레코드 (status 는 파트너 코드 그대로 저장)
export function toReservation(c) {
  const snap = roomSnapshot(c);
  return {
    plottContractId: BigInt(c.id),
    externalId: String(val(c.externalId) ?? c.id),
    buildingUnitTypeId: bigintOrNull(c.buildingUnitTypeId),
    buildingUnitTypeExternalId: val(c.buildingUnitTypeExternalId) ?? null,
    roomTitle: snap.roomTitle,
    roomCity: snap.roomCity,
    roomThumb: snap.roomThumb,
    roomLat: snap.roomLat,
    roomLng: snap.roomLng,
    guestName: guestName(c),
    guestEmail: val(c.guestEmail) ?? null,
    guestPhone: guestPhone(c),
    startAt: dateOrNull(c.startAt) || new Date(0),
    endAt: dateOrNull(c.endAt) || new Date(0),
    currency: val(c.currency) || "KRW",
    deposit: int(c.deposit),
    rentFeePerWeek: int(c.rentFeePerWeek),
    totalRentFee: int(c.totalRentFee),
    discountedRentFee: int(c.discountedRentFee),
    cleaningFee: int(c.cleaningFee),
    managementFeePerWeek: int(c.managementFeePerWeek),
    totalManagementFee: int(c.totalManagementFee),
    totalPrice: int(c.totalPrice),
    status: val(c.contractStatus) || "UNKNOWN",
  };
}
