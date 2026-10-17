import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "img.clerk.com" },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  // 루트(/)는 Research Aspirant 랜딩(public/landing.html)을 서비스한다.
  async rewrites() {
    return { beforeFiles: [{ source: "/", destination: "/landing.html" }] };
  },
  async headers() {
    // v4(감사 Medium): 전역 CORS `*` 제거. 자격증명 기반 관리자 API 와 함께
    // 쓰일 때 위험하므로 허용 출처를 화이트리스트로 제한한다.
    // ALLOWED_ORIGINS(콤마 구분) 미설정 시 앱 자체 출처만 허용.
    const allowed =
      (process.env.ALLOWED_ORIGINS ||
        process.env.NEXT_PUBLIC_APP_URL ||
        "http://localhost:3000")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)[0] || "http://localhost:3000";
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: allowed },
          { key: "Vary", value: "Origin" },
          { key: "Access-Control-Allow-Methods", value: "GET,POST,PUT,DELETE,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
        ],
      },
    ];
  },
};

export default nextConfig;
