"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, User as UserIcon } from "lucide-react";
import Logo from "@/components/Logo";
import { useAuth } from "@/context/AuthContext";

export default function SignupPage() {
  const { signup } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", pw: "", agree: false });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) =>
    setForm((f) => ({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.agree) return;
    setError(null);
    setLoading(true);
    try {
      await signup({ name: form.name, email: form.email, password: form.pw });
      router.push("/reservations");
    } catch (err) {
      setError(String(err.message || err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-mint-50 via-cream to-gelato-50 px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-gray-100 bg-white p-8 shadow-card animate-fade-in">
        <div className="mb-6 flex flex-col items-center text-center">
          <Logo size={44} />
          <h1 className="mt-4 text-2xl font-bold text-gray-900">
            젤라또 라이프에 오신 걸 환영해요
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            계정을 만들고 첫 여행을 떠나보세요.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
              이름
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                required
                value={form.name}
                onChange={set("name")}
                placeholder="홍길동"
                className="input pl-10"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
              이메일
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="email"
                required
                value={form.email}
                onChange={set("email")}
                placeholder="you@gelato.life"
                className="input pl-10"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
              비밀번호
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="password"
                required
                value={form.pw}
                onChange={set("pw")}
                placeholder="8자 이상 입력"
                className="input pl-10"
              />
            </div>
          </div>

          <label className="flex items-start gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={form.agree}
              onChange={set("agree")}
              className="mt-0.5 rounded text-gelato-500"
            />
            <span>
              <span className="font-semibold text-gray-800">이용약관</span> 및{" "}
              <span className="font-semibold text-gray-800">개인정보 처리방침</span>에
              동의합니다.
            </span>
          </label>

          {error && (
            <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>
          )}

          <button type="submit" disabled={!form.agree || loading} className="btn-primary w-full">
            {loading ? "가입 중…" : "가입하기"}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3 text-xs text-gray-400">
          <span className="h-px flex-1 bg-gray-200" />
          또는
          <span className="h-px flex-1 bg-gray-200" />
        </div>

        <div className="space-y-2.5">
          <button className="btn-outline w-full">
            <span className="text-lg">🇬</span> Google로 가입하기
          </button>
          <button className="btn-outline w-full">
            <span className="text-lg">🍎</span> Apple로 가입하기
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-gray-600">
          이미 계정이 있으신가요?{" "}
          <Link href="/login" className="font-semibold text-gelato-600 hover:underline">
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}
