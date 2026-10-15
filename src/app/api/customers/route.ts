import { NextResponse } from "next/server";
import { validateCustomerSubmission } from "@/lib/customer-validation";
import { getCustomersCollection } from "@/lib/mongodb";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return NextResponse.json(
      { error: "O cadastro deve ser enviado em JSON." },
      { status: 415 },
    );
  }

  let body: unknown;

  try {
    const rawBody = await request.text();
    if (rawBody.length > 12_000) {
      return NextResponse.json({ error: "O cadastro excede o tamanho permitido." }, { status: 413 });
    }
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "O corpo da solicitação não é um JSON válido." }, { status: 400 });
  }

  const validation = validateCustomerSubmission(body);
  if (!validation.success) {
    return NextResponse.json(
      { error: "Confira os campos do cadastro.", fields: validation.errors },
      { status: 400 },
    );
  }

  try {
    const now = new Date();
    const result = await (await getCustomersCollection()).insertOne({
      ...validation.value,
      status: "new",
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json({ id: result.insertedId.toString() }, { status: 201 });
  } catch {
    // Avoid logging submitted personal data or connection details.
    console.error("Falha ao salvar cadastro de cliente no MongoDB.");
    return NextResponse.json(
      { error: "Não foi possível salvar seu cadastro agora. Tente novamente mais tarde." },
      { status: 500 },
    );
  }
}
