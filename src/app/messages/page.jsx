"use client";

import { useRef, useState, useEffect } from "react";
import { Send, Search, ChevronLeft, Star } from "lucide-react";
import Header from "@/components/Header";
import { conversations as seed } from "@/data/messages";

export default function MessagesPage() {
  const [convos, setConvos] = useState(seed);
  const [activeId, setActiveId] = useState(seed[0].id);
  const [text, setText] = useState("");
  const [showChatMobile, setShowChatMobile] = useState(false);
  const endRef = useRef(null);

  const active = convos.find((c) => c.id === activeId);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [active?.messages.length, activeId]);

  const send = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    const msg = {
      id: "m" + Date.now(),
      from: "me",
      text: text.trim(),
      time: "방금",
    };
    setConvos((cs) =>
      cs.map((c) =>
        c.id === activeId
          ? { ...c, messages: [...c.messages, msg], lastTime: "방금", unread: 0 }
          : c
      )
    );
    setText("");

    // 목업 자동 응답
    setTimeout(() => {
      const reply = {
        id: "r" + Date.now(),
        from: "host",
        text: "네, 확인했습니다! 더 궁금하신 점 있으면 언제든 말씀해주세요 😊",
        time: "방금",
      };
      setConvos((cs) =>
        cs.map((c) =>
          c.id === activeId ? { ...c, messages: [...c.messages, reply] } : c
        )
      );
    }, 1200);
  };

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
              <h1 className="text-xl font-bold">메시지</h1>
              <div className="relative mt-3">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  placeholder="대화 검색"
                  className="w-full rounded-full border border-gray-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-gelato-400"
                />
              </div>
            </div>
            <div className="overflow-y-auto">
              {convos.map((c) => {
                const last = c.messages[c.messages.length - 1];
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
                      <p className="mt-0.5 truncate text-sm text-gray-600">{last?.text}</p>
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
            className={`flex flex-1 flex-col ${
              showChatMobile ? "flex" : "hidden md:flex"
            }`}
          >
            {/* 헤더 */}
            <div className="flex items-center gap-3 border-b border-gray-100 p-4">
              <button
                onClick={() => setShowChatMobile(false)}
                className="md:hidden"
                aria-label="뒤로"
              >
                <ChevronLeft />
              </button>
              <img src={active.host.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{active.host.name}</p>
                <p className="flex items-center gap-1 text-xs text-gray-500">
                  <Star size={11} className="fill-gelato-500 text-gelato-500" />
                  슈퍼호스트 · 보통 1시간 이내 응답
                </p>
              </div>
            </div>

            {/* 숙소 카드 */}
            <div className="flex items-center gap-3 border-b border-gray-100 bg-gray-50/60 px-4 py-3">
              <img src={active.listingThumb} alt="" className="h-12 w-16 rounded-lg object-cover" />
              <p className="text-sm font-medium text-gray-700">{active.listingTitle}</p>
            </div>

            {/* 메시지 영역 */}
            <div className="flex-1 space-y-3 overflow-y-auto bg-cream/40 p-4">
              {active.messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[75%] ${m.from === "me" ? "items-end" : "items-start"}`}>
                    <div
                      className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                        m.from === "me"
                          ? "rounded-br-md bg-gradient-to-r from-gelato-500 to-gelato-600 text-white"
                          : "rounded-bl-md border border-gray-200 bg-white text-gray-800"
                      }`}
                    >
                      {m.text}
                    </div>
                    <p className={`mt-1 text-[11px] text-gray-400 ${m.from === "me" ? "text-right" : ""}`}>
                      {m.time}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={endRef} />
            </div>

            {/* 입력 */}
            <form onSubmit={send} className="flex items-center gap-2 border-t border-gray-100 p-3">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="메시지를 입력하세요…"
                className="flex-1 rounded-full border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gelato-400"
              />
              <button
                type="submit"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-r from-gelato-500 to-gelato-600 text-white transition hover:opacity-95 disabled:opacity-50"
                disabled={!text.trim()}
                aria-label="전송"
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
