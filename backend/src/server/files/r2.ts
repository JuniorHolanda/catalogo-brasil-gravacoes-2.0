import "server-only";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

type R2Config = {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
};

declare global {
  var _brasilGravacoesR2Client: S3Client | undefined;
}

export function getR2Config(): R2Config {
  const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID?.trim();
  const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY?.trim();
  const bucketName = process.env.CLOUDFLARE_R2_BUCKET?.trim();

  if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
    throw new Error("As variáveis do Cloudflare R2 não estão configuradas no servidor.");
  }

  return { accountId, accessKeyId, secretAccessKey, bucketName };
}

export function isR2Configured(): boolean {
  return Boolean(
    process.env.CLOUDFLARE_R2_ACCOUNT_ID?.trim()
    && process.env.CLOUDFLARE_R2_ACCESS_KEY_ID?.trim()
    && process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY?.trim()
    && process.env.CLOUDFLARE_R2_BUCKET?.trim(),
  );
}

export function getR2Client(): S3Client {
  if (!global._brasilGravacoesR2Client) {
    const { accountId, accessKeyId, secretAccessKey } = getR2Config();

    global._brasilGravacoesR2Client = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey },
    });
  }

  return global._brasilGravacoesR2Client;
}

export async function putR2Object(
  objectKey: string,
  contentType: string,
  body: Buffer,
) {
  const { bucketName } = getR2Config();
  await getR2Client().send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
      ContentType: contentType,
      ContentLength: body.byteLength,
      Body: body,
    }),
  );
}

export async function getR2ObjectMetadata(objectKey: string) {
  const { bucketName } = getR2Config();
  const result = await getR2Client().send(
    new HeadObjectCommand({ Bucket: bucketName, Key: objectKey }),
  );

  return {
    sizeBytes: result.ContentLength,
    contentType: result.ContentType,
  };
}

export async function maybeGetR2ObjectMetadata(objectKey: string) {
  try {
    return await getR2ObjectMetadata(objectKey);
  } catch (error) {
    const statusCode = (error as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode;
    const name = (error as { name?: string }).name;
    if (statusCode === 404 || name === "NotFound" || name === "NoSuchKey") return null;
    throw error;
  }
}

export async function getR2ObjectBytes(objectKey: string): Promise<Buffer> {
  const { bucketName } = getR2Config();
  const result = await getR2Client().send(
    new GetObjectCommand({ Bucket: bucketName, Key: objectKey }),
  );
  if (!result.Body) throw new Error("O arquivo temporário não tem conteúdo.");
  return Buffer.from(await result.Body.transformToByteArray());
}

export async function deleteR2Object(objectKey: string): Promise<void> {
  const { bucketName } = getR2Config();
  await getR2Client().send(
    new DeleteObjectCommand({ Bucket: bucketName, Key: objectKey }),
  );
}

export function customerFilePartKey(objectKey: string, partNumber: number): string {
  return `${objectKey}.parts/${partNumber}`;
}

export async function deleteR2ObjectParts(objectKey: string, partCount: number): Promise<void> {
  await Promise.all(
    Array.from({ length: partCount }, (_, partNumber) =>
      deleteR2Object(customerFilePartKey(objectKey, partNumber)),
    ),
  );
}

export async function createR2DownloadUrl(objectKey: string, fileName: string) {
  const { bucketName } = getR2Config();
  const safeFileName = encodeURIComponent(fileName.replace(/[\r\n]/g, "_"));
  return getSignedUrl(
    getR2Client(),
    new GetObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
      ResponseContentDisposition: `attachment; filename*=UTF-8''${safeFileName}`,
      ResponseContentType: "application/octet-stream",
      ResponseCacheControl: "private, no-store",
    }),
    { expiresIn: 60 },
  );
}

/** Conta todos os objetos para inicializar o controle global de armazenamento. */
export async function countR2StoredBytes(): Promise<number> {
  const { bucketName } = getR2Config();
  let continuationToken: string | undefined;
  let totalBytes = 0;

  do {
    const page = await getR2Client().send(
      new ListObjectsV2Command({
        Bucket: bucketName,
        ContinuationToken: continuationToken,
      }),
    );
    totalBytes += (page.Contents ?? []).reduce((total, object) => total + (object.Size ?? 0), 0);
    continuationToken = page.IsTruncated ? page.NextContinuationToken : undefined;
  } while (continuationToken);

  return totalBytes;
}
