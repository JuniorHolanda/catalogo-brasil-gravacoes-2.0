import "server-only";
import { MongoClient, MongoServerError, type Collection } from "mongodb";
import type { CustomerSubmission } from "@/lib/customer-validation";

export type CustomerRecord = CustomerSubmission & {
  status: "new" | "contacted" | "converted" | "archived";
  createdAt: Date;
  updatedAt: Date;
};

export type CustomerFileRecord = {
  ownerUserId: string;
  objectKey: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  reservedBytes: number;
  uploadDay: string;
  partCount: number;
  parts: Array<{
    partNumber: number;
    objectKey: string;
    sizeBytes: number;
    status: "pending" | "receiving" | "ready";
    leaseToken?: string;
    leaseExpiresAt?: Date;
  }>;
  quotaState: "reserved" | "used" | "released";
  status: "pending" | "uploading" | "ready" | "deleting" | "deleted";
  createdAt: Date;
  updatedAt: Date;
};

export type CustomerQuoteRecord = {
  ownerUserId: string;
  number: string;
  serviceSlug: string;
  serviceName: string;
  requestType: "automatic" | "whatsapp";
  product: string;
  quantity: number;
  logoWidthMm: number;
  logoHeightMm: number;
  colorCount: number;
  customerFileId?: string;
  status: "awaiting" | "producing" | "problem";
  createdAt: Date;
  updatedAt: Date;
};

export type R2StorageQuotaRecord = {
  _id: "global";
  status: "initializing" | "ready";
  usedBytes: number;
  reservedBytes: number;
  initializedAt?: Date;
  updatedAt: Date;
  initToken?: string;
  lockExpiresAt?: Date;
};

export type CustomerFileDailyUsageRecord = {
  _id: string;
  ownerUserId: string;
  day: string;
  count: number;
  expiresAt: Date;
};

export type StorageAlertRecord = {
  _id: "r2-5gb" | "r2-9gb";
  thresholdBytes: number;
  usedBytes: number;
  status: "pending" | "sending" | "sent";
  createdAt: Date;
  sentAt?: Date;
  sendingUntil?: Date;
};

declare global {
  // Reuse the connection pool across Next.js hot reloads in development.
  var _brasilGravacoesMongoClientPromise: Promise<MongoClient> | undefined;
  var _brasilGravacoesMongoClient: MongoClient | undefined;
  var _brasilGravacoesCustomersCollectionPromise:
    | Promise<Collection<CustomerRecord>>
    | undefined;
  var _brasilGravacoesCustomerFilesCollectionPromise:
    | Promise<Collection<CustomerFileRecord>>
    | undefined;
  var _brasilGravacoesCustomerQuotesCollectionPromise:
    | Promise<Collection<CustomerQuoteRecord>>
    | undefined;
  var _brasilGravacoesR2StorageQuotaCollectionPromise:
    | Promise<Collection<R2StorageQuotaRecord>>
    | undefined;
  var _brasilGravacoesCustomerFileDailyUsageCollectionPromise:
    | Promise<Collection<CustomerFileDailyUsageRecord>>
    | undefined;
  var _brasilGravacoesStorageAlertsCollectionPromise:
    | Promise<Collection<StorageAlertRecord>>
    | undefined;
}

export function getMongoClient(): MongoClient {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI não está configurada no ambiente do servidor.");
  }

  if (!global._brasilGravacoesMongoClient) {
    global._brasilGravacoesMongoClient = new MongoClient(uri, {
      serverSelectionTimeoutMS: 8000,
    });
  }

  return global._brasilGravacoesMongoClient;
}

export function getMongoDatabase() {
  return getMongoClient().db(process.env.MONGODB_DB || "brasil-gravacoes");
}

function getMongoClientPromise(): Promise<MongoClient> {
  if (!global._brasilGravacoesMongoClientPromise) {
    global._brasilGravacoesMongoClientPromise = getMongoClient()
      .connect()
      .catch((error: unknown) => {
        global._brasilGravacoesMongoClientPromise = undefined;
        throw error;
      });
  }

  return global._brasilGravacoesMongoClientPromise;
}

