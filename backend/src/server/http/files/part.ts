import "server-only";

import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { ObjectId } from "mongodb";
import { getCustomerFilesCollection } from "@/server/database/mongodb";
import { readBodyWithLimit } from "@/server/files/customer-files";
import { getRequestUser, isSameOriginRequest } from "@/server/auth/request-auth";
import { getR2ObjectMetadata, putR2Object } from "@/server/files/r2";

type RouteContext = { params: Promise<{ fileId: string; partNumber: string }> };

export async function PUT(request: Request, context: RouteContext) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Origem da solicitação inválida." }, { status: 403 });
  }
  const user = await getRequestUser(request);
  if (!user) return NextResponse.json({ error: "Entre na sua conta para enviar arquivos." }, { status: 401 });

  const { fileId, partNumber: partNumberText } = await context.params;
  const partNumber = Number(partNumberText);
  if (!ObjectId.isValid(fileId) || !Number.isInteger(partNumber) || partNumber < 0 || partNumber > 1) {
    return NextResponse.json({ error: "Parte do arquivo não encontrada." }, { status: 404 });
  }

  const files = await getCustomerFilesCollection();
  const file = await files.findOne({
    _id: new ObjectId(fileId),
    ownerUserId: user.id,
    status: "pending",
  });
  const part = file?.parts[partNumber];
  if (!file || !part || part.partNumber !== partNumber) {
    return NextResponse.json({ error: "Parte do arquivo não encontrada." }, { status: 404 });
  }

  const declaredLength = request.headers.get("content-length");
  if (declaredLength && Number(declaredLength) !== part.sizeBytes) {
    return NextResponse.json({ error: "O tamanho da parte não corresponde ao esperado." }, { status: 400 });
  }

  const leaseToken = randomUUID();
  const now = new Date();
  const claim = await files.updateOne(
    {
      _id: file._id,
      ownerUserId: user.id,
      status: "pending",
      parts: {
        $elemMatch: {
          partNumber,
          $or: [
            { status: { $in: ["pending", "ready"] } },
            { status: "receiving", leaseExpiresAt: { $lt: now } },
          ],
        },
      },
    },
    {
      $set: {
        "parts.$.status": "receiving",
        "parts.$.leaseToken": leaseToken,
        "parts.$.leaseExpiresAt": new Date(now.getTime() + 15 * 60 * 1000),
        updatedAt: now,
      },
    },
  );
  if (claim.modifiedCount !== 1) {
    return NextResponse.json({ error: "Esta parte já está sendo enviada." }, { status: 409 });
  }

  const releaseClaim = () => files.updateOne(
    {
      _id: file._id,
      ownerUserId: user.id,
      status: "pending",
      parts: { $elemMatch: { partNumber, leaseToken, status: "receiving" } },
    },
    {
      $set: { "parts.$.status": "pending", updatedAt: new Date() },
      $unset: { "parts.$.leaseToken": "", "parts.$.leaseExpiresAt": "" },
    },
  );

  let body: Buffer;
  try {
    body = await readBodyWithLimit(request, part.sizeBytes);
  } catch (error) {
    await releaseClaim();
    const tooLarge = error instanceof Error && error.message === "FILE_TOO_LARGE";
    return NextResponse.json(
      { error: tooLarge ? "A parte ultrapassa o tamanho permitido." : "A parte enviada está vazia ou incompleta." },
      { status: tooLarge ? 413 : 400 },
    );
  }

  if (body.byteLength !== part.sizeBytes) {
    await releaseClaim();
    return NextResponse.json({ error: "O tamanho real da parte não corresponde ao esperado." }, { status: 400 });
  }

  try {
    await putR2Object(part.objectKey, "application/octet-stream", body);
    const metadata = await getR2ObjectMetadata(part.objectKey);
    if (metadata.sizeBytes !== part.sizeBytes) throw new Error("PART_SIZE_MISMATCH");

    const saved = await files.updateOne(
      {
        _id: file._id,
        ownerUserId: user.id,
        status: "pending",
        parts: { $elemMatch: { partNumber, leaseToken, status: "receiving" } },
      },
      {
        $set: { "parts.$.status": "ready", updatedAt: new Date() },
        $unset: { "parts.$.leaseToken": "", "parts.$.leaseExpiresAt": "" },
      },
    );
    if (saved.modifiedCount !== 1) throw new Error("PART_CLAIM_EXPIRED");
    return NextResponse.json({ ok: true });
  } catch {
    await releaseClaim().catch(() => undefined);
    return NextResponse.json({ error: "Não foi possível armazenar esta parte. Tente novamente." }, { status: 503 });
  }
}
