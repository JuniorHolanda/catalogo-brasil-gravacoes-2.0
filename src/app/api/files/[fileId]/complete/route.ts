import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getCustomerFilesCollection, getMongoClient } from "@/lib/mongodb";
import { getRequestUser, isSameOriginRequest } from "@/lib/request-auth";
import {
  customerFilePartKey,
  deleteR2Object,
  deleteR2ObjectParts,
  getR2ObjectBytes,
  getR2ObjectMetadata,
  maybeGetR2ObjectMetadata,
  putR2Object,
} from "@/lib/r2";
import { notifyStorageQuotaChanged, settleStorageReservation } from "@/lib/storage-quota";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ fileId: string }> };

export async function POST(request: Request, context: RouteContext) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Origem da solicitação inválida." }, { status: 403 });
  }
  const user = await getRequestUser(request);
  if (!user) return NextResponse.json({ error: "Entre na sua conta para concluir o envio." }, { status: 401 });

  const { fileId } = await context.params;
  if (!ObjectId.isValid(fileId)) {
    return NextResponse.json({ error: "Arquivo não encontrado." }, { status: 404 });
  }

  const id = new ObjectId(fileId);
  const files = await getCustomerFilesCollection();
  const staleUploadCutoff = new Date(Date.now() - 15 * 60 * 1000);
  await files.updateOne(
    { _id: id, ownerUserId: user.id, status: "uploading", updatedAt: { $lt: staleUploadCutoff } },
    { $set: { status: "pending", updatedAt: new Date() } },
  );

  const file = await files.findOneAndUpdate(
    {
      _id: id,
      ownerUserId: user.id,
      status: "pending",
      partCount: { $gt: 0 },
      parts: { $not: { $elemMatch: { status: { $ne: "ready" } } } },
    },
    { $set: { status: "uploading", updatedAt: new Date() } },
    { returnDocument: "after" },
  );
  if (!file) {
    return NextResponse.json(
      { error: "Envie todas as partes do arquivo antes de concluir." },
      { status: 409 },
    );
  }

  const resetToPending = () => files.updateOne(
    { _id: id, ownerUserId: user.id, status: "uploading" },
    { $set: { status: "pending", updatedAt: new Date() } },
  );

  try {
    let finalObject = await maybeGetR2ObjectMetadata(file.objectKey);
    if (finalObject?.sizeBytes !== file.sizeBytes) {
      if (finalObject) await deleteR2Object(file.objectKey);
      if (file.parts.length !== file.partCount) throw new Error("PART_COUNT_MISMATCH");

      const chunks: Buffer[] = [];
      let assembledBytes = 0;
      for (let index = 0; index < file.partCount; index += 1) {
        const part = file.parts[index];
        const partKey = customerFilePartKey(file.objectKey, index);
        const metadata = await maybeGetR2ObjectMetadata(partKey);
        if (!part || part.partNumber !== index || part.status !== "ready" || metadata?.sizeBytes !== part.sizeBytes) {
          throw new Error("PART_MISSING_OR_INVALID");
        }
        const bytes = await getR2ObjectBytes(partKey);
        if (bytes.byteLength !== part.sizeBytes) throw new Error("PART_SIZE_MISMATCH");
        chunks.push(bytes);
        assembledBytes += bytes.byteLength;
      }

      if (assembledBytes !== file.sizeBytes) throw new Error("FILE_SIZE_MISMATCH");
      await putR2Object(
        file.objectKey,
        file.contentType,
        Buffer.concat(chunks, file.sizeBytes),
      );
      finalObject = await getR2ObjectMetadata(file.objectKey);
    }

    if (finalObject.sizeBytes !== file.sizeBytes) throw new Error("FINAL_SIZE_MISMATCH");
    await deleteR2ObjectParts(file.objectKey, file.partCount);

    const session = getMongoClient().startSession();
    try {
      await session.withTransaction(async () => {
        const updated = await files.updateOne(
          { _id: id, ownerUserId: user.id, status: "uploading" },
          {
            $set: {
              status: "ready",
              quotaState: "used",
              reservedBytes: 0,
              updatedAt: new Date(),
            },
          },
          { session },
        );
        if (updated.modifiedCount !== 1) throw new Error("FILE_STATE_CHANGED");
        await settleStorageReservation(file.reservedBytes, file.sizeBytes, session);
      });
    } finally {
      await session.endSession();
    }

    await notifyStorageQuotaChanged().catch(() => undefined);
    return NextResponse.json({ ok: true });
  } catch {
    await resetToPending().catch(() => undefined);
    return NextResponse.json(
      { error: "Não foi possível concluir o envio. Você pode tentar novamente." },
      { status: 503 },
    );
  }
}
