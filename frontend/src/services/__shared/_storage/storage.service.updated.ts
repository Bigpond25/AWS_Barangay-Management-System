// ============================================================================
// services/storage/storage.service.ts - Updated for Supabase integration
// ============================================================================

import { BaseApiService } from '@/services/__shared/api';
import { apiClient } from '@/services/__shared/client';
import { supabaseStorageService } from './supabase.storage.service';
import type { 
  UploadResult,
  FileUploadRequest,
  MultipleUploadResult,
  IStorageService,
  FileMetadata,
} from './storage.types.updated';

/**
 * Unified Storage Service
 * Automatically routes to appropriate storage provider (Supabase or local)
 */
export class StorageService extends BaseApiService implements IStorageService {
  private useSupabase: boolean;

  constructor() {
    super();
    this.useSupabase = import.meta.env.VITE_STORAGE_PROVIDER === 'supabase';
  }

  /**
   * Upload a single file
   */
  async uploadFile(request: FileUploadRequest): Promise<UploadResult> {
    if (this.useSupabase) {
      return supabaseStorageService.uploadFile(request);
    }

    // Fallback to Laravel backend upload
    return this.uploadToLaravel(request);
  }

  /**
   * Upload multiple files
   */
  async uploadMultipleFiles(
    files: File[], 
    bucket: string, 
    folder?: string
  ): Promise<MultipleUploadResult> {
    if (this.useSupabase) {
      return supabaseStorageService.uploadMultipleFiles(files, bucket, folder);
    }

    // Fallback to Laravel backend upload
    return this.uploadMultipleToLaravel(files, folder);
  }

  /**
   * Delete a file
   */
  async deleteFile(bucket: string, path: string): Promise<boolean> {
    if (this.useSupabase) {
      return supabaseStorageService.deleteFile(bucket, path);
    }

    // Fallback to Laravel backend delete
    return this.deleteFromLaravel(path);
  }

  /**
   * Get file URL
   */
  async getFileUrl(
    bucket: string, 
    path: string, 
    options?: { signed?: boolean; expiresIn?: number }
  ): Promise<string> {
    if (this.useSupabase) {
      return supabaseStorageService.getFileUrl(bucket, path, options);
    }

    // Fallback to Laravel asset URL
    const baseUrl = import.meta.env.VITE_API_URL || 'https://barangay-management-system-od8g.onrender.com';
    return `${baseUrl}/storage/public/${path}`;
  }

