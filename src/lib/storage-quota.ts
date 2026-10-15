import "server-only";
import { randomUUID } from "node:crypto";
import { MongoServerError, type ClientSession } from "mongodb";
import {
  getCustomerFileDailyUsageCollection,
  getR2StorageQuotaCollection,
  getStorageAlertsCollection,
  type R2StorageQuotaRecord,
  type StorageAlertRecord,
} from "@/lib/mongodb";
import { countR2StoredBytes } from "@/lib/r2";

export const MAX_CUSTOMER_FILE_BYTES = 5_000_000;
export const CUSTOMER_FILE_CHUNK_BYTES = 4_000_000;
export const MAX_DAILY_UPLOADS = 15;
export const STORAGE_WARNING_BYTES = 5_000_000_000;
export const STORAGE_HARD_LIMIT_BYTES = 9_000_000_000;

const quotaId = "global" as const;
const storageThresholds = [
  { id: "r2-5gb", bytes: STORAGE_WARNING_BYTES },
  { id: "r2-9gb", bytes: STORAGE_HARD_LIMIT_BYTES },
] as const;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getUploadDay(date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

/** Inicializa o contador pelo inventário atual e serializa a primeira inicialização. */
export async function getStorageQuota(): Promise<R2StorageQuotaRecord> {
  const collection = await getR2StorageQuotaCollection();

  for (let attempt = 0; attempt < 100; attempt += 1) {
    const current = await collection.findOne({ _id: quotaId });
    if (current?.status === "ready") return current;

    const now = new Date();
    const initToken = randomUUID();
    let acquired = false;

    if (!current) {
      try {
        await collection.insertOne({
          _id: quotaId,
          status: "initializing",
          usedBytes: 0,
          reservedBytes: 0,
          updatedAt: now,
          initToken,
          lockExpiresAt: new Date(now.getTime() + 120_000),
        });
        acquired = true;
      } catch (error) {
        if (!(error instanceof MongoServerError) || error.code !== 11000) throw error;
      }
    } else if (!current.lockExpiresAt || current.lockExpiresAt <= now) {
      const lock = await collection.updateOne(
        { _id: quotaId, status: "initializing", lockExpiresAt: current.lockExpiresAt },
        {
          $set: {
            initToken,
            lockExpiresAt: new Date(now.getTime() + 120_000),
            updatedAt: now,
          },
        },
      );
      acquired = lock.modifiedCount === 1;
    }

    if (!acquired) {
      await delay(200);
      continue;
    }

    try {
      const usedBytes = await countR2StoredBytes();
      await collection.updateOne(
        { _id: quotaId, status: "initializing", initToken },
        {
          $set: {
            status: "ready",
            usedBytes,
            reservedBytes: 0,
            initializedAt: new Date(),
            updatedAt: new Date(),
          },
          $unset: { initToken: "", lockExpiresAt: "" },
        },
      );
      const readyQuota = await collection.findOne({ _id: quotaId, status: "ready" });
      if (readyQuota) {
        await notifyStorageQuotaChanged().catch(() => undefined);
        return readyQuota;
      }
    } catch (error) {
      await collection.deleteOne({ _id: quotaId, status: "initializing", initToken });
      throw error;
    }
  }

  throw new Error("O controle de armazenamento está inicializando. Tente novamente em instantes.");
}

export async function reserveStorage(bytes: number): Promise<boolean> {
  const collection = await getR2StorageQuotaCollection();
  await getStorageQuota();
  const result = await collection.updateOne(
    {
      _id: quotaId,
      status: "ready",
      $expr: {
        $lte: [
          { $add: ["$usedBytes", "$reservedBytes", bytes] },
          STORAGE_HARD_LIMIT_BYTES,
        ],
      },
    },
    { $inc: { reservedBytes: bytes }, $set: { updatedAt: new Date() } },
  );
  if (result.modifiedCount === 1) {
    const quota = await collection.findOne({ _id: quotaId, status: "ready" });
    if (quota) {
      await queueStorageThresholdAlerts(quota).catch(() => undefined);
      await sendPendingStorageAlerts().catch(() => undefined);
    }
    return true;
  }
  return false;
}

export async function settleStorageReservation(
  reservedBytes: number,
  usedBytes: number,
  session?: ClientSession,
): Promise<void> {
  const collection = await getR2StorageQuotaCollection();
  const result = await collection.updateOne(
    { _id: quotaId, status: "ready", reservedBytes: { $gte: reservedBytes } },
    {
      $inc: { reservedBytes: -reservedBytes, usedBytes },
      $set: { updatedAt: new Date() },
    },
    { session },
  );
  if (result.modifiedCount !== 1) throw new Error("A reserva de armazenamento não foi encontrada.");
}

export async function releaseStorageReservation(
  bytes: number,
  session?: ClientSession,
): Promise<void> {
  const collection = await getR2StorageQuotaCollection();
  const result = await collection.updateOne(
    { _id: quotaId, status: "ready", reservedBytes: { $gte: bytes } },
    { $inc: { reservedBytes: -bytes }, $set: { updatedAt: new Date() } },
    { session },
  );
  if (result.modifiedCount !== 1) throw new Error("A reserva de armazenamento não foi encontrada.");
}

export async function releaseUsedStorage(
  bytes: number,
  session?: ClientSession,
): Promise<void> {
  const collection = await getR2StorageQuotaCollection();
  const result = await collection.updateOne(
    { _id: quotaId, status: "ready", usedBytes: { $gte: bytes } },
    { $inc: { usedBytes: -bytes }, $set: { updatedAt: new Date() } },
    { session },
  );
  if (result.modifiedCount !== 1) throw new Error("O uso do arquivo não foi encontrado no contador.");
}

export async function reserveDailyUpload(ownerUserId: string) {
  const collection = await getCustomerFileDailyUsageCollection();
  const now = new Date();
  const day = getUploadDay(now);
  const id = `${ownerUserId}:${day}`;

  try {
    const result = await collection.updateOne(
      { _id: id, count: { $lt: MAX_DAILY_UPLOADS } },
      {
        $inc: { count: 1 },
        $setOnInsert: {
          ownerUserId,
          day,
          expiresAt: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000),
        },
      },
      { upsert: true },
    );
    return result.modifiedCount === 1 || result.upsertedCount === 1 ? day : null;
  } catch (error) {
    if (error instanceof MongoServerError && error.code === 11000) return null;
    throw error;
  }
}

