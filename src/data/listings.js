// 젤라또 라이프 — 숙소 목업 데이터
// 이미지는 Unsplash 공개 사진 ID 사용

const img = (id, w = 900) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=70`;

// 카테고리 (에어비앤비 상단 카테고리 바와 유사)
export const categories = [
  { key: "all", label: "전체", emoji: "🍦" },
  { key: "beach", label: "해변 근처", emoji: "🏖️" },
  { key: "cabin", label: "통나무집", emoji: "🛖" },
  { key: "pool", label: "수영장", emoji: "🏊" },
  { key: "city", label: "도심", emoji: "🌆" },
  { key: "mountain", label: "산속", emoji: "⛰️" },
  { key: "design", label: "디자인", emoji: "🎨" },
  { key: "hanok", label: "한옥", emoji: "🏯" },
  { key: "lake", label: "호수", emoji: "🛶" },
  { key: "ski", label: "스키 인앤아웃", emoji: "🎿" },
  { key: "camping", label: "캠핑", emoji: "🏕️" },
];

const HOSTS = [
  { id: "h1", name: "지수", avatar: "https://i.pravatar.cc/120?u=jisu", superhost: true, since: "2019년" },
  { id: "h2", name: "Marco", avatar: "https://i.pravatar.cc/120?u=marco", superhost: true, since: "2018년" },
  { id: "h3", name: "Yuki", avatar: "https://i.pravatar.cc/120?u=yuki", superhost: false, since: "2021년" },
  { id: "h4", name: "민준", avatar: "https://i.pravatar.cc/120?u=minjun", superhost: true, since: "2017년" },
  { id: "h5", name: "Sophie", avatar: "https://i.pravatar.cc/120?u=sophie", superhost: false, since: "2022년" },
];

const AMENITIES = [
  "주방", "무선 인터넷", "업무 전용 공간", "TV", "무료 주차",
  "에어컨", "수영장", "온수 욕조", "세탁기", "건조기",
  "반려동물 동반 가능", "조식 제공", "발코니", "오션뷰", "바비큐 그릴",
];

const REVIEW_TEXTS = [
  "사진보다 훨씬 좋았어요. 위치도 완벽하고 호스트분이 정말 친절하셨습니다.",
  "달콤한 휴식이었어요! 침구가 포근하고 청결도 최고였습니다.",
  "조용하고 아늑한 공간이라 푹 쉬다 갑니다. 다음에 또 올게요.",
  "체크인이 간편했고 안내가 자세했어요. 강력 추천합니다.",
  "뷰가 정말 예술이에요. 아침에 커피 한 잔의 여유가 행복했습니다.",
  "가성비 최고! 가족 여행으로 딱 좋은 숙소였습니다.",
];

function makeReviews(seed) {
  const names = ["하준", "Emma", "서연", "Liam", "도윤", "Olivia", "지우", "Noah"];
  return Array.from({ length: 4 }).map((_, i) => ({
    id: `${seed}-r${i}`,
    author: names[(seed + i) % names.length],
    avatar: `https://i.pravatar.cc/80?u=${seed}-${i}`,
    date: ["2025년 3월", "2025년 1월", "2024년 12월", "2024년 10월"][i],
    rating: 5 - (i % 2 === 0 ? 0 : 0),
    text: REVIEW_TEXTS[(seed + i) % REVIEW_TEXTS.length],
  }));
}

