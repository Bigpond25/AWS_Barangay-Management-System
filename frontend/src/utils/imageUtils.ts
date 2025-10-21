// ============================================================================
// utils/imageUtils.ts - Updated for Supabase storage
// ============================================================================

import { supabaseStorageService } from '@/services/__shared/_storage/supabase.storage.service';
import { STORAGE_BUCKETS } from '@/services/__shared/_storage/supabase.client';

/**
 * Build full image URL from filename/path
 * @param filename - The filename or path stored in the database
 * @param folder - Legacy parameter for backward compatibility
 * @returns Full URL to the image
 */
export const buildImageUrl = (filename: string | null, folder?: string): string => {
  if (!filename) return '';
  
  // If it's already a blob URL (for preview), return as is
  if (filename.startsWith('blob:')) {
    return filename;
  }
  
  // If it's already a full URL, return as is (for backward compatibility)
  if (filename.startsWith('http://') || filename.startsWith('https://')) {
    return filename;
  }

  // For Supabase storage, build the public URL directly
  if (import.meta.env.VITE_STORAGE_PROVIDER === 'supabase') {
    try {
      // Determine bucket based on folder or default to residents photos
      const bucket = folder === 'residents/photos' || !folder 
        ? STORAGE_BUCKETS.RESIDENTS_PHOTOS 
        : STORAGE_BUCKETS.PUBLIC_ASSETS;
      
      // Build the public URL directly without async call
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (supabaseUrl) {
        return `${supabaseUrl}/storage/v1/object/public/${bucket}/${filename}`;
      }
      
      return getPlaceholderImageUrl();
    } catch {
      // Fallback to placeholder if Supabase fails
      return getPlaceholderImageUrl();
    }
  }

  // Fallback to local storage for backward compatibility
  const baseUrl = import.meta.env.VITE_API_URL || 'https://barangay-management-system-od8g.onrender.com';
  const folderPath = folder || 'residents/photos';
  return `${baseUrl}/storage/public/${folderPath}/${filename}`;
};

/**
 * Build full image URL from filename/path with validation (async version)
 * @param filename - The filename or path stored in the database
 * @param folder - Legacy parameter for backward compatibility
 * @returns Promise with full URL to the image
 */
export const buildImageUrlAsync = async (filename: string | null, folder?: string): Promise<string> => {
  if (!filename) return '';
  
  // If it's already a blob URL (for preview), return as is
  if (filename.startsWith('blob:')) {
    return filename;
  }
  
  // If it's already a full URL, return as is (for backward compatibility)
  if (filename.startsWith('http://') || filename.startsWith('https://')) {
    return filename;
  }

  // For Supabase storage, use the storage service for validation
  if (import.meta.env.VITE_STORAGE_PROVIDER === 'supabase') {
    try {
      // Determine bucket based on folder or default to residents photos
      const bucket = folder === 'residents/photos' || !folder 
        ? STORAGE_BUCKETS.RESIDENTS_PHOTOS 
        : STORAGE_BUCKETS.PUBLIC_ASSETS;
      
      return await supabaseStorageService.getFileUrl(bucket, filename);
    } catch {
      // Fallback to placeholder if Supabase fails
      return getPlaceholderImageUrl();
    }
  }

  // Fallback to local storage for backward compatibility
  const baseUrl = import.meta.env.VITE_API_URL || 'https://barangay-management-system-od8g.onrender.com';
  const folderPath = folder || 'residents/photos';
  return `${baseUrl}/storage/public/${folderPath}/${filename}`;
};

/**
 * Build image URL specifically for resident photos
 * @param residentId - The resident ID
 * @param filename - The photo filename
 * @returns Full URL to the resident photo
 */
export const buildResidentPhotoUrl = async (residentId: string, filename: string): Promise<string> => {
  if (!filename) return getPlaceholderImageUrl();
  
  if (filename.startsWith('blob:') || filename.startsWith('http')) {
    return filename;
  }

  // For Supabase storage
  if (import.meta.env.VITE_STORAGE_PROVIDER === 'supabase') {
    try {
      const path = `${residentId}/profile/${filename}`;
      return await supabaseStorageService.getFileUrl(STORAGE_BUCKETS.RESIDENTS_PHOTOS, path);
    } catch {
      return getPlaceholderImageUrl();
    }
  }

  // Fallback to local storage
  const baseUrl = import.meta.env.VITE_API_URL || 'https://barangay-management-system-od8g.onrender.com';
  return `${baseUrl}/storage/public/residents/photos/${filename}`;
};

/**
 * Build image URL for documents
 * @param residentId - The resident ID
 * @param docType - Document type (barangay_clearance, cedula, etc.)
 * @param filename - The document filename
 * @returns Signed URL for private document access
 */
