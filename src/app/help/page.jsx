"use client";

import { useT } from "@/context/LocaleContext";
import ComingSoon from "@/components/ComingSoon";

export default function HelpPage() {
  const t = useT();
  return (
    <ComingSoon
      emoji="🛟"
      title={t("고객센터")}
      desc={t("무엇을 도와드릴까요? 자주 묻는 질문과 1:1 문의는 곧 제공될 예정입니다.")}
    />
  );
}