const RAW = [
  {
    title: "오션뷰 통유리 풀빌라",
    city: "제주특별자치도, 한국",
    type: "전체 빌라",
    cats: ["beach", "pool", "design"],
    price: 285000,
    rating: 4.97,
    reviews: 128,
    beds: 3, baths: 2, guests: 6,
    lat: 33.45, lng: 126.57,
    images: ["1564013799919-ab600027ffc6", "1566073771259-6a8506099945", "1505693416388-ac5ce068fe85", "1502005229762-cf1b2da7c5d6", "1560448204-e02f11c3d0e2"],
  },
  {
    title: "도심 속 미니멀 디자인 아파트",
    city: "서울특별시, 한국",
    type: "아파트 전체",
    cats: ["city", "design"],
    price: 132000,
    rating: 4.89,
    reviews: 342,
    beds: 1, baths: 1, guests: 2,
    lat: 37.55, lng: 126.99,
    images: ["1522708323590-d24dbb6b0267", "1554995207-c18c203602cb", "1586023492125-27b2c045efd7", "1484154218962-a197022b5858", "1493809842364-78817add7ffb"],
  },
  {
    title: "숲속 통나무 캐빈 & 온수 욕조",
    city: "가평, 경기도, 한국",
    type: "통나무집 전체",
    cats: ["cabin", "mountain", "camping"],
    price: 198000,
    rating: 4.92,
    reviews: 89,
    beds: 2, baths: 1, guests: 4,
    lat: 37.83, lng: 127.51,
    images: ["1501785888041-af3ef285b470", "1449158743715-0a90ebb6d2d8", "1518732714860-b62714ce0c59", "1512917774080-9991f1c4c750", "1505691938895-1758d7feb511"],
  },
  {
    title: "전통 한옥 스테이, 북촌",
    city: "서울특별시, 한국",
    type: "한옥 전체",
    cats: ["hanok", "city", "design"],
    price: 175000,
    rating: 4.95,
    reviews: 210,
    beds: 2, baths: 1, guests: 4,
    lat: 37.58, lng: 126.98,
    images: ["1538485399081-7191377e8241", "1528360983277-13d401cdc186", "1600585154340-be6161a56a0c", "1600566753086-00f18fb6b3ea", "1600210492486-724fe5c67fb0"],
  },
  {
    title: "호수가 보이는 통창 별장",
    city: "춘천, 강원특별자치도, 한국",
    type: "별장 전체",
    cats: ["lake", "mountain", "cabin"],
    price: 224000,
    rating: 4.88,
    reviews: 76,
    beds: 3, baths: 2, guests: 6,
    lat: 37.88, lng: 127.73,
    images: ["1475275166152-f1e8005f9854", "1502672260266-1c1ef2d93688", "1520250497591-112f2f40a3f4", "1493809842364-78817add7ffb", "1560185007-cde436f6a4d0"],
  },
  {
    title: "감성 오션뷰 스튜디오",
    city: "부산광역시, 한국",
    type: "스튜디오 전체",
    cats: ["beach", "city", "design"],
    price: 118000,
    rating: 4.84,
    reviews: 156,
    beds: 1, baths: 1, guests: 2,
    lat: 35.16, lng: 129.16,
    images: ["1502672260266-1c1ef2d93688", "1505691938895-1758d7feb511", "1560448204-e02f11c3d0e2", "1522771739844-6a9f6d5f14af", "1571896349842-33c89424de2d"],
  },
  {
    title: "산토리니 클리프 하우스",
    city: "산토리니, 그리스",
    type: "전체 주택",
    cats: ["beach", "pool", "design"],
    price: 410000,
    rating: 4.99,
    reviews: 301,
    beds: 2, baths: 2, guests: 4,
    lat: 36.39, lng: 25.46,
    images: ["1469796466635-455ede028aca", "1570213489059-0aac6626cade", "1496318447583-f524534e9ce1", "1533105079780-92b9be482077", "1571003123894-1f0594d2b5d9"],
  },
  {
    title: "교토 마치야 정원 하우스",
    city: "교토, 일본",
    type: "전통 가옥 전체",
    cats: ["hanok", "city", "design"],
    price: 196000,
    rating: 4.93,
    reviews: 188,
    beds: 2, baths: 1, guests: 3,
    lat: 35.01, lng: 135.76,
    images: ["1545569341-9eb8b30979d9", "1480796927426-f609979314bd", "1503899036084-c55cdd92da26", "1493997181344-712f2f19d87a", "1522771739844-6a9f6d5f14af"],
  },
  {
    title: "알프스 스키 인앤아웃 샬레",
    city: "체르마트, 스위스",
    type: "샬레 전체",
    cats: ["ski", "mountain", "cabin"],
    price: 520000,
    rating: 4.96,
    reviews: 94,
    beds: 4, baths: 3, guests: 8,
    lat: 46.02, lng: 7.75,
    images: ["1502784444187-359ac186c5bb", "1551524559-8af4e6624178", "1520984032042-162d526b8b1d", "1518733057094-95b53143d2a7", "1454496522488-7a8e488e8606"],
  },
  {
    title: "발리 정글 인피니티 풀빌라",
    city: "우붓, 발리, 인도네시아",
    type: "빌라 전체",
    cats: ["pool", "mountain", "design"],
    price: 235000,
    rating: 4.91,
    reviews: 267,
    beds: 2, baths: 2, guests: 4,
    lat: -8.51, lng: 115.26,
    images: ["1537953773345-d172ccf13cf1", "1582719478250-c89cae4dc85b", "1540541338287-41700207dee6", "1571003123894-1f0594d2b5d9", "1584132967334-10e028bd69f7"],
  },
  {
    title: "감각적인 루프탑 펜트하우스",
    city: "뉴욕, 미국",
    type: "펜트하우스 전체",
    cats: ["city", "design", "pool"],
    price: 615000,
    rating: 4.87,
    reviews: 142,
    beds: 3, baths: 3, guests: 6,
    lat: 40.74, lng: -73.99,
    images: ["1502672260266-1c1ef2d93688", "1545324418-cc1a3fa10c00", "1493663284031-b7e3aefcae8e", "1560448204-e02f11c3d0e2", "1554995207-c18c203602cb"],
  },
  {
    title: "바다 앞 글램핑 돔",
    city: "고성, 강원특별자치도, 한국",
    type: "돔 텐트 전체",
    cats: ["camping", "beach", "mountain"],
    price: 142000,
    rating: 4.8,
    reviews: 64,
    beds: 1, baths: 1, guests: 2,
    lat: 38.38, lng: 128.46,
    images: ["1504280390367-361c6d9f38f4", "1537905569824-f89f14cceb68", "1455496231601-e3f89020f6a1", "1510312305653-8ed496efae75", "1496545672447-f699b503d270"],
  },
];

