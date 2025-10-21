<?php

namespace App\Models;

use Illuminate\Support\Facades\Log;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use OwenIt\Auditing\Contracts\Auditable;

class DataConsent extends Model implements Auditable
{
    use HasFactory, HasUuids, SoftDeletes, \OwenIt\Auditing\Auditable;

    protected $auditModel = ActivityLog::class;

    protected $fillable = [
        'user_id',
        'consent_type',
        'consent_version',
        'consented',
        'consented_at',
        'ip_address',
        'user_agent',
        'consent_data',
        'withdrawn_at',
        'withdrawal_reason',
    ];

    protected $casts = [
        'consented' => 'boolean',
        'consented_at' => 'datetime',
        'withdrawn_at' => 'datetime',
        'consent_data' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    // Consent types constants
    public const TYPE_REGISTRATION = 'registration';
    public const TYPE_DATA_PROCESSING = 'data_processing';
    public const TYPE_MARKETING = 'marketing';
    public const TYPE_ANALYTICS = 'analytics';
    public const TYPE_COOKIES = 'cookies';

    public static function getConsentTypes(): array
    {
        return [
            self::TYPE_REGISTRATION => 'Registration and Account Creation',
            self::TYPE_DATA_PROCESSING => 'Personal Data Processing',
            self::TYPE_MARKETING => 'Marketing Communications',
            self::TYPE_ANALYTICS => 'Analytics and Performance',
            self::TYPE_COOKIES => 'Cookies and Tracking',
        ];
    }

    /**
     * Relationships
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scopes
     */
    public function scopeConsented($query)
    {
        return $query->where('consented', true)->whereNull('withdrawn_at');
    }

    public function scopeWithdrawn($query)
    {
        return $query->whereNotNull('withdrawn_at');
    }

    public function scopeByType($query, string $type)
    {
        return $query->where('consent_type', $type);
    }

    public function scopeByUser($query, string $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Helper methods
     */
    public function isActive(): bool
    {
        return $this->consented && is_null($this->withdrawn_at);
    }

    public function isWithdrawn(): bool
    {
        return !is_null($this->withdrawn_at);
    }

    public function withdraw(string $reason = null): void
    {
        $this->update([
            'withdrawn_at' => now(),
            'withdrawal_reason' => $reason,
        ]);
    }

    /**
     * Static helper methods
     */
    public static function recordConsent(
        ?string $userId,
        string $consentType,
        array $consentData = [],
        string $version = '1.0',
        ?string $ipAddress = null,
        ?string $userAgent = null
    ): self {
        return self::create([
            'user_id' => $userId,
            'consent_type' => $consentType,
            'consent_version' => $version,
            'consented' => true,
            'consented_at' => now(),
            'consent_data' => $consentData,
            'ip_address' => $ipAddress ?? request()->ip(),
            'user_agent' => $userAgent ?? request()->userAgent(),
        ]);
    }

    public static function hasValidConsent(string $userId, string $consentType): bool
    {
        return self::byUser($userId)
            ->byType($consentType)
            ->consented()
            ->exists();
    }

    public static function getUserConsents(string $userId): \Illuminate\Database\Eloquent\Collection
    {
        return self::byUser($userId)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public static function getActiveConsents(string $userId): \Illuminate\Database\Eloquent\Collection
    {
        return self::byUser($userId)
            ->consented()
            ->get();
    }

    /**
     * OwenIt Auditing
     */
    public function transformAudit(array $data): array
    {
        return array_merge($data, [
            'user_id' => auth()->id(),
            'auditable_type' => get_class($this),
            'auditable_id' => $this->getKey(),
        ]);
    }

    protected $auditExclude = [
        'updated_at',
    ];

    protected $auditInclude = [
        'consent_type',
        'consented',
        'consented_at',
        'withdrawn_at',
        'withdrawal_reason',
    ];
}