export async function getCustomersCollection(): Promise<Collection<CustomerRecord>> {
  if (!global._brasilGravacoesCustomersCollectionPromise) {
    global._brasilGravacoesCustomersCollectionPromise = (async () => {
      const client = await getMongoClientPromise();
      const database = client.db(process.env.MONGODB_DB || "brasil-gravacoes");
      const name = "customers";

      try {
        await database.createCollection<CustomerRecord>(name, {
          validator: {
            $jsonSchema: {
              bsonType: "object",
              required: [
                "name",
                "company",
                "phone",
                "mobile",
                "cnpj",
                "title",
                "message",
                "status",
                "createdAt",
                "updatedAt",
              ],
              properties: {
                name: { bsonType: "string", maxLength: 120 },
                company: { bsonType: "string", maxLength: 160 },
                phone: { bsonType: "string", maxLength: 15 },
                mobile: { bsonType: "string", maxLength: 15 },
                cnpj: { bsonType: "string", maxLength: 14 },
                title: { bsonType: "string", maxLength: 160 },
                message: { bsonType: "string", maxLength: 3000 },
                status: {
                  enum: ["new", "contacted", "converted", "archived"],
                },
                createdAt: { bsonType: "date" },
                updatedAt: { bsonType: "date" },
              },
            },
          },
          validationLevel: "strict",
          validationAction: "error",
        });
      } catch (error) {
        // The collection may already exist, for example after an earlier request.
        if (!(error instanceof MongoServerError) || error.code !== 48) throw error;
      }

      const collection = database.collection<CustomerRecord>(name);
      await collection.createIndex({ createdAt: -1 }, { name: "customers_created_at" });
      return collection;
    })().catch((error: unknown) => {
      global._brasilGravacoesCustomersCollectionPromise = undefined;
      throw error;
    });
  }

  return global._brasilGravacoesCustomersCollectionPromise;
}

export async function getCustomerFilesCollection(): Promise<Collection<CustomerFileRecord>> {
  if (!global._brasilGravacoesCustomerFilesCollectionPromise) {
    global._brasilGravacoesCustomerFilesCollectionPromise = (async () => {
      const client = await getMongoClientPromise();
      const database = client.db(process.env.MONGODB_DB || "brasil-gravacoes");
      const name = "customerFiles";

      try {
        await database.createCollection<CustomerFileRecord>(name, {
          validator: {
            $jsonSchema: {
              bsonType: "object",
              required: [
                "ownerUserId",
                "objectKey",
                "fileName",
                "contentType",
                "sizeBytes",
                "reservedBytes",
                "uploadDay",
                "partCount",
                "parts",
                "status",
                "quotaState",
                "createdAt",
                "updatedAt",
              ],
              properties: {
                ownerUserId: { bsonType: "string", maxLength: 128 },
                objectKey: { bsonType: "string", maxLength: 512 },
                fileName: { bsonType: "string", maxLength: 180 },
                contentType: { bsonType: "string", maxLength: 120 },
                sizeBytes: { bsonType: ["int", "long"], minimum: 1 },
                reservedBytes: { bsonType: ["int", "long"], minimum: 0 },
                uploadDay: { bsonType: "string", maxLength: 10 },
                partCount: { bsonType: "int", minimum: 1, maximum: 2 },
                parts: {
                  bsonType: "array",
                  minItems: 1,
                  maxItems: 2,
                  items: {
                    bsonType: "object",
                    required: ["partNumber", "objectKey", "sizeBytes", "status"],
                    properties: {
                      partNumber: { bsonType: "int", minimum: 0, maximum: 1 },
                      objectKey: { bsonType: "string", maxLength: 512 },
                      sizeBytes: { bsonType: ["int", "long"], minimum: 1 },
                      status: { enum: ["pending", "receiving", "ready"] },
                      leaseToken: { bsonType: "string", maxLength: 64 },
                      leaseExpiresAt: { bsonType: "date" },
                    },
                  },
                },
                quotaState: { enum: ["reserved", "used", "released"] },
                status: { enum: ["pending", "uploading", "ready", "deleting", "deleted"] },
                createdAt: { bsonType: "date" },
                updatedAt: { bsonType: "date" },
              },
            },
          },
          validationLevel: "strict",
          validationAction: "error",
        });
      } catch (error) {
        if (!(error instanceof MongoServerError) || error.code !== 48) throw error;
      }

      const collection = database.collection<CustomerFileRecord>(name);
      await Promise.all([
        collection.createIndex(
          { ownerUserId: 1, createdAt: -1 },
          { name: "customer_files_by_owner_and_date" },
        ),
        collection.createIndex({ objectKey: 1 }, { name: "customer_files_object_key", unique: true }),
      ]);
      return collection;
    })().catch((error: unknown) => {
      global._brasilGravacoesCustomerFilesCollectionPromise = undefined;
      throw error;
    });
  }

  return global._brasilGravacoesCustomerFilesCollectionPromise;
}

