// 클라이언트에서 /api/contracts 를 호출하는 헬퍼 (예약=계약)
"use client";

import { useEffect, useState } from "react";

export async function createReservation(input) {
  const res = await fetch("/api/contracts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.error || `예약 생성 실패 (${res.status})`);
  return json.reservation;
}

export async function cancelReservation(id) {
  const res = await fetch(`/api/contracts/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "cancel" }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.error || `예약 취소 실패 (${res.status})`);
  return json.reservation;
}

export async function completeReservation(id) {
  const res = await fetch(`/api/contracts/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "complete" }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.error || `결제 완료 처리 실패 (${res.status})`);
  return json.reservation;
}

export async function fetchReservation(id) {
  const res = await fetch(`/api/contracts/${id}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`예약 조회 실패 (${res.status})`);
  const json = await res.json();
  return json.reservation || null;
}

export async function fetchReservations() {
  const res = await fetch("/api/contracts");
  if (!res.ok) throw new Error(`예약 목록 조회 실패 (${res.status})`);
  const json = await res.json();
  return json.items || [];
}

// 예약 목록 hook
export function useReservations() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    fetchReservations()
      .then((r) => alive && setItems(r))
      .catch((e) => alive && setError(e))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  return { items, loading, error };
}

// 예약 단건 hook
export function useReservation(id) {
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    let alive = true;
    fetchReservation(id)
      .then((r) => alive && setReservation(r))
      .catch((e) => alive && setError(e))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [id]);

  return { reservation, loading, error };
}
