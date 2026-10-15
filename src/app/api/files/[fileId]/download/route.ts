import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getCustomerFilesCollection } from "@/lib/mongodb";
import { getRequestUser } from "@/lib/request-auth";
import { createR2DownloadUrl } from "@/lib/r2";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ fileId: string }> };

export async function GET(request: Request, context: RouteContext) {
  const user = await getRequestUser(request);
  if (!user) return NextResponse.json({ error: "Entre na sua conta para baixar arquivos." }, { status: 401 });

  const { fileId } = await context.params;
  if (!ObjectId.isValid(fileId)) {
    return NextResponse.json({ error: "Arquivo não encontrado." }, { status: 404 });
  }

  try {
    const file = await (await getCustomerFilesCollection()).findOne({
      _id: new ObjectId(fileId),
      ownerUserId: user.id,
      status: "ready",
    });
    if (!file) return NextResponse.json({ error: "Arquivo não encontrado." }, { status: 404 });

    const url = await createR2DownloadUrl(file.objectKey, file.fileName);
    return NextResponse.json({ url });
  } catch {
    return NextResponse.json({ error: "Não foi possível preparar o download." }, { status: 503 });
  }
}
