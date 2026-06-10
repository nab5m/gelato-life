export default function Logo({ size = 34, withText = true }) {
  return (
    <span className="inline-flex items-center gap-2 select-none">
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <defs>
          <linearGradient id="scoop1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ff9dc0" />
            <stop offset="1" stopColor="#f93f86" />
          </linearGradient>
          <linearGradient id="scoop2" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#94eedd" />
            <stop offset="1" stopColor="#19c3b2" />
          </linearGradient>
        </defs>
        {/* 콘 */}
        <path
          d="M17 25 L24 45 L31 25 Z"
          fill="#e7b07a"
          stroke="#c98f4f"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        <path d="M19 29 L29 29" stroke="#c98f4f" strokeWidth="1" />
        <path d="M21 34 L27 34" stroke="#c98f4f" strokeWidth="1" />
        {/* 아래 스쿱 (민트) */}
        <circle cx="24" cy="22" r="10" fill="url(#scoop2)" />
        {/* 위 스쿱 (스트로베리) */}
        <circle cx="24" cy="13" r="8.5" fill="url(#scoop1)" />
        {/* 체리 */}
        <circle cx="24" cy="5.5" r="2.6" fill="#e51f6e" />
        <path
          d="M24 4 C 25 2, 27 2, 27.5 3.5"
          stroke="#0f8f86"
          strokeWidth="1.4"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
      {withText && (
        <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-gelato-500 to-mint-500 bg-clip-text text-transparent">
          gelato life
        </span>
      )}
    </span>
  );
}
