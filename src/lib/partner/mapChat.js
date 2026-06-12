// 파트너 채팅 응답 → 메시지 화면(messages 페이지) UI 형태로 변환.
//
// 채팅 응답의 nested 필드(host, buildingUnitType, lastMessage)는 문서상 "object" 로만
// 표기돼 하위 필드명이 불확실하다. mapRoom 과 동일한 방식으로 후보 필드를 순서대로 시도하고
// 없으면 플레이스홀더로 폴백한다.

function val(v) {
  if (v !== null && typeof v === "object" && !Array.isArray(v) && "value" in v) {
    return v.value;
  }
  return v;
}

// UTC ISO/timestamp → "오전 9:42" 같은 한국어 짧은 표기. 실패 시 빈 문자열.
function timeLabel(iso) {
  const x = val(iso);
  if (!x) return "";
  const d = new Date(x);
  if (isNaN(d)) return "";
  return d.toLocaleTimeString("ko-KR", { hour: "numeric", minute: "2-digit" });
}

function avatarOf(obj, seed) {
  const o = val(obj) || {};
  return (
    val(o.profileUrl) ||
    o.profileImage ||
    o.image ||
    o.avatar ||
    `https://i.pravatar.cc/120?u=${seed}`
  );
}

function nameOf(obj, fallback) {
  const o = val(obj) || {};
  return val(o.name) || val(o.nickname) || fallback;
}

// thumbnails(이미지 FILE 메시지)에서 대표 썸네일 URL 한 개를 뽑는다.
// Sendbird 형태([{ url, real_height, ... }]) 및 문자열 배열 모두 방어.
function firstThumbUrl(thumbnails) {
  const t = val(thumbnails);
  if (!t) return null;
  const arr = Array.isArray(t) ? t : [t];
  for (const it of arr) {
    const u = typeof it === "string" ? it : val(it?.url) || val(it?.imageUrl) || null;
    if (u) return u;
  }
  return null;
}

// FILE 타입 메시지의 첨부 정보. FILE 이 아니거나 URL 이 없으면 null.
function extractFile(m) {
  if (val(m.type) !== "FILE") return null;
  const url = val(m.fileUrl);
  if (!url) return null;
  const mimeType = val(m.mimeType) || "";
  const thumb = firstThumbUrl(m.thumbnails);
  const isImage = mimeType.startsWith("image/") || Boolean(thumb);
  return {
    url,
    name: val(m.fileName) || "첨부파일",
    mimeType,
    size: Number(val(m.fileSize)) || 0,
    isImage,
    // 이미지면 썸네일 우선, 없으면 원본 URL 로 미리보기.
    thumbnail: thumb || (isImage ? url : null),
  };
}

// OpenChatMessageResponse → { id, from, text, time, type, file }
// from: 내 닉네임(myNickname)과 발신자 닉네임이 같으면 "me", 아니면 "host"(상대/시스템).
export function mapMessage(m, myNickname) {
  if (!m) return null;
  const sender = val(m.senderNickname);
  const isMe = Boolean(myNickname) && sender === myNickname;
  return {
    id: String(val(m.messageId) ?? `${val(m.createdAt) || ""}-${sender || ""}`),
    from: isMe ? "me" : "host",
    text: val(m.message) || "",
    time: timeLabel(m.createdAt),
    type: val(m.type) || "MESSAGE",
    file: extractFile(m),
  };
}

// 메시지 목록 응답(최신→과거)을 화면용(과거→최신)으로 뒤집어 매핑.
export function mapMessages(list, myNickname) {
  const arr = Array.isArray(list) ? list : [];
  return arr
    .map((m) => mapMessage(m, myNickname))
    .filter(Boolean)
    .reverse();
}

// OpenChatDetailResponse → messages 페이지 conversation 형태.
// 메시지 본문은 별도 조회(GET .../message)로 채우므로 여기선 메타데이터만 매핑.
export function mapChat(chat) {
  if (!chat) return null;
  const id = String(val(chat.id));
  const room = val(chat.buildingUnitType) || {};
  const last = val(chat.lastMessage) || {};
  return {
    id,
    chatId: id,
    host: {
      name: nameOf(chat.host, "호스트"),
      avatar: avatarOf(chat.host, `chat-host-${id}`),
    },
    // 실제 응답: chat.name(=방 이름), buildingUnitType.{id, name, mainImage}
    listingTitle: nameOf(chat.buildingUnitType, val(chat.name) || "문의"),
    listingThumb:
      val(room.mainImage) ||
      val(room.thumbnail) ||
      val(room.image) ||
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=300&q=70",
    // 마지막 메시지가 FILE 이면 본문 대신 첨부 라벨을 미리보기로.
    lastText:
      val(last.message) ||
      (val(last.type) === "FILE"
        ? (val(last.mimeType) || "").startsWith("image/")
          ? "🖼️ 사진"
          : "📎 파일"
        : ""),
    lastTime: timeLabel(last.createdAt),
    unread: Number(val(chat.unreadCount)) || 0,
    messages: [],
  };
}

export function mapChats(list) {
  return (Array.isArray(list) ? list : []).map(mapChat).filter(Boolean);
}
