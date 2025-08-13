<?php

namespace App\Services;

use Illuminate\Support\Facades\Crypt;
use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Support\Facades\Log;

class EncryptionService
{
    /**
     * Encrypt a value for database storage
     */
    public static function encrypt(?string $value): ?string
    {
        if (empty($value)) {
            return $value;
        }

        try {
            return Crypt::encryptString($value);
        } catch (\Exception $e) {
            Log::error('Encryption failed', [
                'error' => $e->getMessage(),
                'value_length' => strlen($value)
            ]);
            throw $e;
        }
    }

    /**
     * Decrypt a value from database storage
     */
    public static function decrypt(?string $value): ?string
    {
        if (empty($value)) {
            return $value;
        }

        try {
            return Crypt::decryptString($value);
        } catch (DecryptException $e) {
            Log::warning('Decryption failed - returning original value', [
                'error' => $e->getMessage()
            ]);
            // Return the original value if decryption fails
            // This helps with migration scenarios where some data might not be encrypted yet
            return $value;
        } catch (\Exception $e) {
            Log::error('Unexpected decryption error', [
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Encrypt an array of fields
     */
    public static function encryptFields(array $data, array $fields): array
    {
        foreach ($fields as $field) {
            if (isset($data[$field])) {
                $data[$field] = static::encrypt($data[$field]);
            }
        }
        return $data;
    }

    /**
     * Decrypt an array of fields
     */
    public static function decryptFields(array $data, array $fields): array
    {
        foreach ($fields as $field) {
            if (isset($data[$field])) {
                $data[$field] = static::decrypt($data[$field]);
            }
        }
        return $data;
    }

    /**
     * Check if a value appears to be encrypted
     */
    public static function isEncrypted(?string $value): bool
    {
        if (empty($value)) {
            return false;
        }

        // Laravel encrypted strings start with 'eyJpdiI6' (base64 of {"iv":)
        return str_starts_with($value, 'eyJ');
    }

    /**
     * Safely encrypt only if not already encrypted
     */
    public static function safeEncrypt(?string $value): ?string
    {
        if (static::isEncrypted($value)) {
            return $value;
        }
        return static::encrypt($value);
    }

    /**
     * Create a hash for searching encrypted fields
     * This allows searching without decrypting all records
     */
    public static function searchHash(?string $value): ?string
    {
        if (empty($value)) {
            return null;
        }
        
        return hash('sha256', strtolower(trim($value)) . config('app.key'));
    }

    /**
     * Encrypt sensitive fields in bulk operations
     */
    public static function bulkEncrypt(array $records, array $sensitiveFields): array
    {
        return array_map(function ($record) use ($sensitiveFields) {
            return static::encryptFields($record, $sensitiveFields);
        }, $records);
    }

    /**
     * Decrypt sensitive fields in bulk operations
     */
    public static function bulkDecrypt(array $records, array $sensitiveFields): array
    {
        return array_map(function ($record) use ($sensitiveFields) {
            return static::decryptFields($record, $sensitiveFields);
        }, $records);
    }
}