  /**
   * Check if file exists
   */
  async fileExists(bucket: string, path: string): Promise<boolean> {
    if (this.useSupabase) {
      return supabaseStorageService.fileExists(bucket, path);
    }

    // For local storage, we'll need to check via API
    try {
      const url = await this.getFileUrl(bucket, path);
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(bucket: string, path: string): Promise<FileMetadata | null> {
    if (this.useSupabase) {
      const metadata = await supabaseStorageService.getFileMetadata(bucket, path);
      if (metadata) {
        // Convert Supabase FileObject to our FileMetadata format
        return {
          name: metadata.name,
          size: metadata.metadata?.size || 0,
          type: metadata.metadata?.mimetype || 'unknown',
          lastModified: metadata.updated_at || new Date().toISOString(),
          createdAt: metadata.created_at || new Date().toISOString(),
          bucket,
          path,
          isPublic: true, // This would need to be determined based on bucket config
        };
      }
      return null;
    }

    // For local storage, limited metadata available
    return null;
  }

  /**
   * List files in bucket/folder
   */
  async listFiles(
    bucket: string, 
    folder?: string, 
    options?: { limit?: number; offset?: number }
  ): Promise<{ data: FileMetadata[]; error?: string }> {
    if (this.useSupabase) {
      const result = await supabaseStorageService.listFiles(bucket, folder, options);
      if ('error' in result && result.error) {
        return { data: [], error: result.error.message };
      }
      
      // Convert FileObject[] to FileMetadata[]
      const fileObjects = result.data || [];
      const metadata: FileMetadata[] = fileObjects.map(file => ({
        name: file.name,
        size: file.metadata?.size || 0,
        type: file.metadata?.mimetype || 'unknown',
        lastModified: file.updated_at || new Date().toISOString(),
        createdAt: file.created_at || new Date().toISOString(),
        bucket,
        path: `${folder ? `${folder}/` : ''}${file.name}`,
        isPublic: true, // This would need to be determined based on bucket config
      }));
      
      return { data: metadata };
    }

    // For local storage, would need backend API support
    return { data: [] };
  }

  /*
  |--------------------------------------------------------------------------
  | Laravel Backend Methods (Fallback)
  |--------------------------------------------------------------------------
  */

  /**
   * Upload file to Laravel backend
   */
  private async uploadToLaravel(request: FileUploadRequest): Promise<UploadResult> {
    const formData = new FormData();
    formData.append('file', request.file);
    
    if (request.folder) {
      formData.append('folder', request.folder);
    }

    try {
      const response = await apiClient.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000,
      });

      if (response.data?.data) {
        return {
          success: true,
          bucket: 'local',
          path: response.data.data.path,
          url: response.data.data.url,
          fileName: request.file.name,
          size: request.file.size,
          type: request.file.type,
        };
      }

      throw new Error('Upload failed: No data returned');
    } catch (error) {
      return {
        success: false,
        bucket: 'local',
        path: '',
        fileName: request.file.name,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }

  /**
   * Upload multiple files to Laravel backend
   */
  private async uploadMultipleToLaravel(
    files: File[], 
    folder?: string
  ): Promise<MultipleUploadResult> {
    const results: UploadResult[] = [];
    const errors: Array<{ file: string; error: string }> = [];

    for (const file of files) {
      try {
        const result = await this.uploadToLaravel({ file, bucket: 'local', folder });
        results.push(result);
      } catch (error) {
        errors.push({
          file: file.name,
          error: error instanceof Error ? error.message : 'Upload failed',
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
   * Delete file from Laravel backend
   */
  private async deleteFromLaravel(path: string): Promise<boolean> {
    try {
      await apiClient.delete('/upload', {
        data: { path },
      });
      return true;
    } catch {
      return false;
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Convenience Methods
  |--------------------------------------------------------------------------
  */

  /**
   * Upload resident profile photo
   */
  async uploadResidentPhoto(residentId: string, file: File): Promise<UploadResult> {
    if (this.useSupabase) {
      return supabaseStorageService.uploadResidentPhoto(residentId, file);
    }

    return this.uploadToLaravel({
      file,
      bucket: 'local',
      folder: 'residents/photos',
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
    if (this.useSupabase) {
      return supabaseStorageService.uploadResidentDocument(residentId, docType, file);
    }

    return this.uploadToLaravel({
      file,
      bucket: 'local',
      folder: `residents/documents/${residentId}/${docType}`,
    });
  }

  /**
   * Upload supporting document
   */
  async uploadSupportingDocument(ticketId: string, file: File): Promise<UploadResult> {
    if (this.useSupabase) {
      return supabaseStorageService.uploadSupportingDocument(ticketId, file);
    }

    return this.uploadToLaravel({
      file,
      bucket: 'local',
      folder: `supporting-documents/${ticketId}`,
    });
  }

  /**
   * Get storage provider info
   */
  getStorageProvider(): string {
    return this.useSupabase ? 'supabase' : 'local';
  }

  /**
   * Check if using Supabase storage
   */
  isUsingSupabase(): boolean {
    return this.useSupabase;
  }

  /**
   * Generate full URL from relative path (backward compatibility)
   */
  getFullUrl(relativePath: string): string {
    if (!relativePath) return '';
    
    if (relativePath.startsWith('http')) {
      return relativePath; // Already a full URL
    }

    if (this.useSupabase) {
      // For Supabase, construct the public URL directly
      // This is a simplified approach for backward compatibility
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (supabaseUrl) {
        return `${supabaseUrl}/storage/v1/object/public/residents-photos/${relativePath}`;
      }
      return relativePath; // fallback
    }

    // For local storage
    const baseUrl = import.meta.env.VITE_API_URL || 'https://barangay-management-system-od8g.onrender.com';
    return `${baseUrl}/storage/public/${relativePath.replace(/^\//, '')}`;
  }
}

// Create singleton instance
export const storageService = new StorageService();