export async function releaseDailyUpload(
  ownerUserId: string,
  day: string,
  session?: ClientSession,
): Promise<void> {
  const collection = await getCustomerFileDailyUsageCollection();
  await collection.updateOne(
    { _id: `${ownerUserId}:${day}`, count: { $gt: 0 } },
    { $inc: { count: -1 } },
    { session },
  );
}

export async function getDailyUploadCount(ownerUserId: string): Promise<number> {
  const collection = await getCustomerFileDailyUsageCollection();
  const day = getUploadDay();
  const record = await collection.findOne({ _id: `${ownerUserId}:${day}` });
  return record?.count ?? 0;
}

export async function notifyStorageQuotaChanged(): Promise<void> {
  const quota = await getStorageQuota();
  await queueStorageThresholdAlerts(quota);
  await sendPendingStorageAlerts();
}

async function queueStorageThresholdAlerts(quota: R2StorageQuotaRecord) {
  const totalBytes = quota.usedBytes;
  const collection = await getStorageAlertsCollection();
  const now = new Date();

  for (const threshold of storageThresholds) {
    if (totalBytes < threshold.bytes) continue;
    const alert: StorageAlertRecord = {
      _id: threshold.id,
      thresholdBytes: threshold.bytes,
      usedBytes: totalBytes,
      status: "pending",
      createdAt: now,
    };
    try {
      await collection.insertOne(alert);
    } catch (error) {
      if (!(error instanceof MongoServerError) || error.code !== 11000) throw error;
    }
  }
}

/** Envia alertas pendentes quando Resend e um remetente verificado estiverem configurados. */
export async function sendPendingStorageAlerts(): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.STORAGE_ALERT_FROM;
  if (!apiKey || !from) return;

  const collection = await getStorageAlertsCollection();
  const pending = await collection.find({ status: { $in: ["pending", "sending"] } }).toArray();
  for (const candidate of pending) {
    const now = new Date();
    const alert = await collection.findOneAndUpdate(
      {
        _id: candidate._id,
        $or: [
          { status: "pending" },
          { status: "sending", sendingUntil: { $lt: now } },
        ],
      },
      {
        $set: {
          status: "sending",
          sendingUntil: new Date(now.getTime() + 2 * 60 * 1000),
        },
      },
      { returnDocument: "after" },
    );
    if (!alert) continue;

    const isLimit = alert._id === "r2-9gb";
    const thresholdLabel = isLimit ? "9 GB (limite atingido)" : "5 GB";
    const subject = isLimit
      ? "Uploads bloqueados: armazenamento R2 atingiu o limite"
      : "Aviso: armazenamento R2 atingiu 5 GB";
    const text = isLimit
      ? `O armazenamento do Cloudflare R2 atingiu ${thresholdLabel}. Novos uploads foram bloqueados. Uso registrado: ${formatStorage(alert.usedBytes)}.`
      : `O armazenamento do Cloudflare R2 atingiu ${thresholdLabel}. Planeje a limpeza ou ampliação do repositório. Uso registrado: ${formatStorage(alert.usedBytes)}.`;

    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "Idempotency-Key": `brasil-gravacoes-${alert._id}`,
        },
        body: JSON.stringify({
          from,
          to: ["juniorholanda@outlook.com"],
          subject,
          text,
        }),
        signal: AbortSignal.timeout(5_000),
      });
      if (!response.ok) {
        await collection.updateOne(
          { _id: alert._id, status: "sending" },
          { $set: { status: "pending" }, $unset: { sendingUntil: "" } },
        );
        continue;
      }
      await collection.updateOne(
        { _id: alert._id, status: "sending" },
        {
          $set: { status: "sent", sentAt: new Date() },
          $unset: { sendingUntil: "" },
        },
      );
    } catch {
      await collection.updateOne(
        { _id: alert._id, status: "sending" },
        { $set: { status: "pending" }, $unset: { sendingUntil: "" } },
      ).catch(() => undefined);
    }
  }
}

export function formatStorage(bytes: number): string {
  return `${(bytes / 1_000_000_000).toFixed(2)} GB`;
}
