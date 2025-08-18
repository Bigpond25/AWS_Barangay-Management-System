<?php

namespace App\Contracts;

use Illuminate\Http\UploadedFile;

/**
 * Storage Interface for abstracting storage operations
 * Allows switching between local Laravel storage and cloud providers like Supabase
 */
interface StorageInterface
{
    /**
     * Upload a file to storage
     *
     * @param UploadedFile $file The file to upload
     * @param string $bucket The storage bucket/container name
     * @param string $path The file path within the bucket
     * @param bool $isPublic Whether the file should be publicly accessible
     * @return array Storage result with URL and metadata
     */
    public function uploadFile(
        UploadedFile $file, 
        string $bucket, 
        string $path, 
        bool $isPublic = false
    ): array;

    /**
     * Delete a file from storage
     *
     * @param string $bucket The storage bucket name
     * @param string $path The file path to delete
     * @return bool Success status
     */
    public function deleteFile(string $bucket, string $path): bool;

    /**
     * Get a file URL (public or signed)
     *
     * @param string $bucket The storage bucket name
     * @param string $path The file path
     * @param bool $signed Whether to generate a signed URL for private files
     * @param int $expiresIn Expiration time in seconds for signed URLs
     * @return string The file URL
     */
    public function getFileUrl(
        string $bucket, 
        string $path, 
        bool $signed = false, 
        int $expiresIn = 3600
    ): string;

    /**
     * Check if a file exists in storage
     *
     * @param string $bucket The storage bucket name
     * @param string $path The file path
     * @return bool Whether the file exists
     */
    public function fileExists(string $bucket, string $path): bool;

    /**
     * Get file metadata
     *
     * @param string $bucket The storage bucket name
     * @param string $path The file path
     * @return array File metadata (size, type, etc.)
     */
    public function getFileMetadata(string $bucket, string $path): array;

    /**
     * Copy a file to a new location
     *
     * @param string $fromBucket Source bucket
     * @param string $fromPath Source path
     * @param string $toBucket Destination bucket
     * @param string $toPath Destination path
     * @return bool Success status
     */
    public function copyFile(
        string $fromBucket, 
        string $fromPath, 
        string $toBucket, 
        string $toPath
    ): bool;

    /**
     * Generate a signed upload URL for direct client uploads
     *
     * @param string $bucket The storage bucket name
     * @param string $path The file path
     * @param int $expiresIn Expiration time in seconds
     * @return array Upload URL and form data
     */
    public function getSignedUploadUrl(
        string $bucket, 
        string $path, 
        int $expiresIn = 3600
    ): array;

    /**
     * Test connection to storage provider
     *
     * @return bool Whether connection is successful
     */
    public function testConnection(): bool;

    /**
     * Get available storage buckets
     *
     * @return array List of bucket names
     */
    public function getAvailableBuckets(): array;

    /**
     * Get bucket configuration
     *
     * @param string $bucket The bucket name
     * @return array Bucket configuration
     */
    public function getBucketConfig(string $bucket): array;
}