export const buildDocumentUrl = async (
  residentId: string, 
  docType: string, 
  filename: string
): Promise<string> => {
  if (!filename) return '';
  
  if (filename.startsWith('blob:') || filename.startsWith('http')) {
    return filename;
  }

  // For Supabase storage (documents are private)
  if (import.meta.env.VITE_STORAGE_PROVIDER === 'supabase') {
    try {
      return await supabaseStorageService.getResidentDocumentUrl(residentId, docType, filename);
    } catch {
      return '';
    }
  }

  // Fallback to local storage
  const baseUrl = import.meta.env.VITE_API_URL || 'https://barangay-management-system-od8g.onrender.com';
  return `${baseUrl}/storage/private/residents/documents/${residentId}/${docType}/${filename}`;
};

/**
 * Extract filename from a full URL (for backward compatibility)
 * @param url - Full URL or filename
 * @returns Just the filename
 */
export const extractFilename = (url: string | null): string => {
  if (!url) return '';
  
  // If it's already just a filename, return as is
  if (!url.includes('/')) {
    return url;
  }
  
  // Extract filename from URL
  const parts = url.split('/');
  return parts[parts.length - 1];
};

/**
 * Get placeholder image URL
 * @param size - Size of the placeholder (default: 128)
 * @param text - Text to display (default: 'No Photo')
 * @returns Placeholder image URL
 */
export const getPlaceholderImageUrl = (size: number = 128, text: string = 'No Photo'): string => {
  return `https://placehold.co/${size}x${size}/e5e7eb/6b7280?text=${encodeURIComponent(text)}`;
};

/**
 * Get avatar URL with fallback to initials
 * @param photoUrl - The photo URL from database
 * @param fullName - User's full name for initials
 * @param size - Image size
 * @returns URL with proper fallback
 */
export const getAvatarUrl = (
  photoUrl: string | null,
  fullName: string,
  size: number = 128
): string => {
  if (photoUrl) {
    return buildImageUrl(photoUrl);
  }

  // Generate initials from full name
  const nameParts = fullName.split(' ').filter(part => part.length > 0);
  const initials = nameParts.length >= 2 
    ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
    : nameParts[0]?.[0]?.toUpperCase() || '?';

  return `https://placehold.co/${size}x${size}/3b82f6/ffffff?text=${initials}&font=roboto`;
};

/**
 * Validate file type for upload
 * @param file - File to validate
 * @param allowedTypes - Array of allowed MIME types
 * @returns Boolean indicating if file type is valid
 */
export const validateFileType = (file: File, allowedTypes: string[]): boolean => {
  return allowedTypes.includes(file.type);
};

/**
 * Validate file size
 * @param file - File to validate
 * @param maxSizeInBytes - Maximum file size in bytes
 * @returns Boolean indicating if file size is valid
 */
export const validateFileSize = (file: File, maxSizeInBytes: number): boolean => {
  return file.size <= maxSizeInBytes;
};

/**
 * Generate optimized image URL with transformations
 * @param originalUrl - Original image URL
 * @param options - Transformation options
 * @returns Optimized image URL
 */
export const getOptimizedImageUrl = (
  originalUrl: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'avif' | 'auto';
  } = {}
): string => {
  if (!originalUrl || originalUrl.startsWith('blob:')) {
    return originalUrl;
  }

  // For Supabase storage, we can add transformation parameters
  if (import.meta.env.VITE_STORAGE_PROVIDER === 'supabase' && originalUrl.includes('supabase')) {
    const url = new URL(originalUrl);
    
    if (options.width) url.searchParams.set('width', options.width.toString());
    if (options.height) url.searchParams.set('height', options.height.toString());
    if (options.quality) url.searchParams.set('quality', options.quality.toString());
    if (options.format) url.searchParams.set('format', options.format);
    
    return url.toString();
  }

  // For other providers, return original URL
  return originalUrl;
};

/**
 * Check if image URL is from Supabase storage
 * @param url - Image URL to check
 * @returns Boolean indicating if URL is from Supabase
 */
export const isSupabaseUrl = (url: string): boolean => {
  return url.includes('supabase.co') && url.includes('/storage/v1/');
};

/**
 * Check if image URL is from local storage
 * @param url - Image URL to check
 * @returns Boolean indicating if URL is from local storage
 */
export const isLocalUrl = (url: string): boolean => {
  return url.includes('/storage/public/') || url.includes('localhost') || url.includes('127.0.0.1');
};

/**
 * Convert legacy local URL to Supabase path
 * @param localUrl - Local storage URL
 * @returns Relative path for Supabase storage
 */
export const convertLocalToSupabasePath = (localUrl: string): string => {
  if (!localUrl) return '';
  
  // Extract path from local URL
  const match = localUrl.match(/\/storage\/public\/(.+)$/);
  if (match) {
    return match[1];
  }
  
  return localUrl;
};
