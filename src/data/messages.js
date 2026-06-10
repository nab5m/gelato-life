// 채팅 목업 데이터 — 호스트와의 대화방
export const conversations = [
  {
    id: "c1",
    host: { name: "지수", avatar: "https://i.pravatar.cc/120?u=jisu" },
    listingTitle: "오션뷰 통유리 풀빌라",
    listingThumb:
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=300&q=70",
    lastTime: "오전 9:42",
    unread: 2,
    messages: [
      { id: "m1", from: "host", text: "안녕하세요! 젤라또 라이프 통해 예약 주셔서 감사해요 🍦", time: "어제 오후 6:10" },
      { id: "m2", from: "me", text: "안녕하세요! 체크인 시간을 조금 앞당길 수 있을까요?", time: "어제 오후 6:21" },
      { id: "m3", from: "host", text: "네 그럼요. 오후 2시부터 입실 가능하도록 준비해둘게요.", time: "오전 9:40" },
      { id: "m4", from: "host", text: "주차는 빌라 앞 전용 공간 이용하시면 됩니다 :)", time: "오전 9:42" },
    ],
  },
  {
    id: "c2",
    host: { name: "Marco", avatar: "https://i.pravatar.cc/120?u=marco" },
    listingTitle: "산토리니 클리프 하우스",
    listingThumb:
      "https://images.unsplash.com/photo-1469796466635-455ede028aca?auto=format&fit=crop&w=300&q=70",
    lastTime: "오후 7:15",
    unread: 0,
    messages: [
      { id: "m1", from: "host", text: "Hi! Welcome to Santorini 🌅 Let me know your arrival time.", time: "월요일 오후 3:00" },
      { id: "m2", from: "me", text: "감사합니다! 오후 4시쯤 도착할 것 같아요.", time: "월요일 오후 7:15" },
    ],
  },
  {
    id: "c3",
    host: { name: "민준", avatar: "https://i.pravatar.cc/120?u=minjun" },
    listingTitle: "전통 한옥 스테이, 북촌",
    listingThumb:
      "https://images.unsplash.com/photo-1538485399081-7191377e8241?auto=format&fit=crop&w=300&q=70",
    lastTime: "3월 4일",
    unread: 0,
    messages: [
      { id: "m1", from: "me", text: "후기 남겼어요. 덕분에 잘 쉬다 갑니다!", time: "3월 4일 오전 10:02" },
      { id: "m2", from: "host", text: "감사합니다! 또 놀러오세요 😊", time: "3월 4일 오전 11:20" },
    ],
  },
];
