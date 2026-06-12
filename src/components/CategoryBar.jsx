"use client";

import { categories } from "@/data/listings";
import { SlidersHorizontal } from "lucide-react";
import { useT } from "@/context/LocaleContext";

export default function CategoryBar({ active, onChange }) {
  const t = useT();
  return (
    <div className="flex items-center gap-4">
      <div className="no-scrollbar flex flex-1 items-center gap-7 overflow-x-auto py-3">
        {categories.map((c) => {
          const on = active === c.key;
          return (
            <button
              key={c.key}
              onClick={() => onChange?.(c.key)}
              className={`flex shrink-0 flex-col items-center gap-1.5 border-b-2 pb-2 text-xs font-medium transition ${
                on
                  ? "border-gelato-500 text-gray-900"
                  : "border-transparent text-gray-500 hover:border-gray-200 hover:text-gray-800"
              }`}
            >
              <span className="text-2xl">{c.emoji}</span>
              {t(c.label)}
            </button>
          );
        })}
      </div>
      <button className="hidden shrink-0 items-center gap-2 rounded-xl border border-gray-300 px-4 py-2.5 text-xs font-semibold text-gray-800 transition hover:border-gray-800 sm:flex">
        <SlidersHorizontal size={16} />
        {t("필터")}
      </button>
    </div>
  );
}
