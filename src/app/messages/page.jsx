"use client";

import { useRef, useState, useEffect, useLayoutEffect, useCallback } from "react";
import { Send, Search, ChevronLeft, Star, Paperclip } from "lucide-react";
import Header from "@/components/Header";
import { conversations as seed } from "@/data/messages";
import { fetchChats, fetchMessages, sendMessage } from "@/lib/chatClient";
import { useT } from "@/context/LocaleContext";

// SSR 경고 없이 레이아웃 단계에서 스크롤 위치를 보정하기 위한 isomorphic layout effect.
// (paint 전에 스크롤을 맞춰야 prepend 시 화면이 튀지 않는다)
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

// 폴링/페이지네이션 한 번에 가져오는 메시지 개수.
const PAGE = 30;
// 폴링 주기(ms).
const POLL_MS = 3000;

// 목록에 아직 없는(방금 연) 채팅방을 위한 임시 conversation. 메시지 로드 후 갱신된다.
function placeholderConvo(chatId) {
  return {
    id: chatId,
    chatId,
    host: { name: "호스트", avatar: `https://i.pravatar.cc/120?u=chat-${chatId}` },
    listingTitle: "문의",
    listingThumb:
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=300&q=70",
    lastText: "",
    lastTime: "",
    unread: 0,
    messages: [],
  };
}

// 파일 크기(byte) → "1.2MB" 같은 읽기 쉬운 표기.
function formatBytes(n) {
  if (!n) return "";
  const units = ["B", "KB", "MB", "GB"];
  let v = n;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i += 1;
  }
  return `${v.toFixed(i === 0 || v >= 10 ? 0 : 1)}${units[i]}`;
}

// 메시지 본문 렌더링: 이미지/파일 첨부(FILE 타입) + 텍스트를 함께 처리.
//  - 이미지: 썸네일(없으면 원본)을 보여주고, 클릭 시 새 탭에서 원본 열람
//  - 일반 파일: 파일명·크기 카드, 클릭 시 다운로드/열람
//  - 텍스트: 기존 말풍선
function MessageContent({ m }) {
  const mine = m.from === "me";
  const file = m.file;

  const textBubble = m.text ? (
    <div
      className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
        mine
          ? "rounded-br-md bg-gradient-to-r from-gelato-500 to-gelato-600 text-white"
          : "rounded-bl-md border border-gray-200 bg-white text-gray-800"
      }`}
    >
      {m.text}
    </div>
  ) : null;

  if (!file) return textBubble;

  const fileNode = file.isImage ? (
    <a href={file.url} target="_blank" rel="noopener noreferrer" className="block">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={file.thumbnail || file.url}
        alt={file.name}
        className="max-h-64 max-w-full rounded-2xl border border-gray-200 object-cover"
      />
    </a>
  ) : (
    <a
      href={file.url}
      target="_blank"
      rel="noopener noreferrer"
      download={file.name}
      className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${
        mine
          ? "rounded-br-md bg-gradient-to-r from-gelato-500 to-gelato-600 text-white"
          : "rounded-bl-md border border-gray-200 bg-white text-gray-800"
      }`}
    >
      <Paperclip size={18} className="shrink-0" />
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium">{file.name}</span>
        {file.size > 0 && (
          <span className={`text-xs ${mine ? "text-white/80" : "text-gray-400"}`}>
            {formatBytes(file.size)}
          </span>
        )}
      </span>
    </a>
  );

  return (
    <div className="space-y-1">
      {fileNode}
      {textBubble}
    </div>
  );
}

