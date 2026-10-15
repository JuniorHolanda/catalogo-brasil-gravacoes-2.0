import { MAX_CUSTOMER_FILE_BYTES } from "@/lib/storage-quota";

const allowedExtensions: Record<string, string> = {
  jpg: "image/jpeg",
  svg: "image/svg+xml",
  cdr: "application/octet-stream",
  pdf: "application/pdf",
  png: "image/png",
};

export function validateCustomerFileInput(fileName: unknown, sizeBytes: unknown) {
  if (typeof fileName !== "string" || typeof sizeBytes !== "number") return null;

  const normalizedName = fileName
    .replace(/\\/g, "/")
    .split("/")
    .pop()
    ?.replace(/[\u0000-\u001f\u007f]/g, "")
    .trim();
  if (!normalizedName || normalizedName.length > 180) return null;

  const extension = normalizedName.split(".").pop()?.toLowerCase();
  if (!extension || !Object.hasOwn(allowedExtensions, extension)) return null;
  if (!Number.isSafeInteger(sizeBytes) || sizeBytes < 1 || sizeBytes > MAX_CUSTOMER_FILE_BYTES) {
    return null;
  }

  return {
    fileName: normalizedName,
    sizeBytes,
    extension,
    contentType: allowedExtensions[extension],
  };
}

export async function readBodyWithLimit(request: Request, maxBytes: number): Promise<Buffer> {
  if (!request.body) throw new Error("EMPTY_BODY");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > maxBytes) {
        await reader.cancel();
        throw new Error("FILE_TOO_LARGE");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  return Buffer.concat(chunks.map((chunk) => Buffer.from(chunk)), totalBytes);
}
