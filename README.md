# 🍦 젤라또 라이프 (Gelato Life)

에어비앤비 스타일의 숙소 예약 사이트 — 젤라또(아이스크림) 테마. **Next.js(App Router) + Tailwind CSS**, 모든 데이터는 **mock**으로 구현된 화면 전용 프로젝트입니다.

## 실행

```bash
npm install
npm run dev      # http://localhost:3000
```

빌드: `npm run build && npm run start`

## 구현된 기능 / 페이지

| 경로 | 설명 |
|------|------|
| `/` | 홈 — 히어로 검색, 카테고리 필터, 숙소 그리드 |
| `/login`, `/signup` | 회원가입 / 로그인 (mock, localStorage 기반) |
| `/search` | 검색 결과 — 키워드/카테고리 필터, 지도 placeholder |
| `/rooms/[id]` | 숙소 상세 — 갤러리, 편의시설, 후기, 예약 위젯 |
| `/checkout/[id]` | 결제 — 결제수단 선택, 카드 입력, 요금 요약 |
| `/reservations` | 예약 내역 목록 (다가오는/지난 여행) |
| `/reservations/[id]` | 예약 상세 — 확정 안내, 일정, 호스트, 결제 정보 |
| `/messages` | 채팅 — 대화 목록 + 실시간 입력/자동응답(mock) |
| `/host`, `/wishlist`, `/help` | 준비중 placeholder |

## 기술 / 구조

- **Next.js 14 App Router**, JavaScript(JSX)
- **Tailwind CSS** — 젤라또 팔레트(`gelato` 핑크 / `mint` 민트 / `cream` 바닐라)
- **lucide-react** 아이콘
- 로고: 인라인 SVG 젤라또 아이스크림 콘 (`src/components/Logo.jsx`)
- 인증: `src/context/AuthContext.jsx` (localStorage mock)
- mock 데이터: `src/data/` (숙소, 예약, 채팅)
- 예약 저장: `src/lib/reservationStore.js` (localStorage)

## 흐름 예시

홈/검색에서 숙소 선택 → 상세에서 날짜·인원 선택 후 **예약하기** → 결제 페이지에서 **결제하기** → 예약 확정 상세로 이동(localStorage 저장) → 예약 내역에서 다시 확인.
