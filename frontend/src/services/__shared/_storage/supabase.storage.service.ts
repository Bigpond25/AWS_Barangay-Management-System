// ============================================================================
// services/storage/supabase.storage.service.ts - Supabase storage operations
// ============================================================================

import {
  storageClient,
  SupabaseStorageClient,
  validateFile,
  generateFilePath,
  getBucketConfig,
} from './supabase.client';
import type { StorageBucket } from './supabase.client';

import type { 
  UploadResult,
  FileUploadRequest,
  MultipleUploadResult,
} from './storage.types.updated';

import { STORAGE_BUCKETS } from './storage.types.updated';

/**
 * Supabase Storage Service
 * Provides high-level storage operations for the application
 */
export class SupabaseStorageService {
  private client: SupabaseStorageClient;

  constructor(client?: SupabaseStorageClient) {
    this.client = client || storageClient;
  }

  /**
   * Upload a single file to Supabase Storage
   */
  async uploadFile(request: FileUploadRequest): Promise<UploadResult> {
    const { file, bucket, folder } = request;

    // Validate bucket
    if (!Object.values(STORAGE_BUCKETS).includes(bucket as StorageBucket)) {
      throw new Error(`Invalid bucket: ${bucket}`);
    }

    const storageBucket = bucket as StorageBucket;

    // Validate file
    const validationError = validateFile(file, storageBucket);
    if (validationError) {
      throw new Error(validationError);
    }

    // Generate file path
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = folder 
      ? `${folder}/${fileName}`
      : fileName;

    try {
      // Upload file
      const { data: _data, error } = await this.client.uploadFile(
        storageBucket,
        filePath,
        file
      );

      if (error) {
        throw new Error(`Upload failed: ${error.message}`);
      }

      // Get file URL
      const bucketConfig = getBucketConfig(storageBucket);
      let fileUrl: string;

      if (bucketConfig.public) {
        const { data: urlData } = this.client.getPublicUrl(storageBucket, filePath);
        fileUrl = urlData.publicUrl;
      } else {
        const { data: signedData, error: urlError } = await this.client.createSignedUrl(
          storageBucket,
          filePath,
          3600 // 1 hour
        );
        
        if (urlError) {
          throw new Error(`Failed to generate URL: ${urlError.message}`);
        }
        
        fileUrl = signedData?.signedUrl || '';
      }

      return {
        success: true,
        bucket: storageBucket,
        path: filePath,
        url: fileUrl,
        publicUrl: bucketConfig.public ? fileUrl : undefined,
        fileName: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString(),
      };

    } catch (error) {
      console.error('Upload error:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
        bucket: storageBucket,
        path: filePath,
        fileName: file.name,
      };
    }
  }

  /**
   * Upload multiple files
   */
  async uploadMultipleFiles(
    files: File[],
    bucket: string,
    folder?: string
  ): Promise<MultipleUploadResult> {
    if (!files.length) {
      throw new Error('No files provided');
    }

    const results: UploadResult[] = [];
    const errors: Array<{ file: string; error: string }> = [];

    for (const file of files) {
      try {
        const result = await this.uploadFile({
          file,
          bucket,
          folder,
        });

        results.push(result);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Upload failed';
        errors.push({
          file: file.name,
          error: errorMessage,
        });
      }
    }

    return {
      success: errors.length === 0,
      results,
      errors,
      totalFiles: files.length,
      successCount: results.filter(r => r.success).length,
      errorCount: errors.length,
    };
  }

