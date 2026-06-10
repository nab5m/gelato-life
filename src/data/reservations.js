import { listings } from "./listings";

// 예약 목업 (localStorage와 병합되어 사용)
export const seedReservations = [
  {
    id: "RSV-20250312",
    listingId: "gl-1",
    checkIn: "2025-07-12",
    checkOut: "2025-07-15",
    guests: 4,
    total: 1010000,
    status: "예정",
    createdAt: "2025-03-12",
  },
  {
    id: "RSV-20241128",
    listingId: "gl-4",
    checkIn: "2024-12-24",
    checkOut: "2024-12-26",
    guests: 2,
    total: 420000,
    status: "완료",
    createdAt: "2024-11-28",
  },
];

export function enrichReservation(r) {
  return { ...r, listing: listings.find((l) => l.id === r.listingId) };
}