export async function getCustomerQuotesCollection(): Promise<Collection<CustomerQuoteRecord>> {
  if (!global._brasilGravacoesCustomerQuotesCollectionPromise) {
    global._brasilGravacoesCustomerQuotesCollectionPromise = getMongoClientPromise()
      .then(async (client) => {
        const collection = client
          .db(process.env.MONGODB_DB || "brasil-gravacoes")
          .collection<CustomerQuoteRecord>("customerQuotes");
        await Promise.all([
          collection.createIndex(
            { ownerUserId: 1, createdAt: -1 },
            { name: "customer_quotes_by_owner_and_date" },
          ),
          collection.createIndex({ number: 1 }, { name: "customer_quote_number", unique: true }),
        ]);
        return collection;
      })
      .catch((error: unknown) => {
        global._brasilGravacoesCustomerQuotesCollectionPromise = undefined;
        throw error;
      });
  }

  return global._brasilGravacoesCustomerQuotesCollectionPromise;
}

export async function getR2StorageQuotaCollection(): Promise<Collection<R2StorageQuotaRecord>> {
  if (!global._brasilGravacoesR2StorageQuotaCollectionPromise) {
    global._brasilGravacoesR2StorageQuotaCollectionPromise = getMongoClientPromise()
      .then((client) => client.db(process.env.MONGODB_DB || "brasil-gravacoes")
        .collection<R2StorageQuotaRecord>("r2StorageQuota"))
      .catch((error: unknown) => {
        global._brasilGravacoesR2StorageQuotaCollectionPromise = undefined;
        throw error;
      });
  }

  return global._brasilGravacoesR2StorageQuotaCollectionPromise;
}

export async function getCustomerFileDailyUsageCollection(): Promise<Collection<CustomerFileDailyUsageRecord>> {
  if (!global._brasilGravacoesCustomerFileDailyUsageCollectionPromise) {
    global._brasilGravacoesCustomerFileDailyUsageCollectionPromise = (async () => {
      const client = await getMongoClientPromise();
      const collection = client.db(process.env.MONGODB_DB || "brasil-gravacoes")
        .collection<CustomerFileDailyUsageRecord>("customerFileDailyUsage");
      await collection.createIndex(
        { expiresAt: 1 },
        { name: "customer_file_daily_usage_ttl", expireAfterSeconds: 0 },
      );
      return collection;
    })().catch((error: unknown) => {
      global._brasilGravacoesCustomerFileDailyUsageCollectionPromise = undefined;
      throw error;
    });
  }

  return global._brasilGravacoesCustomerFileDailyUsageCollectionPromise;
}

export async function getStorageAlertsCollection(): Promise<Collection<StorageAlertRecord>> {
  if (!global._brasilGravacoesStorageAlertsCollectionPromise) {
    global._brasilGravacoesStorageAlertsCollectionPromise = getMongoClientPromise()
      .then((client) => client.db(process.env.MONGODB_DB || "brasil-gravacoes")
        .collection<StorageAlertRecord>("storageAlerts"))
      .catch((error: unknown) => {
        global._brasilGravacoesStorageAlertsCollectionPromise = undefined;
        throw error;
      });
  }

  return global._brasilGravacoesStorageAlertsCollectionPromise;
}
