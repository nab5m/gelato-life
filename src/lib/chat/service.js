// 채팅 오케스트레이션 (서버 전용)
//  - ensureChatUserId: 로그인 유저 ↔ 파트너 chatUserId 매핑(멱등 생성 + DB 캐시)
//  - openChat: 방 식별자로 채팅방 생성/확보
//  - 목록/메시지/전송: 파트너 호출 결과를 화면용으로 매핑
import { prisma } from "@/lib/db";
import {
  createChatUser,
  createChat,
  listChats,
  sendChatMessage,
  listChatMessages,
} from "@/lib/partner/chat";
import { mapChats, mapMessages, mapMessage } from "@/lib/partner/mapChat";

// 유저의 채팅 표시 이름. mapMessage 의 "me" 판별 기준이 되므로 일관되게 사용한다.
export function nicknameOf(user) {
  return user?.name || user?.email?.split("@")[0] || "게스트";
}

// 로그인 유저 → 파트너 chatUserId 확보. DB 에 캐시돼 있으면 재사용,
// 없으면 externalUserId=user.id 로 멱등 생성 후 저장한다. { chatUserId, nickname } 반환.
export async function ensureChatUser(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    const e = new Error("유저를 찾을 수 없습니다.");
    e.status = 404;
    throw e;
  }
  const nickname = nicknameOf(user);

  if (user.chatUserId != null) {
    return { chatUserId: Number(user.chatUserId), nickname };
  }

  const res = await createChatUser({ externalUserId: user.id, nickname });
  const chatUserId = Number(res?.id);
  if (Number.isFinite(chatUserId)) {
    await prisma.user
      .update({ where: { id: user.id }, data: { chatUserId: BigInt(chatUserId) } })
      .catch(() => {}); // 캐시 실패는 치명적이지 않음(다음 호출에서 다시 멱등 생성)
  }
  return { chatUserId, nickname };
}

// 방(buildingUnitTypeId) 기준 채팅방 생성/확보. 생성된 chatId 반환.
export async function openChat(userId, buildingUnitTypeId) {
  const { chatUserId } = await ensureChatUser(userId);
  const chat = await createChat({ buildingUnitTypeId, chatUserId });
  return { chatId: String(chat?.id), chat };
}

// 유저의 채팅방 목록 (cursor 페이지네이션). { items, cursor } 반환.
export async function listUserChats(userId, { cursor, limit } = {}) {
  const { chatUserId } = await ensureChatUser(userId);
  const data = await listChats({ chatUserId, cursor, limit });
  return {
    items: mapChats(data?.chats),
    // API 는 다음 페이지가 없으면 빈 문자열("")을 준다 → null 로 통일.
    cursor: data?.cursor || null,
  };
}

// 채팅방 메시지 목록 (cursor 페이지네이션). { items, cursor } 반환.
export async function listMessages(userId, chatId, { cursor, limit } = {}) {
  const { nickname } = await ensureChatUser(userId);
  const data = await listChatMessages(chatId, { cursor, limit });
  return {
    items: mapMessages(data?.messages, nickname),
    cursor: data?.cursor || null,
  };
}

// 메시지 전송. 전송된 메시지를 화면용으로 매핑해 반환.
export async function sendMessage(userId, chatId, message) {
  const { chatUserId, nickname } = await ensureChatUser(userId);
  const res = await sendChatMessage(chatId, { chatUserId, message });
  return mapMessage(res, nickname);
}