export default function MessagesPage() {
  const t = useT();
  // mode: "partner" = 파트너 API 연동, "mock" = 미설정/비로그인 시 목업 폴백
  const [mode, setMode] = useState(null); // null = 로딩 중
  const [convos, setConvos] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [showChatMobile, setShowChatMobile] = useState(false);

  const scrollRef = useRef(null); // 메시지 스크롤 컨테이너
  const atBottomRef = useRef(true); // 사용자가 하단 근처에 있는지(새 메시지 자동 스크롤 여부 판단)
  const prevActiveRef = useRef(null); // 직전 activeId(채팅방 전환 감지)
  const pendingPrependRef = useRef(null); // 과거 메시지 prepend 시 스크롤 위치 보정용 스냅샷
  const loadingOlderRef = useRef(false); // 과거 메시지 로딩 중복 호출 방지

  const active = convos.find((c) => c.id === activeId);

  // 최초: 채팅방 목록 로드. 연동 미설정/비로그인 → 목업으로 폴백.
  useEffect(() => {
    let alive = true;
    fetchChats({ limit: 20 })
      .then((d) => {
        if (!alive) return;
        if (d.configured && Array.isArray(d.items)) {
          setMode("partner");
          let items = d.items;
          // 방 상세 "문의하기"로 넘어온 경우 ?chat=<id> 를 우선 선택.
          const wanted = new URLSearchParams(window.location.search).get("chat");
          // 방금 만든 채팅방이 목록에 아직 반영되지 않았을 수 있어, 임시 항목을 추가해
          // 곧장 대화(메시지 입력)가 가능하도록 한다. 메타데이터는 메시지 로드 후 채워진다.
          if (wanted && !items.some((c) => c.id === wanted)) {
            items = [placeholderConvo(wanted), ...items];
          }
          setConvos(items);
          const preselect = wanted && items.some((c) => c.id === wanted) ? wanted : null;
          setActiveId(preselect ?? items[0]?.id ?? null);
          if (preselect) setShowChatMobile(true);
        } else {
          setMode("mock");
          setConvos(seed);
          setActiveId(seed[0]?.id ?? null);
        }
      })
      .catch(() => {
        if (!alive) return;
        setMode("mock");
        setConvos(seed);
        setActiveId(seed[0]?.id ?? null);
      });
    return () => {
      alive = false;
    };
  }, []);

  // 채팅방 선택 시 메시지 로드 (파트너 모드, 아직 안 불러온 방만).
  const loadMessages = useCallback(
    async (chatId) => {
      if (mode !== "partner" || !chatId) return;
      try {
        const d = await fetchMessages(chatId, { limit: PAGE });
        setConvos((cs) =>
          cs.map((c) =>
            c.id === chatId
              ? { ...c, messages: d.items || [], olderCursor: d.cursor ?? null, unread: 0 }
              : c
          )
        );
      } catch {
        /* 무시: 빈 메시지로 둔다 */
      }
    },
    [mode]
  );

  useEffect(() => {
    if (mode === "partner" && activeId) loadMessages(activeId);
  }, [mode, activeId, loadMessages]);

  // 3초마다 최신 메시지를 폴링해 새 메시지만 append. 변경이 없으면 setState 를 생략해
  // 불필요한 리렌더(깜빡임)를 막는다.
  useEffect(() => {
    if (mode !== "partner" || !activeId) return;
    let alive = true;
    const tick = async () => {
      try {
        const d = await fetchMessages(activeId, { limit: PAGE });
        if (!alive || !Array.isArray(d?.items)) return;
        setConvos((cs) =>
          cs.map((c) => {
            if (c.id !== activeId) return c;
            const existing = c.messages || [];
            const ids = new Set(existing.map((m) => m.id));
            const fresh = d.items.filter((m) => !ids.has(m.id));
            if (fresh.length === 0) return c; // 새 메시지 없음 → 상태 유지
            const last = fresh[fresh.length - 1];
            return {
              ...c,
              messages: [...existing, ...fresh],
              lastText: last?.text ?? c.lastText,
              lastTime: last?.time ?? c.lastTime,
            };
          })
        );
      } catch {
        /* 무시: 다음 주기에 재시도 */
      }
    };
    const id = setInterval(tick, POLL_MS);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [mode, activeId]);

  // 메시지 변화 시 스크롤 처리.
  //  - 과거 메시지 prepend: 보던 위치를 그대로 유지(튐 방지)
  //  - 채팅방 전환: 즉시 하단으로
  //  - 새 메시지 도착: 사용자가 하단 근처에 있을 때만 하단으로(읽던 위치 방해 X)
  useIsoLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (pendingPrependRef.current != null) {
      const { height, top } = pendingPrependRef.current;
      el.scrollTop = el.scrollHeight - height + top;
      pendingPrependRef.current = null;
      return;
    }
    if (prevActiveRef.current !== activeId) {
      prevActiveRef.current = activeId;
      el.scrollTop = el.scrollHeight;
      atBottomRef.current = true;
      return;
    }
    if (atBottomRef.current) el.scrollTop = el.scrollHeight;
  }, [active?.messages, activeId]);

  // 상단 근처로 스크롤하면 과거 메시지를 한 페이지 더 로드. cursor 가 null 이면 끝(더 호출 안 함).
  const loadOlder = useCallback(async () => {
    if (mode !== "partner" || loadingOlderRef.current) return;
    const cur = convos.find((c) => c.id === activeId);
    // undefined: 아직 초기 로드 전 / null: 더 이상 과거 메시지 없음 → 둘 다 중단
    if (!cur || cur.olderCursor == null) return;
    loadingOlderRef.current = true;
    try {
      const d = await fetchMessages(cur.id, { cursor: cur.olderCursor, limit: PAGE });
      // 스냅샷은 fetch 직후·setState 직전(사이에 await 없음)에 잡아, 폴링 append 와의
      // 레이스로 위치 보정이 잘못 적용되는 것을 막는다.
      const el = scrollRef.current;
      pendingPrependRef.current = el ? { height: el.scrollHeight, top: el.scrollTop } : null;
      setConvos((cs) =>
        cs.map((c) => {
          if (c.id !== cur.id) return c;
          const existing = c.messages || [];
          const ids = new Set(existing.map((m) => m.id));
          const older = (d.items || []).filter((m) => !ids.has(m.id));
          return { ...c, messages: [...older, ...existing], olderCursor: d.cursor ?? null };
        })
      );
    } catch {
      pendingPrependRef.current = null; // 실패 시 위치 보정 취소
    } finally {
      loadingOlderRef.current = false;
    }
  }, [mode, convos, activeId]);

  const handleScroll = (e) => {
    const el = e.currentTarget;
    atBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    if (el.scrollTop < 60) loadOlder();
  };

  const send = async (e) => {
    e.preventDefault();
    const body = text.trim();
    if (!body || sending) return;

    if (mode === "mock") {
      // 목업: 로컬 상태에만 추가 + 자동 응답
      const msg = { id: "m" + Date.now(), from: "me", text: body, time: "방금" };
      setConvos((cs) =>
        cs.map((c) =>
          c.id === activeId
            ? { ...c, messages: [...c.messages, msg], lastTime: "방금", unread: 0 }
            : c
        )
      );
      setText("");
      setTimeout(() => {
        const reply = {
          id: "r" + Date.now(),
          from: "host",
          text: "네, 확인했습니다! 더 궁금하신 점 있으면 언제든 말씀해주세요 😊",
          time: "방금",
        };
        setConvos((cs) =>
          cs.map((c) => (c.id === activeId ? { ...c, messages: [...c.messages, reply] } : c))
        );
      }, 1200);
      return;
    }

    // 파트너 모드: API 전송 후 응답 메시지를 반영
    setSending(true);
    setText("");
    try {
      const sent = await sendMessage(activeId, body);
      setConvos((cs) =>
        cs.map((c) =>
          c.id === activeId
            ? { ...c, messages: [...c.messages, sent], lastText: sent.text, lastTime: sent.time }
            : c
        )
      );
    } catch (err) {
      // 실패 시 입력값 복구
      setText(body);
      alert(err?.message || t("메시지 전송에 실패했어요."));
    } finally {
      setSending(false);
    }
  };

  if (mode === null) {
    return (
      <div className="flex h-screen flex-col bg-white">
        <Header showSearchPill={false} />
        <p className="py-32 text-center text-gray-400">{t("메시지를 불러오는 중…")}</p>
      </div>
    );
  }

  if (convos.length === 0) {
    return (
      <div className="flex h-screen flex-col bg-white">
        <Header showSearchPill={false} />
        <div className="py-32 text-center">
          <p className="text-4xl">💬</p>
          <p className="mt-3 font-semibold text-gray-800">{t("아직 대화가 없어요")}</p>
          <p className="mt-1 text-sm text-gray-500">
            {t("숙소 상세에서 호스트에게 문의하면 대화가 시작됩니다.")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-white">
      <Header showSearchPill={false} />

      <div className="mx-auto flex w-full max-w-7xl flex-1 overflow-hidden px-0 md:px-6 md:py-4">
        <div className="flex w-full overflow-hidden rounded-none border-gray-200 md:rounded-3xl md:border">
          {/* 좌측 대화 목록 */}
          <aside
            className={`w-full shrink-0 border-r border-gray-200 md:block md:w-80 ${
              showChatMobile ? "hidden" : "block"
            }`}
          >
            <div className="border-b border-gray-100 p-4">
              <h1 className="text-xl font-bold">{t("메시지")}</h1>
              <div className="relative mt-3">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  placeholder={t("대화 검색")}
                  className="w-full rounded-full border border-gray-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-gelato-400"
                />
              </div>
            </div>
            <div className="overflow-y-auto">
              {convos.map((c) => {
                const last = c.messages?.[c.messages.length - 1];
                const preview = last?.text ?? c.lastText ?? "";
                return (
                  <button
                    key={c.id}
                    onClick={() => {
                      setActiveId(c.id);
                      setShowChatMobile(true);
                      setConvos((cs) =>
                        cs.map((x) => (x.id === c.id ? { ...x, unread: 0 } : x))
                      );
                    }}
                    className={`flex w-full items-start gap-3 border-b border-gray-50 p-4 text-left transition hover:bg-gray-50 ${
                      activeId === c.id ? "bg-gelato-50/60" : ""
                    }`}
                  >
                    <img src={c.host.avatar} alt={c.host.name} className="h-12 w-12 rounded-full object-cover" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="truncate font-semibold text-gray-900">{c.host.name}</p>
                        <span className="shrink-0 text-xs text-gray-400">{c.lastTime}</span>
                      </div>
                      <p className="truncate text-xs text-gray-500">{c.listingTitle}</p>
                      <p className="mt-0.5 truncate text-sm text-gray-600">{preview}</p>
                    </div>
                    {c.unread > 0 && (
                      <span className="mt-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gelato-500 px-1.5 text-[11px] font-bold text-white">
                        {c.unread}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </aside>

          {/* 우측 대화 */}
          <section
            className={`min-h-0 flex flex-1 flex-col ${
              showChatMobile ? "flex" : "hidden md:flex"
            }`}
          >
            {/* 헤더 */}
            <div className="flex items-center gap-3 border-b border-gray-100 p-4">
              <button
                onClick={() => setShowChatMobile(false)}
                className="md:hidden"
                aria-label={t("뒤로")}
              >
                <ChevronLeft />
              </button>
              <img src={active.host.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{active.host.name}</p>
                <p className="flex items-center gap-1 text-xs text-gray-500">
                  <Star size={11} className="fill-gelato-500 text-gelato-500" />
                  {t("슈퍼호스트 · 보통 1시간 이내 응답")}
                </p>
              </div>
            </div>

            {/* 숙소 카드 */}
            <div className="flex items-center gap-3 border-b border-gray-100 bg-gray-50/60 px-4 py-3">
              <img src={active.listingThumb} alt="" className="h-12 w-16 rounded-lg object-cover" />
              <p className="text-sm font-medium text-gray-700">{active.listingTitle}</p>
            </div>

            {/* 메시지 영역 */}
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-cream/40 p-4"
            >
              {(active.messages || []).map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[75%] ${m.from === "me" ? "items-end" : "items-start"}`}>
                    <MessageContent m={m} />
                    <p className={`mt-1 text-[11px] text-gray-400 ${m.from === "me" ? "text-right" : ""}`}>
                      {m.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* 입력 */}
            <form onSubmit={send} className="flex items-center gap-2 border-t border-gray-100 p-3">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={t("메시지를 입력하세요…")}
                className="flex-1 rounded-full border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gelato-400"
              />
              <button
                type="submit"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-r from-gelato-500 to-gelato-600 text-white transition hover:opacity-95 disabled:opacity-50"
                disabled={!text.trim() || sending}
                aria-label={t("전송")}
              >
                <Send size={18} />
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
