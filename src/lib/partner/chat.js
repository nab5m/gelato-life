// 플라트라이프 채팅(chat) API 호출 (서버 전용)
//  - 인증: 공통 partnerRequest (HTTP BASIC, chat:read / chat:write 권한 필요)
//  - 페이지네이션: chat 목록·message 목록 모두 cursor/limit (cursor 는 불투명 토큰)
import { partnerRequest } from "./client";

// 채팅 유저 생성 (idempotent). 같은 채널+externalUserId 면 기존 유저 반환.
// body: OpenChatUserCreateRequest → 응답 OpenChatUserResponse({ id, externalUserId, nickname, profileUrl })
export async function createChatUser({ externalUserId, nickname, profileUrl }) {
  return partnerRequest("/open/v1/chat-user", {
    method: "POST",
    body: { externalUserId, nickname, profileUrl },
  });
}

// 외부 식별자로 채팅 유저 조회.
export async function getChatUserByExternalId(externalUserId) {
  return partnerRequest("/open/v1/chat-user", {
    method: "GET",
    params: { externalUserId },
  });
}

// 채팅방 생성. body: { buildingUnitTypeId, chatUserId } → OpenChatDetailResponse({ id, ... }).
export async function createChat({ buildingUnitTypeId, chatUserId }) {
  return partnerRequest("/open/v1/chat", {
    method: "POST",
    body: {
      buildingUnitTypeId: Number(buildingUnitTypeId),
      chatUserId: Number(chatUserId),
    },
  });
}

// 채팅방 목록 (cursor 페이지네이션). 응답 cursor 가 null 이면 마지막 페이지.
export async function listChats({ chatUserId, cursor, limit = 20 }) {
  return partnerRequest("/open/v1/chat", {
    method: "GET",
    params: { chatUserId: Number(chatUserId), cursor, limit },
  });
}

// 메시지 전송. body: { chatUserId, message } → OpenChatMessageResponse.
export async function sendChatMessage(chatId, { chatUserId, message }) {
  return partnerRequest(`/open/v1/chat/${chatId}/message`, {
    method: "POST",
    body: { chatUserId: Number(chatUserId), message },
  });
}

// 메시지 목록 (최신→과거, cursor 페이지네이션). cursor 미지정 시 최신부터.
export async function listChatMessages(chatId, { cursor, limit = 30 } = {}) {
  return partnerRequest(`/open/v1/chat/${chatId}/message`, {
    method: "GET",
    params: { cursor, limit },
  });
}
