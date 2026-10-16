import { NextResponse, type NextRequest } from "next/server";

function allowedOrigins() {
  return (process.env.FRONTEND_ORIGINS || "http://localhost:3000,http://127.0.0.1:3000")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function corsHeaders(origin: string) {
  return {
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

export function middleware(request: NextRequest) {
  const origin = request.headers.get("origin");
  const matchesOrigin = origin ? allowedOrigins().includes(origin) : false;

  if (origin && !matchesOrigin) {
    return NextResponse.json({ error: "Origem não autorizada." }, { status: 403 });
  }

  if (request.method === "OPTIONS") {
    if (!origin || !matchesOrigin) {
      return NextResponse.json({ error: "Origem não autorizada." }, { status: 403 });
    }
    return new NextResponse(null, { status: 204, headers: corsHeaders(origin) });
  }

  const response = NextResponse.next();
  if (origin && matchesOrigin) {
    for (const [key, value] of Object.entries(corsHeaders(origin))) response.headers.set(key, value);
  }
  return response;
}

export const config = { matcher: ["/api/:path*"] };
