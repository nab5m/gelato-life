import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { FavoritesProvider } from "@/context/FavoritesContext";
import { LocaleProvider } from "@/context/LocaleContext";

export const metadata = {
  title: "젤라또 라이프 — 어디서든 달콤한 머무름",
  description:
    "젤라또 라이프에서 전 세계의 특별한 숙소를 찾아보고 예약하세요. 달콤한 여행의 시작.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body className="font-sans antialiased">
        <LocaleProvider>
          <AuthProvider>
            <FavoritesProvider>{children}</FavoritesProvider>
          </AuthProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