export const listings = RAW.map((r, idx) => {
  const host = HOSTS[idx % HOSTS.length];
  const amenities = AMENITIES.filter((_, i) => (idx + i) % 2 === 0).slice(0, 9);
  return {
    id: `gl-${idx + 1}`,
    ...r,
    images: r.images.map((id) => img(id)),
    thumb: img(r.images[0], 700),
    host,
    superhost: host.superhost,
    amenities,
    reviewsList: makeReviews(idx + 1),
    description:
      "달콤한 휴식을 위한 공간, 젤라또 라이프에서 엄선한 숙소입니다. " +
      "넓은 창으로 햇살이 가득 들어오고, 정성껏 준비한 어메니티로 편안한 머무름을 약속합니다. " +
      "체크인은 셀프로 간편하게 진행되며, 주변에는 카페와 맛집이 가득합니다.",
    cleaningFee: 35000,
    serviceFeeRate: 0.12,
  };
});

export function getListing(id) {
  return listings.find((l) => l.id === id);
}

export function searchListings({ q, category } = {}) {
  let result = listings;
  if (category && category !== "all") {
    result = result.filter((l) => l.cats.includes(category));
  }
  if (q) {
    const t = q.trim().toLowerCase();
    result = result.filter(
      (l) =>
        l.title.toLowerCase().includes(t) ||
        l.city.toLowerCase().includes(t) ||
        l.type.toLowerCase().includes(t)
    );
  }
  return result;
}
