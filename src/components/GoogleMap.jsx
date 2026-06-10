"use client";

import { useEffect, useRef, useState } from "react";
import { Map as MapIcon } from "lucide-react";
import { loadGoogleMaps } from "@/lib/googleMaps";

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
const SEOUL = { lat: 37.5665, lng: 126.978 };

// 핀 클릭 시 InfoWindow 에 띄울 방 카드 DOM 생성. 카드 클릭 → onSelect(id).
function buildCard(m, onSelect) {
  const card = document.createElement("div");
  card.style.cssText =
    "width:210px;cursor:pointer;font-family:inherit;line-height:1.3;";

  if (m.thumb) {
    const img = document.createElement("img");
    img.src = m.thumb;
    img.alt = m.title || "";
    img.style.cssText =
      "width:100%;height:120px;object-fit:cover;border-radius:10px;display:block;";
    card.appendChild(img);
  }

  const title = document.createElement("div");
  title.textContent = m.title || "이름 없는 숙소";
  title.style.cssText =
    "margin-top:8px;font-weight:600;font-size:13px;color:#111;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;";
  card.appendChild(title);

  if (m.city) {
    const city = document.createElement("div");
    city.textContent = m.city;
    city.style.cssText = "font-size:12px;color:#6b7280;";
    card.appendChild(city);
  }

  if (m.priceLabel) {
    const price = document.createElement("div");
    price.innerHTML = `<b>${m.priceLabel}</b>`;
    price.style.cssText = "margin-top:2px;font-size:13px;color:#111;";
    card.appendChild(price);
  }

  const cta = document.createElement("div");
  cta.textContent = "상세 보기 →";
  cta.style.cssText = "margin-top:6px;font-size:12px;font-weight:600;color:#f93f86;";
  card.appendChild(cta);

  if (onSelect) card.addEventListener("click", () => onSelect(m.id));
  return card;
}

// markers: [{ lat, lng, id?, title?, city?, priceLabel?, thumb? }]
// onSelect: (id) => void  — 핀/카드 클릭 시 호출
export default function GoogleMap({
  center,
  markers = [],
  zoom = 13,
  onSelect,
  className = "h-full w-full",
}) {
  const ref = useRef(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const [failed, setFailed] = useState(!API_KEY);

  useEffect(() => {
    if (!API_KEY || !ref.current) return;
    let cancelled = false;

    loadGoogleMaps(API_KEY)
      .then((maps) => {
        if (cancelled || !ref.current) return;
        const pts = (markers || []).filter(
          (m) => Number.isFinite(m.lat) && Number.isFinite(m.lng)
        );
        const c = center && Number.isFinite(center.lat) ? center : pts[0] || SEOUL;

        const map = new maps.Map(ref.current, {
          center: c,
          zoom,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });

        const info = new maps.InfoWindow();
        const bounds = new maps.LatLngBounds();

        pts.forEach((p) => {
          const marker = new maps.Marker({
            position: { lat: p.lat, lng: p.lng },
            map,
            title: p.title || undefined,
          });
          marker.addListener("click", () => {
            info.setContent(buildCard(p, (id) => onSelectRef.current?.(id)));
            info.open({ map, anchor: marker });
          });
          bounds.extend({ lat: p.lat, lng: p.lng });
        });
        if (pts.length > 1) map.fitBounds(bounds);
      })
      .catch(() => !cancelled && setFailed(true));

    return () => {
      cancelled = true;
    };
  }, [center, markers, zoom]);

  if (failed) {
    return (
      <div
        className={`flex items-center justify-center gap-2 bg-gradient-to-br from-mint-50 to-gelato-50 text-gray-500 ${className}`}
      >
        <MapIcon size={22} />
        <span className="text-sm font-medium">
          {API_KEY ? "지도를 불러오지 못했어요" : "지도 API 키가 설정되지 않았어요"}
        </span>
      </div>
    );
  }

  return <div ref={ref} className={className} />;
}
