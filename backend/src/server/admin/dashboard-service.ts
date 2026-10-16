import "server-only";

import {
  getCustomerFilesCollection,
  getStorageAlertsCollection,
} from "@/server/database/mongodb";
import {
  getStorageQuota,
  notifyStorageQuotaChanged,
  STORAGE_HARD_LIMIT_BYTES,
} from "@/server/files/storage-quota";

export async function getAdminDashboardData() {
  await notifyStorageQuotaChanged().catch(() => undefined);
  const [quota, files, alerts] = await Promise.all([
    getStorageQuota(),
    getCustomerFilesCollection(),
    getStorageAlertsCollection(),
  ]);
  const [fileCount, storageAlerts] = await Promise.all([
    files.countDocuments({ status: "ready" }),
    alerts.find().sort({ createdAt: -1 }).toArray(),
  ]);

  return {
    quota,
    fileCount,
    storageAlerts,
    usagePercent: Math.min(100, quota.usedBytes / STORAGE_HARD_LIMIT_BYTES * 100),
  };
}
