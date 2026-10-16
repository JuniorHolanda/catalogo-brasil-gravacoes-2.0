import "server-only";

import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { getCustomerFilesCollection } from "@/server/database/mongodb";
import { getRequestUser, isSameOriginRequest } from "@/server/auth/request-auth";
import { readBodyWithLimit, validateCustomerFileInput } from "@/server/files/customer-files";
import {
  CUSTOMER_FILE_CHUNK_BYTES,
  getDailyUploadCount,
  MAX_DAILY_UPLOADS,
  reserveDailyUpload,
  reserveStorage,
  releaseDailyUpload,
  releaseStorageReservation,
} from "@/server/files/storage-quota";

export async function GET(request: Request) {
  const user = await getRequestUser(request);
  if (!user) return NextResponse.json({ error: "Entre na sua conta para ver seus arquivos." }, { status: 401 });

  try {
    const filesCollection = await getCustomerFilesCollection();
    const staleUploadCutoff = new Date(Date.now() - 15 * 60 * 1000);
    await filesCollection.updateMany(
      { ownerUserId: user.id, status: "uploading", updatedAt: { $lt: staleUploadCutoff } },
      { $set: { status: "pending", updatedAt: new Date() } },
    );
    const [files, dailyUploads] = await Promise.all([
      filesCollection
        .find({ ownerUserId: user.id, status: { $in: ["ready", "pending", "uploading", "deleting"] } })
        .sort({ createdAt: -1 })
        .limit(100)
        .toArray(),
      getDailyUploadCount(user.id),
    ]);

    return NextResponse.json({
      files: files.map((file) => ({
        id: file._id?.toString(),
        fileName: file.fileName,
        contentType: file.contentType,
        sizeBytes: file.sizeBytes,
        status: file.status,
        canComplete: file.status === "pending" &&
          file.parts.length === file.partCount &&
          file.parts.every((part) => part.status === "ready"),
        createdAt: file.createdAt.toISOString(),
      })),
      dailyUploads,
      dailyLimit: MAX_DAILY_UPLOADS,
    });
  } catch {
    return NextResponse.json({ error: "Não foi possível carregar seus arquivos." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Origem da solicitação inválida." }, { status: 403 });
  }

  const user = await getRequestUser(request);
  if (!user) return NextResponse.json({ error: "Entre na sua conta para enviar arquivos." }, { status: 401 });

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 8_192) {
    return NextResponse.json({ error: "Os dados do arquivo são inválidos." }, { status: 413 });
  }

  let payload: unknown;
  try {
    const body = await readBodyWithLimit(request, 8_192);
    payload = JSON.parse(body.toString("utf8"));
  } catch {
    return NextResponse.json({ error: "Os dados do arquivo são inválidos." }, { status: 400 });
  }

  const input = payload as { fileName?: unknown; sizeBytes?: unknown } | null;
  const file = validateCustomerFileInput(input?.fileName, input?.sizeBytes);
  if (!file) {
    return NextResponse.json(
      { error: "Envie JPG, SVG, CDR, PDF ou PNG com até 5 MB." },
      { status: 400 },
    );
  }

  let uploadDay: string | null = null;
  let storageReserved = false;
  const reservedBytes = file.sizeBytes * 2;
  try {
    uploadDay = await reserveDailyUpload(user.id);
    if (!uploadDay) {
      return NextResponse.json(
        { error: "Você atingiu o limite de 15 arquivos enviados hoje." },
        { status: 429 },
      );
    }

    storageReserved = await reserveStorage(reservedBytes);
    if (!storageReserved) {
      await releaseDailyUpload(user.id, uploadDay);
      return NextResponse.json(
        { error: "O armazenamento atingiu o limite de 9 GB. Novos envios foram bloqueados." },
        { status: 507 },
      );
    }

    const now = new Date();
    const objectId = randomUUID();
    const objectKey = `users/${user.id}/${objectId}.${file.extension}`;
    const partCount = Math.ceil(file.sizeBytes / CUSTOMER_FILE_CHUNK_BYTES);
    const parts = Array.from({ length: partCount }, (_, partNumber) => {
      const start = partNumber * CUSTOMER_FILE_CHUNK_BYTES;
      const sizeBytes = Math.min(CUSTOMER_FILE_CHUNK_BYTES, file.sizeBytes - start);
      return {
        partNumber,
        objectKey: `${objectKey}.parts/${partNumber}`,
        sizeBytes,
        status: "pending" as const,
      };
    });
    const filesCollection = await getCustomerFilesCollection();
    const result = await filesCollection.insertOne({
      ownerUserId: user.id,
      objectKey,
      fileName: file.fileName,
      contentType: file.contentType,
      sizeBytes: file.sizeBytes,
      reservedBytes,
      uploadDay,
      partCount,
      parts,
      quotaState: "reserved",
      status: "pending",
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json(
      { id: result.insertedId.toString(), partSize: CUSTOMER_FILE_CHUNK_BYTES, partCount },
      { status: 201 },
    );
  } catch {
    const releases: Promise<unknown>[] = [];
    if (storageReserved) releases.push(releaseStorageReservation(reservedBytes));
    if (uploadDay) releases.push(releaseDailyUpload(user.id, uploadDay));
    await Promise.allSettled(releases);
    return NextResponse.json(
      { error: "Não foi possível reservar espaço para o arquivo. Tente novamente." },
      { status: 503 },
    );
  }
}
