import { 
  uploadFileToSupabase, 
  deleteFileFromSupabase, 
  getPublicFileUrl, 
  createSignedUrl, 
  STORAGE_BUCKETS, 
  validateFileForUpload,
  generateFilePath,
  isSupabaseStorage
} from './supabaseStorage'
import type { StorageBucket } from './supabaseStorage'

export { STORAGE_BUCKETS, type StorageBucket }

/**
 * Storage service that handles both local and Supabase storage
 */
export interface StorageUploadResult {
  success: boolean
  url?: string
  path?: string
  error?: string
  metadata?: {
    size: number
    type: string
    bucket?: string
    provider: 'local' | 'supabase'
  }
}

export interface StorageDeleteResult {
  success: boolean
  error?: string
}

export interface StorageUrlResult {
  success: boolean
  url?: string
  signedUrl?: string
  expiresAt?: string
  error?: string
}

/**
 * Upload file to configured storage provider
 */
export async function uploadFile(
  file: File,
  bucket: StorageBucket,
  pathPrefix: string,
  options?: {
    upsert?: boolean
    cacheControl?: string
    userId?: string
  }
): Promise<StorageUploadResult> {
  try {
    // Validate file
    const validation = validateFileForUpload(file, bucket)
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error
      }
    }

    if (isSupabaseStorage()) {
      // Use Supabase storage
      const path = generateFilePath(pathPrefix, file.name, options?.userId)
      const result = await uploadFileToSupabase(file, bucket, path, options)
      
      if (result.success) {
        const url = getPublicFileUrl(bucket, result.path!)
        return {
          success: true,
          url,
          path: result.path,
          metadata: {
            size: file.size,
            type: file.type,
            bucket,
            provider: 'supabase'
          }
        }
      } else {
        return {
          success: false,
          error: result.error
        }
      }
    } else {
      // Use local storage via API
      return await uploadToLocalStorage(file, bucket, pathPrefix, options)
    }
  } catch (error) {
    console.error('Storage upload error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    }
  }
}

/**
 * Delete file from storage
 */
export async function deleteFile(
  bucket: StorageBucket,
  path: string
): Promise<StorageDeleteResult> {
  try {
    if (isSupabaseStorage()) {
      const result = await deleteFileFromSupabase(bucket, path)
      return {
        success: result.success,
        error: result.error
      }
    } else {
      return await deleteFromLocalStorage(bucket, path)
    }
  } catch (error) {
    console.error('Storage delete error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Delete failed'
    }
  }
}

/**
 * Get file URL (public or signed)
 */
export async function getFileUrl(
  bucket: StorageBucket,
  path: string,
  options?: {
    signed?: boolean
    expiresIn?: number
  }
): Promise<StorageUrlResult> {
  try {
    if (isSupabaseStorage()) {
      if (options?.signed) {
        const result = await createSignedUrl(bucket, path, options.expiresIn)
        return {
          success: result.success,
          signedUrl: result.signedUrl,
          expiresAt: result.expiresAt,
          error: result.error
        }
      } else {
        const url = getPublicFileUrl(bucket, path)
        return {
          success: true,
          url
        }
      }
    } else {
      return await getLocalFileUrl(bucket, path, options)
    }
  } catch (error) {
    console.error('Storage URL error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get URL'
    }
  }
}

/**
 * Local storage fallback functions
 * These would call your Laravel backend for local file operations
 */
async function uploadToLocalStorage(
  file: File,
  bucket: string,
  pathPrefix: string,
  _options?: { upsert?: boolean; cacheControl?: string; userId?: string }
): Promise<StorageUploadResult> {
  // Implementation would call your Laravel API for local file upload
  // This is a placeholder - implement based on your existing local storage API
  
  const formData = new FormData()
  formData.append('file', file)
  formData.append('bucket', bucket)
  formData.append('path_prefix', pathPrefix)
  
  try {
    const response = await fetch('/api/storage/upload', {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      return {
        success: true,
        url: data.url,
        path: data.path,
        metadata: {
          size: file.size,
          type: file.type,
          provider: 'local'
        }
      }
    } else {
      const error = await response.text()
      return {
        success: false,
        error
      }
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Local upload failed'
    }
  }
}

async function deleteFromLocalStorage(
  bucket: string,
  path: string
): Promise<StorageDeleteResult> {
  try {
    const response = await fetch('/api/storage/delete', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      },
      body: JSON.stringify({ bucket, path })
    })
    
    return {
      success: response.ok,
      error: response.ok ? undefined : await response.text()
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Local delete failed'
    }
  }
}

async function getLocalFileUrl(
  bucket: string,
  path: string,
  options?: { signed?: boolean; expiresIn?: number }
): Promise<StorageUrlResult> {
  try {
    const params = new URLSearchParams({
      bucket,
      path,
      ...(options?.signed && { signed: 'true' }),
      ...(options?.expiresIn && { expires_in: options.expiresIn.toString() })
    })
    
    const response = await fetch(`/api/storage/url?${params}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      return {
        success: true,
        url: data.url,
        signedUrl: data.signed_url,
        expiresAt: data.expires_at
      }
    } else {
      return {
        success: false,
        error: await response.text()
      }
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get local URL'
    }
  }
}

/**
 * Helper function to get the appropriate file URL based on storage provider
 * This is commonly used in components to display images/files
 */
export async function getDisplayUrl(
  bucket: StorageBucket,
  path: string | null | undefined,
  fallbackUrl?: string
): Promise<string> {
  if (!path) {
    return fallbackUrl || '/placeholder-image.png'
  }
  
  try {
    const result = await getFileUrl(bucket, path)
    if (result.success && result.url) {
      return result.url
    }
    
    // If it's a relative path, try constructing a local URL
    if (!path.startsWith('http') && !isSupabaseStorage()) {
      return `/storage/${path}`
    }
    
    return fallbackUrl || '/placeholder-image.png'
  } catch (error) {
    console.error('Error getting display URL:', error)
    return fallbackUrl || '/placeholder-image.png'
  }
}

/**
 * Get storage provider name
 */
export function getStorageProvider(): 'local' | 'supabase' {
  return isSupabaseStorage() ? 'supabase' : 'local'
}
