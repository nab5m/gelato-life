"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { DayPicker } from "react-day-picker";
import { ko } from "date-fns/locale";
import "react-day-picker/style.css";
import { Calendar } from "lucide-react";
import { useT } from "@/context/LocaleContext";

// yyyy-MM-dd <-> Date (로컬 자정 기준)
function toDate(s) {
  return s ? new Date(`${s}T00:00:00`) : undefined;
}
function toStr(d) {
  if (!d) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function label(s) {
  const d = toDate(s);
  if (!d) return null;
  return d.toLocaleDateString("ko-KR", { month: "long", day: "numeric" });
}

// from~to 기간 길이(양끝 포함 일수).
function dayCountInclusive(from, to) {
  const a = new Date(from);
  a.setHours(0, 0, 0, 0);
  const b = new Date(to);
  b.setHours(0, 0, 0, 0);
  return Math.round((b - a) / 86400000) + 1;
}

// from~to 사이(양끝 포함)에 마감일(blockedSet)이 하나라도 있으면 true.
function rangeHasBlocked(from, to, blockedSet) {
  if (!from || !to || !blockedSet?.size) return false;
  const d = new Date(from);
  d.setHours(0, 0, 0, 0);
  while (d <= to) {
    if (blockedSet.has(toStr(d))) return true;
    d.setDate(d.getDate() + 1);
  }
  return false;
}

// 클릭한 날짜로 다음 범위를 계산하는 상태머신.
//  - 범위 없음 / 이미 완성 → 새 시작일
//  - 시작일만 있음 → 시작보다 이르면 새 시작, 아니면 종료일 설정
//  - 시작~종료 사이에 마감일이 끼면 종료일로 인정하지 않고 새 시작일로 재설정
//  - 기간 길이가 minDays(양끝 포함) 미만이면 종료일로 인정하지 않고 새 시작일로 재설정
function nextRange(prev, day, blockedSet, minDays = 1) {
  if (!day) return prev;
  if (!prev?.from || (prev.from && prev.to)) return { from: day, to: undefined };
  if (day < prev.from) return { from: day, to: undefined };
  if (rangeHasBlocked(prev.from, day, blockedSet)) return { from: day, to: undefined };
  if (dayCountInclusive(prev.from, day) < minDays) return { from: day, to: undefined };
  return { from: prev.from, to: day };
}

export default function DateRangePicker({
  checkIn,
  checkOut,
  onChange,
  showIcon = true,
  triggerClassName = "",
  blockedDates = [],
  minDays = 1,
}) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const [draft, setDraft] = useState({ from: toDate(checkIn), to: toDate(checkOut) });
  const draftRef = useRef(draft);
  draftRef.current = draft;

  const triggerRef = useRef(null);
  const popRef = useRef(null);

  useEffect(() => setMounted(true), []);

  // props 변경 시 draft 동기화 (외부에서 초기화/주입될 때)
  useEffect(() => {
    setDraft({ from: toDate(checkIn), to: toDate(checkOut) });
  }, [checkIn, checkOut]);

  // 트리거 위치 계산 (포털이라 fixed 좌표 직접 산출 + 뷰포트 보정)
  const place = () => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const W = 320;
    let left = r.left;
    if (left + W > window.innerWidth - 8) left = window.innerWidth - W - 8;
    if (left < 8) left = 8;
    setCoords({ top: r.bottom + 8, left });
  };

  useEffect(() => {
    if (!open) return;
    place();
    const onMove = () => place();
    window.addEventListener("resize", onMove);
    window.addEventListener("scroll", onMove, true);
    return () => {
      window.removeEventListener("resize", onMove);
      window.removeEventListener("scroll", onMove, true);
    };
  }, [open]);

  // 외부 클릭 시 닫기
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (
        triggerRef.current?.contains(e.target) ||
        popRef.current?.contains(e.target)
      )
        return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 예약 마감일: 빠른 조회용 Set + 달력 disabled/modifier 용 Date 배열
  const blockedSet = useMemo(() => new Set(blockedDates), [blockedDates]);
  const blockedDays = useMemo(
    () => blockedDates.map(toDate).filter(Boolean),
    [blockedDates]
  );

  // 시작일만 선택된 상태에서, minDays 미만이 되는 종료일(시작일 다음날 ~ 시작일+minDays-2)은 비활성화.
  const minRangeDisabled = useMemo(() => {
    if (minDays <= 1 || !draft.from || draft.to) return [];
    const start = new Date(draft.from);
    start.setDate(start.getDate() + 1);
    const end = new Date(draft.from);
    end.setDate(end.getDate() + (minDays - 2));
    return [{ from: start, to: end }];
  }, [minDays, draft]);

  const text =
    checkIn && checkOut
      ? `${label(checkIn)} – ${label(checkOut)}`
      : checkIn
      ? `${label(checkIn)} – ${t("종료일 선택")}`
      : t("날짜 선택");

  const pick = (_range, day) => {
    const next = nextRange(draftRef.current, day, blockedSet, minDays);
    setDraft(next);
    onChange?.(toStr(next.from), toStr(next.to));
  };

  const reset = () => {
    setDraft({ from: undefined, to: undefined });
    onChange?.("", "");
  };

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={
          triggerClassName ||
          "flex w-full items-center gap-2 rounded-xl border border-gray-300 px-3 py-2.5 text-left text-sm text-gray-700 transition hover:border-gray-800"
        }
      >
        {showIcon && <Calendar size={16} className="shrink-0 text-gray-400" />}
        <span className={checkIn ? "text-gray-900" : "text-gray-400"}>{text}</span>
      </button>

      {mounted &&
        open &&
        createPortal(
          <div
            ref={popRef}
            className="gl-cal fixed z-[100] rounded-2xl border border-gray-200 bg-white p-3 shadow-card"
            style={{ top: coords.top, left: coords.left, width: 320 }}
          >
            <DayPicker
              mode="range"
              locale={ko}
              selected={draft}
              onSelect={pick}
              disabled={[{ before: today }, ...blockedDays, ...minRangeDisabled]}
              modifiers={{ blocked: blockedDays }}
              modifiersClassNames={{ blocked: "rdp-blocked" }}
              numberOfMonths={1}
            />
            <div className="mt-2 flex items-center justify-between border-t border-gray-100 pt-3">
              <button
                type="button"
                onClick={reset}
                className="text-sm font-medium text-gray-500 hover:text-gray-800"
              >
                {t("초기화")}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={!draft.from || !draft.to}
                className="rounded-full bg-gelato-500 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-gelato-600 disabled:opacity-40"
              >
                {t("적용")}
              </button>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
