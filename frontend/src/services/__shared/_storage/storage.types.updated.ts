// ============================================================================
// services/storage/storage.types.ts - Updated storage types for Supabase
// ============================================================================

import { z } from 'zod';

/**
 * Storage bucket names as constants
 */
export const STORAGE_BUCKETS = {
  RESIDENTS_PHOTOS: 'residents-photos',
  RESIDENTS_DOCUMENTS: 'residents-documents',
  SUPPORTING_DOCUMENTS: 'supporting-documents',
  PUBLIC_ASSETS: 'public-assets',
} as const;

export type StorageBucket = typeof STORAGE_BUCKETS[keyof typeof STORAGE_BUCKETS];

/**
 * File upload request schema
 */
export const FileUploadSchema = z.object({
  file: z.instanceof(File),
  bucket: z.string(),
  folder: z.string().optional(),
  isPublic: z.boolean().optional(),
  metadata: z.record(z.string()).optional(),
});

export type FileUploadRequest = z.infer<typeof FileUploadSchema>;

/**
 * Upload result schema
 */
export const UploadResultSchema = z.object({
  success: z.boolean(),
  bucket: z.string(),
  path: z.string(),
  url: z.string().optional(),
  publicUrl: z.string().optional(),
  fileName: z.string(),
  size: z.number().optional(),
  type: z.string().optional(),
  uploadedAt: z.string().optional(),
  error: z.string().optional(),
});

export type UploadResult = z.infer<typeof UploadResultSchema>;

/**
 * Multiple upload result schema
 */
export const MultipleUploadResultSchema = z.object({
  success: z.boolean(),
  results: z.array(UploadResultSchema),
  errors: z.array(z.object({
    file: z.string(),
    error: z.string(),
  })),
  totalFiles: z.number(),
  successCount: z.number(),
  errorCount: z.number(),
});

export type MultipleUploadResult = z.infer<typeof MultipleUploadResultSchema>;

/**
 * File metadata schema
 */
export const FileMetadataSchema = z.object({
  name: z.string(),
  size: z.number(),
  type: z.string(),
  lastModified: z.string(),
  createdAt: z.string(),
  bucket: z.string(),
  path: z.string(),
  url: z.string().optional(),
  isPublic: z.boolean(),
});

export type FileMetadata = z.infer<typeof FileMetadataSchema>;

/**
 * Storage configuration
 */
export interface StorageConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  maxFileSize: number;
  allowedFileTypes: string[];
  defaultBucket: string;
  publicBuckets: string[];
  privateBuckets: string[];
}

/**
 * File validation result
 */
export interface FileValidationResult {
  isValid: boolean;
  error?: string;
  warnings?: string[];
}

/**
 * Bucket configuration
 */
export interface BucketConfig {
  public: boolean;
  maxSize: number;
  allowedTypes: string[];
  path: (...args: string[]) => string;
}

/**
 * Storage operation result
 */
export interface StorageOperationResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: Record<string, string | number | boolean>;
}

/**
 * File download result
 */
export interface FileDownloadResult {
  success: boolean;
  blob?: Blob;
  url?: string;
  error?: string;
  metadata?: FileMetadata;
}

/**
 * Signed URL request
 */
export interface SignedUrlRequest {
  bucket: string;
  path: string;
  expiresIn?: number;
  download?: boolean;
}

/**
 * Upload progress event
 */
export interface UploadProgressEvent {
  loaded: number;
  total: number;
  percentage: number;
  fileName: string;
}

/**
 * Storage service interface
 */
export interface IStorageService {
  uploadFile(request: FileUploadRequest): Promise<UploadResult>;
  uploadMultipleFiles(files: File[], bucket: string, folder?: string): Promise<MultipleUploadResult>;
  deleteFile(bucket: string, path: string): Promise<boolean>;
  getFileUrl(bucket: string, path: string, options?: { signed?: boolean; expiresIn?: number }): Promise<string>;
  fileExists(bucket: string, path: string): Promise<boolean>;
  getFileMetadata(bucket: string, path: string): Promise<FileMetadata | null>;
  listFiles(bucket: string, folder?: string, options?: { limit?: number; offset?: number }): Promise<{ data: FileMetadata[]; error?: string }>;
}

/**
 * Constants for backward compatibility
 */
export const STORAGE_BASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB default
export const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
] as const;

/**
 * Storage utilities
 */
export const StorageUtils = {
  /**
   * Generate unique filename
   */
  generateFileName: (originalName: string): string => {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2);
    const extension = originalName.split('.').pop();
    const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
    const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9-_]/g, '_');
    
    return `${timestamp}_${randomId}_${sanitizedName}.${extension}`;
  },

  /**
   * Get file extension
   */
  getFileExtension: (fileName: string): string => {
    return fileName.split('.').pop()?.toLowerCase() || '';
  },

  /**
   * Format file size
   */
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  /**
   * Validate file type
   */
  validateFileType: (file: File, allowedTypes: string[]): boolean => {
    return allowedTypes.includes(file.type);
  },

  /**
   * Validate file size
   */
  validateFileSize: (file: File, maxSize: number): boolean => {
    return file.size <= maxSize;
  },

  /**
   * Extract bucket and path from URL
   */
  parseStorageUrl: (url: string): { bucket?: string; path?: string } => {
    try {
      const urlObj = new URL(url);
      const pathSegments = urlObj.pathname.split('/').filter(Boolean);
      
      if (pathSegments.includes('storage') && pathSegments.includes('v1')) {
        const storageIndex = pathSegments.indexOf('storage');
        const bucketIndex = storageIndex + 2;
        const bucket = pathSegments[bucketIndex];
        const path = pathSegments.slice(bucketIndex + 1).join('/');
        
        return { bucket, path };
      }
      
      return {};
    } catch {
      return {};
    }
  },
};

/**
 * Error types for storage operations
 */
export enum StorageErrorType {
  UPLOAD_FAILED = 'UPLOAD_FAILED',
  DOWNLOAD_FAILED = 'DOWNLOAD_FAILED',
  DELETE_FAILED = 'DELETE_FAILED',
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  BUCKET_NOT_FOUND = 'BUCKET_NOT_FOUND',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
}

/**
 * Storage error class
 */
export class StorageError extends Error {
  constructor(
    public type: StorageErrorType,
    message: string,
    public metadata?: Record<string, string | number | boolean>
  ) {
    super(message);
    this.name = 'StorageError';
  }
}
