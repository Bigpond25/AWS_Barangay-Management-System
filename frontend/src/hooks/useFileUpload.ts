import { useState, useCallback } from 'react'
import { uploadFile, deleteFile } from '../services/storage'
import type { StorageBucket, StorageUploadResult } from '../services/storage'

interface UseFileUploadOptions {
  bucket: StorageBucket
  pathPrefix: string
  onUploadComplete?: (result: StorageUploadResult) => void
  onUploadError?: (error: string) => void
  userId?: string
}

interface UseFileUploadReturn {
  uploading: boolean
  progress: number
  uploadFile: (file: File) => Promise<StorageUploadResult>
  deleteFile: (path: string) => Promise<boolean>
  reset: () => void
  error: string | null
}

/**
 * Custom hook for file upload operations
 */
export function useFileUpload({
  bucket,
  pathPrefix,
  onUploadComplete,
  onUploadError,
  userId
}: UseFileUploadOptions): UseFileUploadReturn {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const handleUploadFile = useCallback(async (file: File): Promise<StorageUploadResult> => {
    setUploading(true)
    setProgress(0)
    setError(null)

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      const result = await uploadFile(file, bucket, pathPrefix, {
        upsert: true,
        userId
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (result.success) {
        onUploadComplete?.(result)
      } else {
        setError(result.error || 'Upload failed')
        onUploadError?.(result.error || 'Upload failed')
      }

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed'
      setError(errorMessage)
      onUploadError?.(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setUploading(false)
      setTimeout(() => setProgress(0), 1000) // Reset progress after delay
    }
  }, [bucket, pathPrefix, userId, onUploadComplete, onUploadError])

  const handleDeleteFile = useCallback(async (path: string): Promise<boolean> => {
    try {
      setError(null)
      const result = await deleteFile(bucket, path)
      
      if (!result.success) {
        setError(result.error || 'Delete failed')
      }
      
      return result.success
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Delete failed'
      setError(errorMessage)
      return false
    }
  }, [bucket])

  const reset = useCallback(() => {
    setUploading(false)
    setProgress(0)
    setError(null)
  }, [])

  return {
    uploading,
    progress,
    uploadFile: handleUploadFile,
    deleteFile: handleDeleteFile,
    reset,
    error
  }
}

/**
 * Hook for multiple file uploads
 */
interface UseMultiFileUploadOptions extends Omit<UseFileUploadOptions, 'onUploadComplete' | 'onUploadError'> {
  maxFiles?: number
  onAllUploadsComplete?: (results: StorageUploadResult[]) => void
  onUploadProgress?: (completed: number, total: number) => void
}

interface UseMultiFileUploadReturn {
  uploading: boolean
  progress: number
  uploadFiles: (files: File[]) => Promise<StorageUploadResult[]>
  reset: () => void
  error: string | null
  completedUploads: number
  totalUploads: number
}

export function useMultiFileUpload({
  bucket,
  pathPrefix,
  maxFiles = 10,
  onAllUploadsComplete,
  onUploadProgress,
  userId
}: UseMultiFileUploadOptions): UseMultiFileUploadReturn {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [completedUploads, setCompletedUploads] = useState(0)
  const [totalUploads, setTotalUploads] = useState(0)

  const uploadFiles = useCallback(async (files: File[]): Promise<StorageUploadResult[]> => {
    if (files.length > maxFiles) {
      const errorMessage = `Maximum ${maxFiles} files allowed`
      setError(errorMessage)
      return [{ success: false, error: errorMessage }]
    }

    setUploading(true)
    setProgress(0)
    setError(null)
    setCompletedUploads(0)
    setTotalUploads(files.length)

    const results: StorageUploadResult[] = []

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const result = await uploadFile(file, bucket, pathPrefix, {
          upsert: true,
          userId
        })
        
        results.push(result)
        setCompletedUploads(i + 1)
        setProgress(((i + 1) / files.length) * 100)
        
        onUploadProgress?.(i + 1, files.length)
        
        if (!result.success) {
          setError(result.error || `Failed to upload ${file.name}`)
        }
      }

      onAllUploadsComplete?.(results)
      return results
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed'
      setError(errorMessage)
      return [{ success: false, error: errorMessage }]
    } finally {
      setUploading(false)
      setTimeout(() => {
        setProgress(0)
        setCompletedUploads(0)
        setTotalUploads(0)
      }, 2000)
    }
  }, [bucket, pathPrefix, maxFiles, userId, onAllUploadsComplete, onUploadProgress])

  const reset = useCallback(() => {
    setUploading(false)
    setProgress(0)
    setError(null)
    setCompletedUploads(0)
    setTotalUploads(0)
  }, [])

  return {
    uploading,
    progress,
    uploadFiles,
    reset,
    error,
    completedUploads,
    totalUploads
  }
}
