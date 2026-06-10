// Google Maps JavaScript API 로더. 스크립트를 1회만 주입하고 promise 를 공유한다.
"use client";

let loaderPromise = null;

export function loadGoogleMaps(apiKey) {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  if (window.google?.maps) return Promise.resolve(window.google.maps);
  if (loaderPromise) return loaderPromise;

  loaderPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
      apiKey
    )}&v=quarterly&language=ko&region=KR`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google?.maps) resolve(window.google.maps);
      else reject(new Error("google.maps 로드 실패"));
    };
    script.onerror = () => reject(new Error("Google Maps 스크립트 로드 실패"));
    document.head.appendChild(script);
  });
  return loaderPromise;
}
