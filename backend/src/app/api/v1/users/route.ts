import { NextResponse } from "next/server";
import { getAuth } from "@/server/auth/auth";
import { getRequestUser, isAdminUser, isSameOriginRequest } from "@/server/auth/request-auth";

export async function GET(request: Request) {
  const user = await getRequestUser(request);
  if (!user) return NextResponse.json({ error: "Entre na sua conta para continuar." }, { status: 401 });
  if (!isAdminUser(user)) return NextResponse.json({ error: "Acesso restrito à administração." }, { status: 403 });

  const url = new URL(request.url);
  const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit")) || 25));
  const offset = Math.max(0, Number(url.searchParams.get("offset")) || 0);
  const query: Record<string, string | number> = { limit, offset };
  const search = url.searchParams.get("search")?.trim();
  if (search) {
    query.searchValue = search;
    query.searchField = search.includes("@") ? "email" : "name";
    query.searchOperator = "contains";
  }

  try {
    const result = await getAuth().api.listUsers({ headers: request.headers, query });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Não foi possível listar os usuários." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return NextResponse.json({ error: "Origem da solicitação inválida." }, { status: 403 });
  const user = await getRequestUser(request);
  if (!user) return NextResponse.json({ error: "Entre na sua conta para continuar." }, { status: 401 });
  if (!isAdminUser(user)) return NextResponse.json({ error: "Acesso restrito à administração." }, { status: 403 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Envie um JSON válido." }, { status: 400 });
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Informe os dados do usuário." }, { status: 400 });
  }
  const input = body as Record<string, unknown>;
  const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
  const name = typeof input.name === "string" ? input.name.trim() : "";
  const password = typeof input.password === "string" ? input.password : "";
  const companyName = typeof input.companyName === "string" ? input.companyName.trim() : "";
  if (!/^\S+@\S+\.\S+$/.test(email) || name.length < 1 || name.length > 120 || password.length < 8 || password.length > 128) {
    return NextResponse.json({ error: "Informe e-mail válido, nome e senha entre 8 e 128 caracteres." }, { status: 400 });
  }

  try {
    const result = await getAuth().api.createUser({
      headers: request.headers,
      body: {
        email,
        name,
        password,
        role: input.role === "admin" ? "admin" : "user",
        data: companyName ? { companyName } : {},
      },
    });
    return NextResponse.json(result, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Não foi possível criar o usuário. O e-mail pode já estar cadastrado." }, { status: 409 });
  }
}
