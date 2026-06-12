// 방(building-unit-type) 조회 함수 (서버 전용, 직접 호출 방식 — DB 저장 없음)
import { partnerFetch } from "./client";
import { mapRoom, mapRooms } from "./mapRoom";

export const DEFAULT_PAGE_SIZE = 20;

// 유효한 정렬 값 (그 외 값은 무시하고 기본 정렬 사용)
export const SORTS = [
  "CREATED_AT_DESC",
  "PRICE_ASC",
  "PRICE_DESC",
  "POPULAR",
  "UNIVERSITY_DIST_ASC",
];

// 방 목록을 한 페이지만 조회해 매핑된 listing 배열 + 페이지 정보를 반환.
// 검색/정렬/기간/가격/지도영역 필터는 파트너 API 가 서버 사이드로 처리한다.
export async function listRoomsPage({
  page = 0,
  size = DEFAULT_PAGE_SIZE,
  operationStatus,
  sort,
  searchText,
  startDate,
  endDate,
  minRentFeePerWeek,
  maxRentFeePerWeek,
  minLatitude,
  minLongitude,
  maxLatitude,
  maxLongitude,
} = {}) {
  const data = await partnerFetch("/open/v1/building-unit-type", {
    page,
    size,
    operationStatus,
    sort: SORTS.includes(sort) ? sort : undefined,
    searchText,
    startDate,
    endDate,
    minRentFeePerWeek,
    maxRentFeePerWeek,
    minLatitude,
    minLongitude,
    maxLatitude,
    maxLongitude,
  });
  const items = Array.isArray(data?.items) ? data.items : [];
  const totalPages = Number(data?.totalPages) || 1;
  const totalItems = Number(data?.totalItems) || items.length;
  const curPage = Number.isFinite(Number(data?.page)) ? Number(data.page) : page;

  return {
    items: mapRooms(items),
    page: curPage,
    totalPages,
    totalItems,
    hasMore: curPage + 1 < totalPages,
  };
}

// 내부 식별자(id)로 방 상세 조회. 없으면 null.
export async function getRoom(id) {
  try {
    const data = await partnerFetch(`/open/v1/building-unit-type/${id}`);
    return mapRoom(data);
  } catch (e) {
    // 404 등은 not found 로 처리
    return null;
  }
}

// 방의 예약 마감일(blocked date) 목록을 조회한다.
// 운영 중인 모든 호실이 예약으로 점유돼 더 이상 예약할 수 없는 날짜 목록(yyyy-MM-dd[]).
// 식별 실패(404 등)는 마감일 없음(빈 배열)으로 처리한다.
export async function getBlockedDates({ id, startDate, endDate }) {
  try {
    const data = await partnerFetch("/open/v1/building-unit-type/blocked-date", {
      id,
      startDate,
      endDate,
    });
    const list = Array.isArray(data?.blockedDates) ? data.blockedDates : [];
    // 응답 요소가 문자열이거나 { date } 형태일 수 있어 방어적으로 정규화한다.
    return list
      .map((d) => (typeof d === "string" ? d : d?.date || d?.blockedDate))
      .filter(Boolean);
  } catch (e) {
    return [];
  }
}
