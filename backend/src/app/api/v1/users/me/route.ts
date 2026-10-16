import { NextResponse } from "next/server";
import { getRequestUser, isSameOriginRequest } from "@/server/auth/request-auth";
import { getMongoDatabase } from "@/server/database/mongodb";

export async function GET(request: Request) {
  const user = await getRequestUser(request);
  if (!user) return NextResponse.json({ error: "Entre na sua conta para continuar." }, { status: 401 });
  return NextResponse.json({ user });
}

export async function PATCH(request: Request) {
  if (!isSameOriginRequest(request)) return NextResponse.json({ error: "Origem da solicitação inválida." }, { status: 403 });
  const user = await getRequestUser(request);
  if (!user) return NextResponse.json({ error: "Entre na sua conta para continuar." }, { status: 401 });

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Envie um JSON válido." }, { status: 400 });
  }
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return NextResponse.json({ error: "Envie os campos que deseja atualizar." }, { status: 400 });
  }

  const body = payload as Record<string, unknown>;
  const updates: Record<string, string | Date> = { updatedAt: new Date() };
  if (body.name !== undefined) {
    if (typeof body.name !== "string" || !body.name.trim() || body.name.trim().length > 120) {
      return NextResponse.json({ error: "O nome deve ter de 1 a 120 caracteres." }, { status: 400 });
    }
    updates.name = body.name.trim();
  }
  if (body.companyName !== undefined) {
    if (typeof body.companyName !== "string" || body.companyName.trim().length > 160) {
      return NextResponse.json({ error: "A empresa deve ter no máximo 160 caracteres." }, { status: 400 });
    }
    updates.companyName = body.companyName.trim();
  }
  delete updates.updatedAt;
  if (Object.keys(updates).length === 0) return NextResponse.json({ error: "Nenhum campo válido foi enviado." }, { status: 400 });
  updates.updatedAt = new Date();

  try {
    await getMongoDatabase().collection("users").updateOne(
      { email: user.email },
      { $set: updates },
    );
    return NextResponse.json({ user: { ...user, ...updates } });
  } catch {
    return NextResponse.json({ error: "Não foi possível atualizar seu perfil." }, { status: 503 });
  }
}
