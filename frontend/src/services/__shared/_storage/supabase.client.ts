// ============================================================================
// services/storage/supabase.client.ts - Supabase client configuration
// ============================================================================

import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase configuration interface
 */
export interface SupabaseConfig {
  url: string;
  anonKey: string;
  options?: {
    auth?: {
      autoRefreshToken?: boolean;
      persistSession?: boolean;
      detectSessionInUrl?: boolean;
    };
    global?: {
      headers?: Record<string, string>;
    };
  };
}

/**
 * Storage bucket configurations
 */
export const STORAGE_BUCKETS = {
  RESIDENTS_PHOTOS: 'residents-photos',
  RESIDENTS_DOCUMENTS: 'residents-documents', 
  SUPPORTING_DOCUMENTS: 'supporting-documents',
  PUBLIC_ASSETS: 'public-assets'
} as const;

export type StorageBucket = typeof STORAGE_BUCKETS[keyof typeof STORAGE_BUCKETS];

/**
 * Bucket configuration with security and validation rules
 */
export const BUCKET_CONFIG = {
  [STORAGE_BUCKETS.RESIDENTS_PHOTOS]: {
    public: true,
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    path: (residentId: string) => `${residentId}/profile`,
  },
  [STORAGE_BUCKETS.RESIDENTS_DOCUMENTS]: {
    public: false,
    maxSize: 10 * 1024 * 1024, // 10MB  
    allowedTypes: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'],
    path: (residentId: string, docType: string) => `${residentId}/${docType}`,
  },
  [STORAGE_BUCKETS.SUPPORTING_DOCUMENTS]: {
    public: false,
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'],
    path: (ticketId: string) => `${ticketId}`,
  },
  [STORAGE_BUCKETS.PUBLIC_ASSETS]: {
    public: true,
    maxSize: 2 * 1024 * 1024, // 2MB
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    path: (assetType: string) => `${assetType}`,
  }
} as const;

/**
 * Create and configure Supabase client
 */
function createSupabaseClient(): SupabaseClient {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase configuration. Please check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.'
    );
  }

  const config: SupabaseConfig = {
    url: supabaseUrl,
    anonKey: supabaseAnonKey,
    options: {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
      global: {
        headers: {
          'X-Client-Info': 'barangay-management-system',
        },
      },
    },
  };

  return createClient(config.url, config.anonKey, config.options);
}

/**
 * Singleton Supabase client instance
 */
export const supabaseClient = createSupabaseClient();

/**
 * Storage-specific client with helper methods
 */
export class SupabaseStorageClient {
  private client: SupabaseClient;

  constructor(client?: SupabaseClient) {
    this.client = client || supabaseClient;
  }

  /**
   * Get storage bucket reference
   */
  getBucket(bucketName: StorageBucket) {
    return this.client.storage.from(bucketName);
  }

  /**
   * Upload file to bucket
   */
  async uploadFile(
    bucket: StorageBucket,
    path: string,
    file: File,
    options?: {
      cacheControl?: string;
      contentType?: string;
      upsert?: boolean;
    }
  ) {
    const bucketRef = this.getBucket(bucket);
    
    return bucketRef.upload(path, file, {
      cacheControl: options?.cacheControl || '3600',
      contentType: options?.contentType || file.type,
      upsert: options?.upsert || true,
    });
  }

  /**
   * Delete file from bucket
   */
  async deleteFile(bucket: StorageBucket, path: string) {
    const bucketRef = this.getBucket(bucket);
    return bucketRef.remove([path]);
  }

  /**
   * Get public URL for file
   */
  getPublicUrl(bucket: StorageBucket, path: string) {
    const bucketRef = this.getBucket(bucket);
    return bucketRef.getPublicUrl(path);
  }

  /**
   * Create signed URL for private file access
   */
  async createSignedUrl(
    bucket: StorageBucket,
    path: string,
    expiresIn: number = 3600
  ) {
    const bucketRef = this.getBucket(bucket);
    return bucketRef.createSignedUrl(path, expiresIn);
  }

  /**
   * Download file as blob
   */
  async downloadFile(bucket: StorageBucket, path: string) {
    const bucketRef = this.getBucket(bucket);
    return bucketRef.download(path);
  }

  /**
   * List files in bucket/folder
   */
  async listFiles(
    bucket: StorageBucket,
    path?: string,
    options?: {
      limit?: number;
      offset?: number;
      search?: string;
    }
  ) {
    const bucketRef = this.getBucket(bucket);
    return bucketRef.list(path, {
      limit: options?.limit || 100,
      offset: options?.offset || 0,
      search: options?.search,
    });
  }

  /**
   * Check if file exists
   */
  async fileExists(bucket: StorageBucket, path: string): Promise<boolean> {
    try {
      const { data, error } = await this.downloadFile(bucket, path);
      return !error && !!data;
    } catch {
      return false;
    }
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(bucket: StorageBucket, path: string) {
    const folderPath = path.substring(0, path.lastIndexOf('/')) || '';
    const fileName = path.substring(path.lastIndexOf('/') + 1);
    
    const { data, error } = await this.listFiles(bucket, folderPath, {
      search: fileName,
    });

    if (error || !data?.length) {
      return null;
    }

    return data.find(file => file.name === fileName);
  }
}

/**
 * Default storage client instance
 */
export const storageClient = new SupabaseStorageClient();

/**
 * Validation utilities
 */
export const validateFile = (file: File, bucket: StorageBucket): string | null => {
  const config = BUCKET_CONFIG[bucket];
  
  if (!config) {
    return 'Invalid storage bucket';
  }

  if (file.size > config.maxSize) {
    const maxSizeMB = config.maxSize / (1024 * 1024);
    return `File size must be less than ${maxSizeMB}MB`;
  }

  if (!(config.allowedTypes as readonly string[]).includes(file.type)) {
    return `File type ${file.type} is not allowed`;
  }

  return null;
};

/**
 * Generate file path for bucket
 */
export const generateFilePath = (
  bucket: StorageBucket,
  ...args: string[]
): string => {
  const config = BUCKET_CONFIG[bucket];
  
  if (typeof config.path === 'function') {
    return (config.path as (...args: string[]) => string)(...args);
  }
  
  return args.join('/');
};

/**
 * Get bucket configuration
 */
export const getBucketConfig = (bucket: StorageBucket) => {
  return BUCKET_CONFIG[bucket];
};
