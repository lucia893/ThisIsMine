import { randomUUID } from "crypto";
import fs from "fs/promises";
import multer from "multer";
import path from "path";
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { config } from "./config";

const localUploadsDir = path.join(__dirname, "../uploads");

function sanitizeFileName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9.-]+/g, "-").toLowerCase();
}

function buildObjectKey(originalName: string): string {
  const safeName = sanitizeFileName(originalName);
  return `posts/${new Date().toISOString().slice(0, 10)}/${randomUUID()}-${safeName}`;
}

const s3Client = config.storage.enabled
  ? new S3Client({
      region: config.storage.region,
      endpoint: config.storage.endpoint,
      credentials: {
        accessKeyId: config.storage.accessKeyId,
        secretAccessKey: config.storage.secretAccessKey,
      },
      forcePathStyle: false,
    })
  : null;

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: config.maxUploadSizeMb * 1024 * 1024,
  },
  fileFilter: (_req, file, callback) => {
    if (!file.mimetype.startsWith("image/")) {
      callback(new Error("Only image uploads are allowed."));
      return;
    }

    callback(null, true);
  },
});

export function getStorageMode() {
  return config.storage.enabled ? "object-storage" : "local";
}

export async function saveImage(file?: Express.Multer.File | null) {
  if (!file) {
    return null;
  }

  const objectKey = buildObjectKey(file.originalname);

  if (config.storage.enabled && s3Client) {
    await s3Client.send(
      new PutObjectCommand({
        Bucket: config.storage.bucketName,
        Key: objectKey,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    return {
      imageUrl: `${config.storage.publicBaseUrl}/${objectKey}`,
      imageKey: objectKey,
    };
  }

  await fs.mkdir(localUploadsDir, { recursive: true });
  const localFileName = objectKey.replace(/\//g, "-");
  const filePath = path.join(localUploadsDir, localFileName);
  await fs.writeFile(filePath, file.buffer);

  return {
    imageUrl: `${config.backendPublicUrl}/uploads/${localFileName}`,
    imageKey: localFileName,
  };
}

export async function removeImage(imageKey?: string | null) {
  if (!imageKey) {
    return;
  }

  if (config.storage.enabled && s3Client) {
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: config.storage.bucketName,
        Key: imageKey,
      }),
    );
    return;
  }

  const filePath = path.join(localUploadsDir, imageKey);
  await fs.rm(filePath, { force: true });
}

export function getLocalUploadsDir() {
  return localUploadsDir;
}
