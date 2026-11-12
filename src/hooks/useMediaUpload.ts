import { useState } from 'react';

export interface UploadResult {
  fileKey: string;
  publicUrl: string;
  isSimulated?: boolean;
}

export interface UseMediaUploadOptions {
  folder?: string;
  tenantId?: string;
  onSuccess?: (result: UploadResult) => void;
  onError?: (error: string) => void;
}

export function useMediaUpload(options: UseMediaUploadOptions = {}) {
  const { folder = 'uploads', tenantId = 'public', onSuccess, onError } = options;

  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [lastUploaded, setLastUploaded] = useState<UploadResult | null>(null);

  const uploadFile = async (file: File): Promise<UploadResult | null> => {
    setIsUploading(true);
    setProgress(10);
    setError(null);

    try {
      // 1. Validate file size (15MB limit)
      if (file.size > 15 * 1024 * 1024) {
        throw new Error('File exceeds maximum size of 15MB.');
      }

      // 2. Request pre-signed upload URL from backend
      setProgress(25);
      const presignedRes = await fetch('/api/storage/presigned-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type || 'image/jpeg',
          folder,
          tenantId,
        }),
      });

      if (!presignedRes.ok) {
        const errData = await presignedRes.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to acquire secure upload URL.');
      }

      const { uploadUrl, fileKey, publicUrl, isSimulated } = await presignedRes.json();
      setProgress(50);

      // 3. Direct upload to Cloudflare R2 (or mock endpoint if unconfigured)
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type || 'image/jpeg',
        },
        body: file,
      });

      if (!uploadRes.ok && !isSimulated) {
        throw new Error(`Cloudflare R2 upload failed with status ${uploadRes.status}`);
      }

      setProgress(100);
      const result: UploadResult = {
        fileKey,
        publicUrl,
        isSimulated,
      };

      setLastUploaded(result);
      onSuccess?.(result);
      return result;
    } catch (err: any) {
      const msg = err?.message || 'Media upload failed.';
      setError(msg);
      onError?.(msg);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const uploadBase64 = async (
    filename: string,
    contentType: string,
    dataBase64: string
  ): Promise<UploadResult | null> => {
    setIsUploading(true);
    setProgress(30);
    setError(null);

    try {
      const res = await fetch('/api/storage/upload-direct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename,
          contentType,
          dataBase64,
          folder,
          tenantId,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Direct upload failed.');
      }

      setProgress(100);
      const data = await res.json();
      const result: UploadResult = {
        fileKey: data.fileKey,
        publicUrl: data.publicUrl,
      };

      setLastUploaded(result);
      onSuccess?.(result);
      return result;
    } catch (err: any) {
      const msg = err?.message || 'Media upload failed.';
      setError(msg);
      onError?.(msg);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const reset = () => {
    setIsUploading(false);
    setProgress(0);
    setError(null);
    setLastUploaded(null);
  };

  return {
    uploadFile,
    uploadBase64,
    isUploading,
    progress,
    error,
    lastUploaded,
    reset,
  };
}
