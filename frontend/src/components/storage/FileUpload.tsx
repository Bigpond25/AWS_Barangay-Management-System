import React, { useCallback, useState, useRef } from 'react'
import { Upload, X, FileImage, AlertCircle, CheckCircle } from 'lucide-react'
import { useFileUpload } from '../../hooks/useFileUpload'
import type { StorageBucket } from '../../services/storage'
import { validateFileForUpload } from '../../services/storage/supabaseStorage'

interface FileUploadProps {
  bucket: StorageBucket
  pathPrefix: string
  accept?: string
  maxSize?: number
  multiple?: boolean
  disabled?: boolean
  className?: string
  userId?: string
  onUploadComplete?: (result: { success: boolean; url?: string; path?: string; error?: string }) => void
  onUploadError?: (error: string) => void
  children?: React.ReactNode
}

export function FileUpload({
  bucket,
  pathPrefix,
  accept = 'image/*',
  maxSize = 5 * 1024 * 1024, // 5MB default
  multiple = false,
  disabled = false,
  className = '',
  userId,
  onUploadComplete,
  onUploadError,
  children
}: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ name: string; url: string; path: string }>>([])
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const { uploading, progress, uploadFile, error, reset } = useFileUpload({
    bucket,
    pathPrefix,
    userId,
    onUploadComplete: (result) => {
      if (result.success && result.url && result.path) {
        const newFile = {
          name: result.path.split('/').pop() || 'Unknown',
          url: result.url,
          path: result.path
        }
        setUploadedFiles(prev => multiple ? [...prev, newFile] : [newFile])
      }
      onUploadComplete?.(result)
    },
    onUploadError
  })

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files) return
    
    reset()
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      // Validate file before upload
      const validation = validateFileForUpload(file, bucket)
      if (!validation.valid) {
        onUploadError?.(validation.error || 'Invalid file')
        continue
      }
      
      await uploadFile(file)
      
      if (!multiple) break // Only upload one file if not multiple
    }
  }, [uploadFile, bucket, multiple, onUploadError, reset])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled && !uploading) {
      setDragOver(true)
    }
  }, [disabled, uploading])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    
    if (disabled || uploading) return
    
    const files = e.dataTransfer.files
    handleFileSelect(files)
  }, [disabled, uploading, handleFileSelect])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files)
  }, [handleFileSelect])

  const handleClick = useCallback(() => {
    if (!disabled && !uploading) {
      fileInputRef.current?.click()
    }
  }, [disabled, uploading])

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const hasErrors = error

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled || uploading}
      />

      {/* Upload Area */}
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300'}
          ${hasErrors ? 'border-red-300 bg-red-50' : ''}
          ${disabled || uploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400'}
        `}
      >
        {uploading ? (
          <div className="space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Uploading...</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500">{Math.round(progress)}%</p>
            </div>
          </div>
        ) : children ? (
          children
        ) : (
          <div className="space-y-2">
            <Upload className="h-8 w-8 text-gray-400 mx-auto" />
            <div className="text-sm text-gray-600">
              {dragOver ? (
                <p>Drop the files here...</p>
              ) : (
                <div>
                  <p>Drag & drop files here, or <span className="text-blue-600">click to select</span></p>
                  <p className="text-xs text-gray-500 mt-1">
                    {multiple ? 'Multiple files allowed' : 'Single file only'} • Max {Math.round(maxSize / 1024 / 1024)}MB
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Error Messages */}
      {error && (
        <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
          <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )}

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Uploaded Files</h4>
          <div className="space-y-2">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <div className="flex items-center space-x-2">
                    <FileImage className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700 truncate">{file.name}</span>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  type="button"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default FileUpload
