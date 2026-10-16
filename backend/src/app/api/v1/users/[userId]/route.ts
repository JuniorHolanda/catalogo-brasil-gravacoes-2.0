import { NextResponse } from "next/server";
import { getAuth } from "@/server/auth/auth";
import { getRequestUser, isAdminUser, isSameOriginRequest } from "@/server/auth/request-auth";

type RouteContext = { params: Promise<{ userId: string }> };

async function adminAccess(request: Request) {
  const user = await getRequestUser(request);
  if (!user) return { user: null, response: NextResponse.json({ error: "Entre na sua conta para continuar." }, { status: 401 }) };
  if (!isAdminUser(user)) return { user: null, response: NextResponse.json({ error: "Acesso restrito à administração." }, { status: 403 }) };
  return { user, response: null };
}

export async function GET(request: Request, context: RouteContext) {
  const access = await adminAccess(request);
  if (access.response) return access.response;
  try {
    const result = await getAuth().api.getUser({
      headers: request.headers,
      query: { id: (await context.params).userId },
    });
    return NextResponse.json({ user: result });
  } catch {
    return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  if (!isSameOriginRequest(request)) return NextResponse.json({ error: "Origem da solicitação inválida." }, { status: 403 });
  const access = await adminAccess(request);
  if (access.response) return access.response;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Envie um JSON válido." }, { status: 400 });
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Informe os campos que deseja atualizar." }, { status: 400 });
  }
  const input = body as Record<string, unknown>;
  const data: Record<string, string> = {};
  if (input.name !== undefined) {
    if (typeof input.name !== "string" || !input.name.trim() || input.name.trim().length > 120) {
      return NextResponse.json({ error: "O nome deve ter de 1 a 120 caracteres." }, { status: 400 });
    }
    data.name = input.name.trim();
  }
  if (input.email !== undefined) {
    if (typeof input.email !== "string" || !/^\S+@\S+\.\S+$/.test(input.email.trim())) {
      return NextResponse.json({ error: "Informe um e-mail válido." }, { status: 400 });
    }
    data.email = input.email.trim().toLowerCase();
  }
  if (input.companyName !== undefined) {
    if (typeof input.companyName !== "string" || input.companyName.trim().length > 160) {
      return NextResponse.json({ error: "A empresa deve ter no máximo 160 caracteres." }, { status: 400 });
    }
    data.companyName = input.companyName.trim();
  }
  if (!Object.keys(data).length && input.role === undefined) {
    return NextResponse.json({ error: "Nenhum campo válido foi enviado." }, { status: 400 });
  }

  try {
    const targetUserId = (await context.params).userId;
    if (Object.keys(data).length) {
      await getAuth().api.adminUpdateUser({
        headers: request.headers,
        body: { userId: targetUserId, data },
      });
    }
    if (input.role !== undefined) {
      if (input.role !== "admin" && input.role !== "user") {
        return NextResponse.json({ error: "O perfil deve ser user ou admin." }, { status: 400 });
      }
      await getAuth().api.setRole({
        headers: request.headers,
        body: { userId: targetUserId, role: input.role },
      });
    }
    const updated = await getAuth().api.getUser({ headers: request.headers, query: { id: targetUserId } });
    return NextResponse.json({ user: updated });
  } catch {
    return NextResponse.json({ error: "Não foi possível atualizar o usuário." }, { status: 400 });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  if (!isSameOriginRequest(request)) return NextResponse.json({ error: "Origem da solicitação inválida." }, { status: 403 });
  const access = await adminAccess(request);
  if (access.response) return access.response;
  const userId = (await context.params).userId;
  if (userId === access.user?.id) return NextResponse.json({ error: "Você não pode excluir sua própria conta administrativa." }, { status: 409 });
  try {
    const target = await getAuth().api.getUser({ headers: request.headers, query: { id: userId } });
    const protectedAdmins = (process.env.ADMIN_EMAILS || "")
      .split(",").map((email) => email.trim().toLowerCase()).filter(Boolean);
    if (protectedAdmins.includes(target.email.toLowerCase())) {
      return NextResponse.json({ error: "Este administrador principal não pode ser excluído por aqui." }, { status: 409 });
    }
    await getAuth().api.removeUser({ headers: request.headers, body: { userId } });
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: "Não foi possível excluir o usuário." }, { status: 400 });
  }
}
