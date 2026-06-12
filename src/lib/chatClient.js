// 클라이언트에서 /api/chat 라우트를 호출하는 헬퍼 (브라우저 전용)
"use client";

import { apiFetch } from "./apiFetch";

// 채팅방 목록 조회. { configured, items, cursor } 반환.
export async function fetchChats({ cursor, limit } = {}) {
  const sp = new URLSearchParams();
  if (cursor) sp.set("cursor", cursor);
  if (limit) sp.set("limit", String(limit));
  const res = await apiFetch(`/api/chat?${sp.toString()}`);
  if (res.status === 401) return { configured: false, items: [], cursor: null, unauthorized: true };
  if (!res.ok) throw new Error(`채팅방 목록 조회 실패 (${res.status})`);
  return res.json();
}

// 방으로 채팅방 생성/확보. chatId 반환.
export async function openChat(buildingUnitTypeId) {
  const res = await apiFetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ buildingUnitTypeId }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `채팅방 생성 실패 (${res.status})`);
  return data.chatId;
}

// 메시지 목록 조회. { configured, items, cursor } 반환.
export async function fetchMessages(chatId, { cursor, limit } = {}) {
  const sp = new URLSearchParams();
  if (cursor) sp.set("cursor", cursor);
  if (limit) sp.set("limit", String(limit));
  const res = await apiFetch(`/api/chat/${chatId}/messages?${sp.toString()}`);
  if (!res.ok) throw new Error(`메시지 조회 실패 (${res.status})`);
  return res.json();
}

// 메시지 전송. 전송된 메시지 객체 반환.
export async function sendMessage(chatId, message) {
  const res = await apiFetch(`/api/chat/${chatId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `메시지 전송 실패 (${res.status})`);
  return data.message;
}
