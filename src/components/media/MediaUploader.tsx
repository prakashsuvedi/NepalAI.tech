import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, CheckCircle2, AlertCircle, Copy, Check, Loader2, X } from 'lucide-react';
import { useMediaUpload, UploadResult } from '../../hooks/useMediaUpload';

interface MediaUploaderProps {
  folder?: string;
  tenantId?: string;
  label?: string;
  accept?: string;
  onUploaded?: (result: UploadResult) => void;
  className?: string;
}

export const MediaUploader: React.FC<MediaUploaderProps> = ({
  folder = 'products',
  tenantId = 'public',
  label = 'Upload Media or Photograph',
  accept = 'image/jpeg,image/png,image/webp,image/gif,image/svg+xml,application/pdf',
  onUploaded,
  className = '',
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { uploadFile, isUploading, progress, error, lastUploaded, reset } = useMediaUpload({
    folder,
    tenantId,
    onSuccess: (res) => onUploaded?.(res),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      uploadFile(file);
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {label && (
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}

      {/* Dropzone Container */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${
          isDragOver
            ? 'border-cyan-500 bg-cyan-500/10 dark:bg-cyan-950/20'
            : 'border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 hover:border-cyan-400/60'
        } ${isUploading ? 'opacity-70 pointer-events-none' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
          disabled={isUploading}
        />

        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 dark:bg-cyan-950/30 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
            {isUploading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <Upload className="h-6 w-6" />
            )}
          </div>

          <div className="text-xs">
            <span className="font-semibold text-cyan-600 dark:text-cyan-400 hover:underline">
              Click to upload
            </span>{' '}
            <span className="text-slate-500">or drag and drop</span>
          </div>

          <p className="text-[11px] text-slate-400 font-mono">
            JPEG, PNG, WebP, SVG or PDF (up to 15MB)
          </p>
        </div>

        {/* Progress Bar */}
        {isUploading && (
          <div className="mt-4 space-y-1">
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>Uploading to Cloudflare R2...</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-500 transition-all duration-200 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
          <button
            type="button"
            onClick={reset}
            className="ml-auto text-xs underline cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Uploaded state card */}
      {lastUploaded && (
        <div className="flex items-center justify-between p-3 rounded-xl border border-cyan-500/30 bg-cyan-950/10 dark:bg-cyan-950/20 text-xs">
          <div className="flex items-center gap-2.5 truncate mr-2">
            <CheckCircle2 className="h-4 w-4 text-cyan-500 shrink-0" />
            <div className="truncate">
              <div className="font-semibold text-slate-900 dark:text-white truncate">
                {lastUploaded.fileKey.split('/').pop()}
              </div>
              <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate">
                {lastUploaded.publicUrl}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => handleCopyUrl(lastUploaded.publicUrl)}
              className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-cyan-500 flex items-center gap-1 cursor-pointer transition-colors"
            >
              {copied ? <Check className="h-3 w-3 text-cyan-500" /> : <Copy className="h-3 w-3" />}
              <span className="text-[10px] font-medium">{copied ? 'Copied' : 'Copy URL'}</span>
            </button>
            <button
              type="button"
              onClick={reset}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              title="Clear"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
