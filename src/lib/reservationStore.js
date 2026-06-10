import { seedReservations } from "@/data/reservations";

const KEY = "gelato_reservations";

export function getReservations() {
  if (typeof window === "undefined") return seedReservations;
  try {
    const raw = localStorage.getItem(KEY);
    const saved = raw ? JSON.parse(raw) : [];
    return [...saved, ...seedReservations];
  } catch {
    return seedReservations;
  }
}

export function getReservation(id) {
  return getReservations().find((r) => r.id === id);
}

export function addReservation(res) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(KEY);
    const saved = raw ? JSON.parse(raw) : [];
    localStorage.setItem(KEY, JSON.stringify([res, ...saved]));
  } catch {}
}

export function makeReservationId() {
  // 목업 예약번호
  return "RSV-" + Math.floor(100000 + Math.random() * 900000);
}
