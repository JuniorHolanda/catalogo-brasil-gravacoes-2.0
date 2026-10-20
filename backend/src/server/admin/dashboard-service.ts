import "server-only";

import { ObjectId } from "mongodb";

import {
  getCustomerFilesCollection,
  getMongoDatabase,
  getQuotesCollection,
  getStorageAlertsCollection,
} from "@/server/database/mongodb";
import {
  getStorageQuota,
  notifyStorageQuotaChanged,
  STORAGE_HARD_LIMIT_BYTES,
} from "@/server/files/storage-quota";
import { isR2Configured } from "@/server/files/r2";

export async function getAdminDashboardData() {
  const r2Configured = isR2Configured();
  if (r2Configured) await notifyStorageQuotaChanged().catch(() => undefined);

  const [quota, files, alerts, quotes] = await Promise.all([
    r2Configured ? getStorageQuota().catch(() => null) : Promise.resolve(null),
    getCustomerFilesCollection(),
    getStorageAlertsCollection(),
    getQuotesCollection(),
  ]);
  const [fileCount, storageAlerts, quoteCount, quoteRecords, customerCount] = await Promise.all([
    files.countDocuments({ status: "ready" }),
    alerts.find().sort({ createdAt: -1 }).toArray(),
    quotes.countDocuments(),
    quotes.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .project({ ownerUserId: 1, number: 1, serviceName: 1, product: 1, quantity: 1, pricing: 1, customer: 1, status: 1, createdAt: 1, engravings: 1 })
      .toArray(),
    getMongoDatabase().collection("users").countDocuments({ role: { $ne: "admin" } }),
  ]);
  const ownerIds = [...new Set(quoteRecords.map((quote) => quote.ownerUserId))];
  const ownerObjectIds = ownerIds.flatMap((id) => ObjectId.isValid(id) ? [new ObjectId(id)] : []);
  const ownerIdQuery = ownerObjectIds.length > 0
    ? { $or: [{ _id: { $in: ownerObjectIds } }, { _id: { $in: ownerIds } }] }
    : { _id: { $in: ownerIds } };
  const users = await getMongoDatabase().collection("users")
    .find(ownerIdQuery)
    .project({ _id: 1, name: 1, email: 1 })
    .toArray();
  const usersById = new Map(users.map((user) => [String(user._id), user]));

  return {
    storageStatus: !r2Configured ? "missing-config" as const : quota ? "ready" as const : "unavailable" as const,
    quota: quota ? { usedBytes: quota.usedBytes, reservedBytes: quota.reservedBytes } : null,
    fileCount,
    storageAlerts,
    usagePercent: quota ? Math.min(100, quota.usedBytes / STORAGE_HARD_LIMIT_BYTES * 100) : 0,
    customerCount,
    quoteCount,
    quotes: quoteRecords.map((quote) => {
      const account = usersById.get(quote.ownerUserId);
      return {
        id: quote._id.toHexString(),
        number: quote.number,
        customerName: quote.customer?.name || "Cliente",
        accountEmail: typeof account?.email === "string" ? account.email : "",
        serviceName: quote.serviceName,
        product: quote.product,
        quantity: quote.quantity,
        pricing: quote.pricing,
        status: quote.status,
        createdAt: quote.createdAt,
        fileCount: quote.engravings?.filter((engraving: { customerFileId?: string }) => Boolean(engraving.customerFileId)).length ?? 0,
      };
    }),
  };
}
