"use client";

import { useT } from "@/context/LocaleContext";
import ComingSoon from "@/components/ComingSoon";

export default function HostPage() {
  const t = useT();
  return (
    <ComingSoon
      emoji="🏡"
      title={t("호스트가 되어보세요")}
      desc={t("당신의 공간을 젤라또 라이프에 등록하고 전 세계 게스트를 맞이하세요. 호스트 등록 기능은 곧 출시됩니다!")}
    />
  );
}
