import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  experimental: {
    agentFeedback: true,
  },
  compiler: {
    styledComponents: true,
  },
  reactCompiler: true,
  async rewrites() {
    const apiURL = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === "development" ? "http://localhost:4000" : "");
    if (!apiURL) throw new Error("Configure NEXT_PUBLIC_API_URL com a origem da API no Render.");
    const upstream = new URL(apiURL);
    if (!['http:', 'https:'].includes(upstream.protocol) || upstream.username || upstream.password || upstream.pathname !== '/' || upstream.search || upstream.hash) {
      throw new Error("NEXT_PUBLIC_API_URL deve conter apenas a origem HTTP(S) da API, sem credenciais ou caminhos.");
    }
    // Keep session cookies on the site's origin. Business logic remains in Render.
    return [
      { source: "/api/auth/:path*", destination: `${upstream.origin}/api/auth/:path*` },
      { source: "/api/v1/:path*", destination: `${upstream.origin}/api/v1/:path*` },
      { source: "/api/health", destination: `${upstream.origin}/api/health` },
    ];
  },
  /** Define cabeçalhos de segurança para as respostas da aplicação. */
  async headers() {
    const securityHeaders = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    ];

    if (process.env.NODE_ENV === "production") {
      securityHeaders.push({
        key: "Strict-Transport-Security",
        value: "max-age=31536000",
      });
    }

    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
