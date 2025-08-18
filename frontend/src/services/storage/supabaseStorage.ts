import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Create Supabase client
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // We handle auth via Laravel Sanctum
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
})

/**
 * Storage bucket configurations
 */
export const STORAGE_BUCKETS = {
  RESIDENTS_PHOTOS: 'residents-photos',
  RESIDENTS_DOCUMENTS: 'residents-documents', 
  SUPPORTING_DOCUMENTS: 'supporting-documents',
  PUBLIC_ASSETS: 'public-assets'
} as const

export type StorageBucket = typeof STORAGE_BUCKETS[keyof typeof STORAGE_BUCKETS]

/**
 * Upload file to Supabase Storage
 */
export async function uploadFileToSupabase(
  file: File,
  bucket: StorageBucket,
  path: string,
  options?: {
    upsert?: boolean
    cacheControl?: string
  }
) {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        upsert: options?.upsert ?? true,
        cacheControl: options?.cacheControl ?? '3600'
      })

    if (error) {
      throw error
    }

    return {
      success: true,
      data,
      path: data.path,
      fullPath: data.fullPath
    }
  } catch (error) {
    console.error('Upload error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    }
  }
}

/**
 * Delete file from Supabase Storage
 */
export async function deleteFileFromSupabase(
  bucket: StorageBucket,
  paths: string | string[]
) {
  try {
    const pathArray = Array.isArray(paths) ? paths : [paths]
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .remove(pathArray)

    if (error) {
      throw error
    }

    return {
      success: true,
      data
    }
  } catch (error) {
    console.error('Delete error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Delete failed'
    }
  }
}

/**
 * Get public URL for a file
 */
export function getPublicFileUrl(bucket: StorageBucket, path: string): string {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path)
    
  return data.publicUrl
}

/**
 * Create signed URL for private file access
 */
export async function createSignedUrl(
  bucket: StorageBucket,
  path: string,
  expiresIn: number = 3600
) {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn)

    if (error) {
      throw error
    }

    return {
      success: true,
      signedUrl: data.signedUrl,
      expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString()
    }
  } catch (error) {
    console.error('Signed URL error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create signed URL'
    }
  }
}

/**
 * Get file metadata
 */
export async function getFileMetadata(bucket: StorageBucket, path: string) {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list('', {
        search: path
      })

    if (error) {
      throw error
    }

    const file = data.find(f => f.name === path.split('/').pop())
    
    return {
      success: true,
      metadata: file
    }
  } catch (error) {
    console.error('Metadata error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get metadata'
    }
  }
}

/**
 * Check if storage provider is Supabase
 */
export function isSupabaseStorage(): boolean {
  return import.meta.env.VITE_STORAGE_PROVIDER === 'supabase'
}

/**
 * Generate unique file path for uploads
 */
export function generateFilePath(
  prefix: string,
  filename: string,
  userId?: string
): string {
  const timestamp = Date.now()
  const randomId = Math.random().toString(36).substring(2, 8)
  const extension = filename.split('.').pop()
  const cleanFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_')
  
  if (userId) {
    return `${prefix}/${userId}/${timestamp}_${randomId}_${cleanFilename}`
  }
  
  return `${prefix}/${timestamp}_${randomId}_${cleanFilename}`
}

/**
 * Validate file for upload
 */
export function validateFileForUpload(
  file: File,
  bucket: StorageBucket
): { valid: boolean; error?: string } {
  const bucketConfigs = {
    [STORAGE_BUCKETS.RESIDENTS_PHOTOS]: {
      maxSize: 5 * 1024 * 1024, // 5MB
      allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    },
    [STORAGE_BUCKETS.RESIDENTS_DOCUMENTS]: {
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
    },
    [STORAGE_BUCKETS.SUPPORTING_DOCUMENTS]: {
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
    },
    [STORAGE_BUCKETS.PUBLIC_ASSETS]: {
      maxSize: 2 * 1024 * 1024, // 2MB
      allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    }
  }

  const config = bucketConfigs[bucket]
  if (!config) {
    return { valid: false, error: 'Invalid storage bucket' }
  }

  if (file.size > config.maxSize) {
    const maxSizeMB = Math.round(config.maxSize / 1024 / 1024)
    return { valid: false, error: `File size exceeds ${maxSizeMB}MB limit` }
  }

  if (!config.allowedTypes.includes(file.type)) {
    return { valid: false, error: `File type ${file.type} not allowed for this bucket` }
  }

  return { valid: true }
}
