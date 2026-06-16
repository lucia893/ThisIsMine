import "dotenv/config";

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getOptionalNumber(name: string, fallback: number): number {
  const rawValue = process.env[name];
  if (!rawValue) {
    return fallback;
  }

  const parsedValue = Number(rawValue);
  return Number.isFinite(parsedValue) ? parsedValue : fallback;
}

function parseCorsOrigins(rawValue?: string): string[] {
  if (!rawValue) {
    return ["http://localhost:3000"];
  }

  return rawValue
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function getStorageConfig() {
  const endpoint = process.env.S3_ENDPOINT;
  const region = process.env.S3_REGION;
  const bucketName = process.env.S3_BUCKET_NAME;
  const accessKeyId = process.env.S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
  const publicBaseUrl = process.env.S3_PUBLIC_BASE_URL;

  const requiredValues = [
    endpoint,
    bucketName,
    accessKeyId,
    secretAccessKey,
    publicBaseUrl,
  ].filter(Boolean);

  // Allow local development with no object storage configured, even if
  // S3_REGION keeps its default placeholder value.
  if (requiredValues.length === 0) {
    return {
      enabled: false as const,
    };
  }

  if (requiredValues.length !== 5) {
    throw new Error(
      "S3 storage is partially configured. Set S3_ENDPOINT, S3_BUCKET_NAME, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, and S3_PUBLIC_BASE_URL, or leave them all empty.",
    );
  }

  return {
    enabled: true as const,
    endpoint: endpoint!,
    region: region || "auto",
    bucketName: bucketName!,
    accessKeyId: accessKeyId!,
    secretAccessKey: secretAccessKey!,
    publicBaseUrl: publicBaseUrl!.replace(/\/+$/, ""),
  };
}

const port = getOptionalNumber("PORT", 5000);

export const config = {
  nodeEnv: process.env.NODE_ENV || "development",
  port,
  databaseUrl: getRequiredEnv("DATABASE_URL"),
  backendPublicUrl:
    process.env.BACKEND_PUBLIC_URL || `http://localhost:${port}`,
  corsAllowedOrigins: parseCorsOrigins(process.env.CORS_ALLOWED_ORIGINS),
  maxUploadSizeMb: getOptionalNumber("MAX_UPLOAD_SIZE_MB", 8),
  storage: getStorageConfig(),
};