  /**
   * Delete a file
   */
  async deleteFile(bucket: string, path: string): Promise<boolean> {
    if (!Object.values(STORAGE_BUCKETS).includes(bucket as StorageBucket)) {
      throw new Error(`Invalid bucket: ${bucket}`);
    }

    const storageBucket = bucket as StorageBucket;

    try {
      const { error } = await this.client.deleteFile(storageBucket, path);
      
      if (error) {
        console.error('Delete error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Delete error:', error);
      return false;
    }
  }

  /**
   * Get file URL (public or signed)
   */
  async getFileUrl(
    bucket: string,
    path: string,
    options?: {
      signed?: boolean;
      expiresIn?: number;
    }
  ): Promise<string> {
    if (!Object.values(STORAGE_BUCKETS).includes(bucket as StorageBucket)) {
      throw new Error(`Invalid bucket: ${bucket}`);
    }

    const storageBucket = bucket as StorageBucket;
    const bucketConfig = getBucketConfig(storageBucket);

    try {
      if (options?.signed || !bucketConfig.public) {
        const { data, error } = await this.client.createSignedUrl(
          storageBucket,
          path,
          options?.expiresIn || 3600
        );

        if (error) {
          throw new Error(`Failed to generate signed URL: ${error.message}`);
        }

        return data?.signedUrl || '';
      } else {
        const { data } = this.client.getPublicUrl(storageBucket, path);
        return data.publicUrl;
      }
    } catch (error) {
      console.error('Get URL error:', error);
      return '';
    }
  }

  /**
   * Check if file exists
   */
  async fileExists(bucket: string, path: string): Promise<boolean> {
    if (!Object.values(STORAGE_BUCKETS).includes(bucket as StorageBucket)) {
      return false;
    }

    const storageBucket = bucket as StorageBucket;
    return this.client.fileExists(storageBucket, path);
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(bucket: string, path: string) {
    if (!Object.values(STORAGE_BUCKETS).includes(bucket as StorageBucket)) {
      throw new Error(`Invalid bucket: ${bucket}`);
    }

    const storageBucket = bucket as StorageBucket;
    return this.client.getFileMetadata(storageBucket, path);
  }

  /**
   * List files in a folder
   */
  async listFiles(
    bucket: string,
    folder?: string,
    options?: {
      limit?: number;
      offset?: number;
      search?: string;
    }
  ) {
    if (!Object.values(STORAGE_BUCKETS).includes(bucket as StorageBucket)) {
      throw new Error(`Invalid bucket: ${bucket}`);
    }

    const storageBucket = bucket as StorageBucket;
    return this.client.listFiles(storageBucket, folder, options);
  }

  /**
   * Generate upload URL for residents photos
   */
  async getResidentPhotoUploadUrl(residentId: string): Promise<string> {
    const path = generateFilePath(STORAGE_BUCKETS.RESIDENTS_PHOTOS, residentId);
    return this.getFileUrl(STORAGE_BUCKETS.RESIDENTS_PHOTOS, path, {
      signed: false, // Public bucket
    });
  }

  /**
   * Generate signed URL for resident documents
   */
  async getResidentDocumentUrl(
    residentId: string,
    docType: string,
    fileName: string,
    expiresIn: number = 3600
  ): Promise<string> {
    const path = `${generateFilePath(STORAGE_BUCKETS.RESIDENTS_DOCUMENTS, residentId, docType)}/${fileName}`;
    return this.getFileUrl(STORAGE_BUCKETS.RESIDENTS_DOCUMENTS, path, {
      signed: true,
      expiresIn,
    });
  }

  /**
   * Upload resident profile photo
   */
  async uploadResidentPhoto(residentId: string, file: File): Promise<UploadResult> {
    const folder = generateFilePath(STORAGE_BUCKETS.RESIDENTS_PHOTOS, residentId);
    
    return this.uploadFile({
      file,
      bucket: STORAGE_BUCKETS.RESIDENTS_PHOTOS,
      folder,
    });
  }

  /**
   * Upload resident document
   */
  async uploadResidentDocument(
    residentId: string,
    docType: string,
    file: File
  ): Promise<UploadResult> {
    const folder = generateFilePath(STORAGE_BUCKETS.RESIDENTS_DOCUMENTS, residentId, docType);
    
    return this.uploadFile({
      file,
      bucket: STORAGE_BUCKETS.RESIDENTS_DOCUMENTS,
      folder,
    });
  }

  /**
   * Upload supporting document for tickets
   */
  async uploadSupportingDocument(ticketId: string, file: File): Promise<UploadResult> {
    const folder = generateFilePath(STORAGE_BUCKETS.SUPPORTING_DOCUMENTS, ticketId);
    
    return this.uploadFile({
      file,
      bucket: STORAGE_BUCKETS.SUPPORTING_DOCUMENTS,
      folder,
    });
  }

  /**
   * Get all available buckets
   */
  getAvailableBuckets(): string[] {
    return Object.values(STORAGE_BUCKETS);
  }

  /**
   * Get bucket configuration
   */
  getBucketInfo(bucket: string) {
    if (!Object.values(STORAGE_BUCKETS).includes(bucket as StorageBucket)) {
      return null;
    }

    return getBucketConfig(bucket as StorageBucket);
  }
}

/**
 * Default storage service instance
 */
export const supabaseStorageService = new SupabaseStorageService();
