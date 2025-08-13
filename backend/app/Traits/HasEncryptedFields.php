<?php

namespace App\Traits;

use App\Services\EncryptionService;
use Illuminate\Database\Eloquent\Casts\Attribute;

trait HasEncryptedFields
{
    /**
     * Define which fields should be encrypted
     * Override this method in your model
     */
    protected function getEncryptedFields(): array
    {
        return $this->encrypted ?? [];
    }

    /**
     * Define which fields should have search hashes
     * These are fields you might need to search on
     */
    protected function getHashedFields(): array
    {
        return $this->hashed ?? [];
    }

    /**
     * Boot the trait
     */
    protected static function bootHasEncryptedFields()
    {
        // Encrypt fields before saving
        static::saving(function ($model) {
            $model->encryptSensitiveFields();
        });

        // Decrypt fields after retrieving
        static::retrieved(function ($model) {
            $model->decryptSensitiveFields();
        });
    }

    /**
     * Encrypt sensitive fields before saving to database
     */
    protected function encryptSensitiveFields(): void
    {
        $encryptedFields = $this->getEncryptedFields();
        $hashedFields = $this->getHashedFields();

        foreach ($encryptedFields as $field) {
            if ($this->isDirty($field) && !empty($this->attributes[$field])) {
                // Create search hash if needed
                if (in_array($field, $hashedFields)) {
                    $hashField = $field . '_hash';
                    $this->attributes[$hashField] = EncryptionService::searchHash($this->attributes[$field]);
                }

                // Encrypt the field
                $this->attributes[$field] = EncryptionService::safeEncrypt($this->attributes[$field]);
            }
        }
    }

    /**
     * Decrypt sensitive fields after retrieving from database
     */
    protected function decryptSensitiveFields(): void
    {
        $encryptedFields = $this->getEncryptedFields();

        foreach ($encryptedFields as $field) {
            if (isset($this->attributes[$field])) {
                $this->attributes[$field] = EncryptionService::decrypt($this->attributes[$field]);
            }
        }
    }

    /**
     * Create accessor for encrypted fields to ensure they're always decrypted
     */
    public function getAttribute($key)
    {
        $value = parent::getAttribute($key);

        // If this is an encrypted field and it's still encrypted, decrypt it
        if (in_array($key, $this->getEncryptedFields()) && EncryptionService::isEncrypted($value)) {
            $value = EncryptionService::decrypt($value);
            // Cache the decrypted value to avoid repeated decryption
            $this->attributes[$key] = $value;
        }

        return $value;
    }

    /**
     * Search by encrypted field using hash
     */
    public function scopeSearchEncrypted($query, string $field, string $value)
    {
        $hashField = $field . '_hash';
        $hash = EncryptionService::searchHash($value);
        
        return $query->where($hashField, $hash);
    }

    /**
     * Get the original (unencrypted) value for an attribute
     * Useful for comparisons and validations
     */
    public function getOriginalDecrypted(string $key): mixed
    {
        $original = $this->getOriginal($key);
        
        if (in_array($key, $this->getEncryptedFields()) && EncryptionService::isEncrypted($original)) {
            return EncryptionService::decrypt($original);
        }
        
        return $original;
    }

    /**
     * Check if field value has actually changed (accounting for encryption)
     */
    public function isEncryptedFieldDirty(string $field): bool
    {
        if (!in_array($field, $this->getEncryptedFields())) {
            return $this->isDirty($field);
        }

        $current = $this->getAttribute($field);
        $original = $this->getOriginalDecrypted($field);

        return $current !== $original;
    }

    /**
     * Mass assignment protection for encrypted fields
     */
    public function forceFill(array $attributes)
    {
        // Handle encrypted fields specially to ensure proper encryption
        $encryptedFields = $this->getEncryptedFields();
        $encryptedAttributes = [];
        
        foreach ($attributes as $key => $value) {
            if (in_array($key, $encryptedFields)) {
                $encryptedAttributes[$key] = $value;
                unset($attributes[$key]);
            }
        }

        // Fill non-encrypted attributes normally
        parent::forceFill($attributes);

        // Handle encrypted attributes
        foreach ($encryptedAttributes as $key => $value) {
            $this->setAttribute($key, $value);
        }

        return $this;
    }
}
