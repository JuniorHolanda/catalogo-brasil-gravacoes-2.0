import type { NextConfig } from "next";

const apiURL = process.env.API_URL
  || (process.env.API_HOSTPORT ? `http://${process.env.API_HOSTPORT}` : "")
  || process.env.NEXT_PUBLIC_API_URL
  || (process.env.NODE_ENV === "development" ? "http://localhost:4000" : "");

if (!apiURL) {
  throw new Error("Configure API_URL com a origem da API no Render.");
}

const upstream = new URL(apiURL);
if (!["http:", "https:"].includes(upstream.protocol)
  || upstream.username
  || upstream.password
  || upstream.pathname !== "/"
  || upstream.search
  || upstream.hash) {
  throw new Error("API_URL deve conter apenas a origem HTTP(S) da API, sem credenciais ou caminhos.");
}

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compiler: { styledComponents: true },
  reactCompiler: true,
  async rewrites() {
    return [
      { source: "/api/auth/:path*", destination: `${upstream.origin}/api/auth/:path*` },
      { source: "/api/v1/:path*", destination: `${upstream.origin}/api/v1/:path*` },
      { source: "/api/health", destination: `${upstream.origin}/api/health` },
    ];
  },
  async headers() {
    return [{ source: "/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }] }];
  },
};

export default nextConfig;
