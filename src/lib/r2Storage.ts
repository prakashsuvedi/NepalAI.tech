import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Universal environment accessor
const getEnv = (key: string): string => {
  if (typeof process !== 'undefined' && process.env?.[key]) {
    return process.env[key] || '';
  }
  return '';
};

const R2_ACCOUNT_ID = getEnv('R2_ACCOUNT_ID') || getEnv('CLOUDFLARE_ACCOUNT_ID') || '';
const R2_ACCESS_KEY_ID = getEnv('R2_ACCESS_KEY_ID') || '';
const R2_SECRET_ACCESS_KEY = getEnv('R2_SECRET_ACCESS_KEY') || '';
export const R2_BUCKET_NAME = getEnv('R2_BUCKET_NAME') || 'nepalai-commerce-media';
export const R2_PUBLIC_DOMAIN = getEnv('R2_PUBLIC_DOMAIN') || 'https://media.nepalai.tech';

export const isR2Configured = (): boolean => {
  return Boolean(
    R2_ACCOUNT_ID &&
    R2_ACCESS_KEY_ID &&
    R2_SECRET_ACCESS_KEY &&
    !R2_ACCOUNT_ID.includes('placeholder')
  );
};

// S3 Client configured for Cloudflare R2 ($0 egress fees)
export const getR2Client = (): S3Client | null => {
  if (!isR2Configured()) {
    return null;
  }

  return new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
  });
};

// Whitelisted MIME types for secure uploads
export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'application/pdf',
];

export const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15MB

/**
 * Generates an isolated, safe object storage key:
 * Format: tenants/{tenantId}/{folder}/{timestamp}-{randomId}.{ext}
 */
export function generateFileKey(
  filename: string,
  folder = 'general',
  tenantId = 'public'
): string {
  const sanitizedFilename = filename.toLowerCase().replace(/[^a-z0-9.]+/g, '-');
  const ext = sanitizedFilename.split('.').pop() || 'bin';
  const baseName = sanitizedFilename.slice(0, Math.max(0, sanitizedFilename.lastIndexOf('.'))) || 'file';
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);

  const cleanTenant = tenantId.replace(/[^a-z0-9_-]+/gi, '');
  const cleanFolder = folder.replace(/[^a-z0-9_-]+/gi, '');

  return `tenants/${cleanTenant}/${cleanFolder}/${timestamp}-${randomSuffix}-${baseName}.${ext}`;
}

/**
 * Returns the public CDN URL for an object key
 */
export function getPublicMediaUrl(key: string): string {
  const cleanDomain = R2_PUBLIC_DOMAIN.replace(/\/+$/, '');
  return `${cleanDomain}/${key}`;
}

/**
 * Generates a pre-signed PUT upload URL for direct browser-to-R2 upload
 */
export async function generatePresignedUploadUrl(params: {
  filename: string;
  contentType: string;
  folder?: string;
  tenantId?: string;
  expiresInSeconds?: number;
}): Promise<{
  uploadUrl: string;
  fileKey: string;
  publicUrl: string;
  isSimulated: boolean;
}> {
  const { filename, contentType, folder = 'uploads', tenantId = 'public', expiresInSeconds = 900 } = params;

  if (!ALLOWED_MIME_TYPES.includes(contentType)) {
    throw new Error(`Unsupported content type: ${contentType}. Allowed types: images (JPEG, PNG, WebP, SVG) and PDF.`);
  }

  const fileKey = generateFileKey(filename, folder, tenantId);
  const publicUrl = getPublicMediaUrl(fileKey);

  // If R2 credentials are not set, return simulated upload URL for local dev
  if (!isR2Configured()) {
    return {
      uploadUrl: `/api/storage/mock-upload?key=${encodeURIComponent(fileKey)}`,
      fileKey,
      publicUrl: `/api/storage/mock-media?key=${encodeURIComponent(fileKey)}`,
      isSimulated: true,
    };
  }

  const client = getR2Client();
  if (!client) {
    throw new Error('R2 client initialization failed.');
  }

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: fileKey,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(client, command, { expiresIn: expiresInSeconds });

  return {
    uploadUrl,
    fileKey,
    publicUrl,
    isSimulated: false,
  };
}

/**
 * Direct server-side upload of a Buffer (useful for OCR documents or server-generated invoices)
 */
export async function uploadBufferToR2(params: {
  buffer: Buffer;
  key: string;
  contentType: string;
}): Promise<{ success: boolean; publicUrl: string; fileKey: string }> {
  const { buffer, key, contentType } = params;
  const publicUrl = getPublicMediaUrl(key);

  if (!isR2Configured()) {
    // In standalone mode, acknowledge simulation
    return {
      success: true,
      publicUrl: `/api/storage/mock-media?key=${encodeURIComponent(key)}`,
      fileKey: key,
    };
  }

  const client = getR2Client();
  if (!client) throw new Error('R2 Client unconfigured');

  await client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  );

  return {
    success: true,
    publicUrl,
    fileKey: key,
  };
}

/**
 * Deletes an object from R2 storage
 */
export async function deleteObjectFromR2(key: string): Promise<boolean> {
  if (!isR2Configured()) {
    return true;
  }

  const client = getR2Client();
  if (!client) return false;

  try {
    await client.send(
      new DeleteObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
      })
    );
    return true;
  } catch (err) {
    console.error('[R2Storage] Delete error:', err);
    return false;
  }
}
