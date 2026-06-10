import Link from "next/link";
import Header from "./Header";
import Footer from "./Footer";

export default function ComingSoon({ emoji = "🍨", title, desc }) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
        <span className="text-6xl">{emoji}</span>
        <h1 className="mt-5 text-2xl font-bold text-gray-900">{title}</h1>
        <p className="mt-2 max-w-md text-gray-500">{desc}</p>
        <Link href="/" className="btn-primary mt-6">
          홈으로 돌아가기
        </Link>
      </main>
      <Footer />
    </div>
  );
}
