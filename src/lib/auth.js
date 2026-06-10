// 인증 유틸 (서버 전용). 외부 의존성 없이 Node crypto 로 구현.
//  - 비밀번호: scrypt 해시 ("salt:hash")
//  - 세션: HMAC 서명 쿠키 토큰 "userId.exp.sig"
import crypto from "crypto";

export const SESSION_COOKIE = "gl_session";
const SESSION_TTL_SEC = 60 * 60 * 24 * 14; // 14일

function secret() {
  return process.env.AUTH_SECRET || "dev-insecure-auth-secret-change-me";
}

// --- 비밀번호 ---
export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(String(password), salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password, stored) {
  if (!stored || !stored.includes(":")) return false;
  const [salt, hash] = stored.split(":");
  const cand = crypto.scryptSync(String(password), salt, 64).toString("hex");
  const a = Buffer.from(cand, "hex");
  const b = Buffer.from(hash, "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// --- 세션 토큰 ---
function sign(value) {
  return crypto.createHmac("sha256", secret()).update(value).digest("base64url");
}

export function createSessionToken(userId, ttlSec = SESSION_TTL_SEC) {
  const exp = Math.floor(Date.now() / 1000) + ttlSec;
  const value = `${userId}.${exp}`;
  return `${value}.${sign(value)}`;
}

export function verifySessionToken(token) {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [userId, exp, sig] = parts;
  if (sign(`${userId}.${exp}`) !== sig) return null;
  if (Number(exp) < Math.floor(Date.now() / 1000)) return null;
  return userId;
}

// request(NextRequest) 에서 로그인 유저 id 추출. 없으면 null.
export function getUserIdFromRequest(request) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  return verifySessionToken(token);
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  path: "/",
  maxAge: SESSION_TTL_SEC,
  secure: process.env.NODE_ENV === "production",
};
