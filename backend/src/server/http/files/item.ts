import "server-only";

import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getCustomerFilesCollection, getMongoClient } from "@/server/database/mongodb";
import { getRequestUser, isSameOriginRequest } from "@/server/auth/request-auth";
import { deleteR2Object, deleteR2ObjectParts } from "@/server/files/r2";
import {
  notifyStorageQuotaChanged,
  releaseDailyUpload,
  releaseStorageReservation,
  releaseUsedStorage,
} from "@/server/files/storage-quota";

type RouteContext = { params: Promise<{ fileId: string }> };

export async function DELETE(request: Request, context: RouteContext) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Origem da solicitação inválida." }, { status: 403 });
  }
  const user = await getRequestUser(request);
  if (!user) return NextResponse.json({ error: "Entre na sua conta para excluir arquivos." }, { status: 401 });

  const { fileId } = await context.params;
  if (!ObjectId.isValid(fileId)) {
    return NextResponse.json({ error: "Arquivo não encontrado." }, { status: 404 });
  }

  const id = new ObjectId(fileId);
  const files = await getCustomerFilesCollection();
  const staleCutoff = new Date(Date.now() - 15 * 60 * 1000);
  await files.updateOne(
    { _id: id, ownerUserId: user.id, status: "uploading", updatedAt: { $lt: staleCutoff } },
    { $set: { status: "pending", updatedAt: new Date() } },
  );

  const snapshot = await files.findOne({ _id: id, ownerUserId: user.id });
  if (!snapshot || snapshot.status === "deleted") {
    return NextResponse.json({ error: "Arquivo não encontrado." }, { status: 404 });
  }
  if (snapshot.status === "uploading") {
    return NextResponse.json({ error: "Aguarde a conclusão do envio antes de excluir." }, { status: 409 });
  }

  const now = new Date();
  for (const part of snapshot.parts) {
    if (part.status !== "receiving" || !part.leaseExpiresAt || part.leaseExpiresAt >= now) continue;
    await files.updateOne(
      {
        _id: id,
        ownerUserId: user.id,
        status: "pending",
        parts: {
          $elemMatch: {
            partNumber: part.partNumber,
            status: "receiving",
            leaseExpiresAt: { $lt: now },
          },
        },
      },
      {
        $set: { "parts.$.status": "pending", updatedAt: now },
        $unset: { "parts.$.leaseToken": "", "parts.$.leaseExpiresAt": "" },
      },
    );
  }

  const marked = await files.updateOne(
    {
      _id: id,
      ownerUserId: user.id,
      status: { $in: ["pending", "ready", "deleting"] },
      parts: { $not: { $elemMatch: { status: "receiving" } } },
    },
    { $set: { status: "deleting", updatedAt: new Date() } },
  );
  if (marked.matchedCount !== 1) {
    return NextResponse.json({ error: "Há uma parte sendo enviada. Tente novamente ao terminar." }, { status: 409 });
  }

  try {
    await Promise.all([
      deleteR2Object(snapshot.objectKey),
      deleteR2ObjectParts(snapshot.objectKey, snapshot.partCount),
    ]);
  } catch {
    await files.updateOne(
      { _id: id, ownerUserId: user.id, status: "deleting" },
      {
        $set: {
          status: snapshot.quotaState === "reserved" ? "pending" : "ready",
          updatedAt: new Date(),
        },
      },
    );
    return NextResponse.json({ error: "Não foi possível excluir o arquivo do armazenamento." }, { status: 502 });
  }

  const session = getMongoClient().startSession();
  try {
    await session.withTransaction(async () => {
      const updated = await files.updateOne(
        { _id: id, ownerUserId: user.id, status: "deleting" },
        {
          $set: {
            status: "deleted",
            quotaState: "released",
            reservedBytes: 0,
            updatedAt: new Date(),
          },
        },
        { session },
      );
      if (updated.modifiedCount !== 1) throw new Error("FILE_STATE_CHANGED");
      if (snapshot.quotaState === "reserved") {
        await releaseStorageReservation(snapshot.reservedBytes, session);
        await releaseDailyUpload(user.id, snapshot.uploadDay, session);
      } else if (snapshot.quotaState === "used") {
        await releaseUsedStorage(snapshot.sizeBytes, session);
      } else {
        throw new Error("QUOTA_STATE_CHANGED");
      }
    });
    await notifyStorageQuotaChanged().catch(() => undefined);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Não foi possível excluir o arquivo." }, { status: 503 });
  } finally {
    await session.endSession();
  }
}
