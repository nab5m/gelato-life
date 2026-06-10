// 파트너 방(building-unit-type) 응답 → 젤라또 라이프 listing 형태로 변환.
//
// 필드명은 파트너 오픈 API 문서(GET /open/v1/building-unit-type/{id},
// OpenBuildingUnitTypeResponse)를 기준으로 매핑했다.
// 문서상 다수의 nullable 필드가 "object" 로 표기돼 있어, 값이 {value:..}
// 형태로 감싸져 올 가능성까지 방어적으로 처리한다(val 헬퍼).
//
// ⚠️ 아래 [확인필요] 주석이 달린 항목은 실제 데이터/기획과 맞춰 함께 점검할 부분.

// nullable 필드가 원시값 그대로 올 수도, { value } 로 감싸져 올 수도 있어 방어.
function val(v) {
  if (v !== null && typeof v === "object" && !Array.isArray(v) && "value" in v) {
    return v.value;
  }
  return v;
}

function num(v, fallback = 0) {
  const n = Number(val(v));
  return Number.isFinite(n) ? n : fallback;
}

// images 원소 형태: { image: <url>, o: <정렬순서> }
// URL 은 .image 필드, 노출 순서는 o 오름차순(가장 낮은 o 가 대표 이미지).
function toImageUrl(it) {
  if (!it) return null;
  if (typeof it === "string") return it;
  return it.image || null;
}

// API 에서 받은 이미지 URL 만 o 오름차순으로 사용한다. 없으면 빈 배열.
function extractImages(room) {
  const arr = Array.isArray(room.images) ? room.images.slice() : [];
  arr.sort((a, b) => num(a?.o, 0) - num(b?.o, 0));
  return arr.map(toImageUrl).filter(Boolean);
}

// 주소 우선순위: city(시/군/구) → fullAddress → state/town 조합
// [확인필요] 카드에 노출할 주소 단위(구 단위 vs 전체 주소) 결정.
function extractCity(room) {
  return (
    val(room.city) ||
    val(room.fullAddress) ||
    [val(room.state), val(room.town)].filter(Boolean).join(", ") ||
    "위치 정보 없음"
  );
}

// type: ENTIRE → "전체", SHARED → "쉐어하우스" (문서상 object — enum 또는 { value } 가능)
function extractType(room) {
  const t = val(room.type);
  const code = typeof t === "string" ? t : t?.code || t?.name;
  if (code === "ENTIRE") return "전체";
  if (code === "SHARED") return "쉐어하우스";
  return "숙소";
}

// 편의시설은 options 만 사용한다. (hasXFee 는 요금 정책이라 utilityFees 로 분리)
// [확인필요] options 원소의 실제 형태(필드명) 확인.
function extractAmenities(room) {
  const out = [];
  if (num(room.kitchens) > 0) out.push("주방");
  const options = Array.isArray(room.options) ? room.options : [];
  for (const o of options) {
    const label = typeof o === "string" ? o : o?.name || o?.label;
    if (label) out.push(label);
  }
  return out.length ? out.slice(0, 12) : ["기본 편의시설"];
}

// hasXFee = "요금 포함 여부" (요금 정책). 편의시설과 분리해 상세페이지에서만 노출.
// true = 임대료에 포함, false = 별도 부과, null = 정보 없음
function extractUtilityFees(room) {
  return {
    electric: val(room.hasElectricFee),
    water: val(room.hasWaterFee),
    gas: val(room.hasGasFee),
    internet: val(room.hasInternetFee),
  };
}

// room.host(object) → UI host 형태. 하위 필드는 방어적으로 처리.
function extractHost(room) {
  const h = val(room.host) || {};
  const name = val(h.name);
  return {
    id: h.id != null ? `host-${h.id}` : `host-${room.id}`,
    name: name || "호스트 이름 데이터 없음",
    // 프로필 이미지 필드명이 불확실해 후보들을 순서대로 시도, 없으면 플레이스홀더.
    avatar:
      h.profileImage || h.image || h.avatar || `https://i.pravatar.cc/120?u=room-${room.id}`,
    superhost: false,
    since: "",
  };
}

export function mapRoom(room) {
  if (!room) return null;

  const images = extractImages(room);

  return {
    id: String(room.id),
    externalId: val(room.externalId) ?? null,
    title: val(room.name) || "이름 없는 숙소",
    city: extractCity(room),
    type: extractType(room),

    // [확인필요] 파트너 API 에 카테고리 개념이 없어 비워둠. 카테고리 필터 정책 결정 필요.
    cats: [],

    // [확인필요] 가격: 주당 임대료(rentFeePerWeek)를 사용 중인데 UI 는 "/박" 표기.
    //            주->박 환산 or 표기 변경 결정 필요. currency 도 함께 노출.
    price: num(room.rentFeePerWeek),
    currency: val(room.currency) || "KRW",

    // 후기/평점은 오픈 API 에 없음 → UI 에서 미노출.
    rating: 0,
    reviews: 0,

    beds: num(room.bedrooms),
    livingrooms: num(room.livingrooms),
    baths: num(room.bathrooms),
    kitchens: num(room.kitchens),
    guests: num(room.maxPeople, 1),
    areaExclusive: num(room.areaExclusive, 0), // 전용면적
    floor: val(room.floor) ?? null,

    lat: val(room.latitude) != null ? num(room.latitude) : null,
    lng: val(room.longitude) != null ? num(room.longitude) : null,

    images,
    thumb: images[0] ?? null,

    // 호스트 정보(room.host). name 이 없으면 데이터 없음으로 표시.
    host: extractHost(room),
    superhost: false,
    ownershipType: val(room.ownershipType) ?? null, // OWNER/SUBLEASE/OPERATOR

    amenities: extractAmenities(room),
    utilityFees: extractUtilityFees(room), // 상세페이지 요금 정책 섹션용
    reviewsList: [],

    description:
      [val(room.descIntro), val(room.descLocation), val(room.descCaution)]
        .filter(Boolean)
        .join("\n\n") || "소개 정보가 아직 등록되지 않았습니다.",

    // 요금 관련
    deposit: num(room.deposit, 0),
    cleaningFee: num(room.cleaningFee, 0),
    managementFeePerWeek: num(room.managementFeePerWeek, 0),
    // [확인필요] 서비스 수수료율은 자사 정책값(임시 12%).
    serviceFeeRate: 0.12,

    // 계약 견적/생성에 필요한 값
    hasAutoApproval: Boolean(val(room.hasAutoApproval)),
    discountRules: Array.isArray(room.discountRules) ? room.discountRules : [],
    depositRules: Array.isArray(room.depositRules) ? room.depositRules : [],
  };
}

export function mapRooms(rooms) {
  return (Array.isArray(rooms) ? rooms : []).map(mapRoom).filter(Boolean);
}
