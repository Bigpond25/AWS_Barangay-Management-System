<?php

namespace App\Models;

use App\Models\Schemas\DocumentSchema;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;
use OwenIt\Auditing\Contracts\Auditable;
use Illuminate\Support\Facades\Cache;

class Document extends Model implements Auditable
{
    use HasFactory, HasUuids, \OwenIt\Auditing\Auditable;

    protected $auditModel = ActivityLog::class;
    protected $keyType = 'string';
    public $incrementing = false;

    /**
     * Cached schema data for performance
     */
    private static $cachedDocumentTypes = null;
    private static $cachedPriorityOptions = null;
    private static $cachedStatusOptions = null;
    private static $cachedPaymentStatusOptions = null;

    /**
     * Cached fillable fields from schema
     */
    protected $fillable = [
        'type', 'resident_id', 'applicant_name', 'purpose', 'applicant_address', 
        'applicant_contact', 'applicant_email', 'priority', 'needed_date', 'processing_fee',
        'status', 'payment_status', 'document_number', 'serial_number', 'submitted_at',
        'processed_at', 'approved_at', 'released_at', 'clearance_purpose', 'clearance_type',
        'business_name', 'business_type', 'business_address', 'business_owner', 
        'business_category', 'indigency_reason', 'family_monthly_income', 'family_size',
        'residency_period', 'previous_address', 'requirements_submitted', 'notes',
        'remarks', 'certifying_official', 'file_path', 'file_bucket', 'file_storage_path',
        'file_storage_provider', 'file_migrated_to_supabase', 'processed_by', 'approved_by',
        'released_by', 'created_by', 'updated_by', 'received_from', 'representing_entity',
        'acknowledgement_address', 'bond_amount', 'expiry_date', 'sign_wordings', 
        'sign_material', 'sign_size', 'case_number', 'hearing_date', 'hearing_time',
        'hearing_type', 'complainant_name', 'complainant_address', 'respondent_name',
        'respondent_address', 'case_description', 'date_approved', 'last_compliance', 'retirement_date'
    ];

    /**
     * Cached casts from schema
     */
    protected $casts = [
        'needed_date' => 'date',
        'submitted_at' => 'datetime',
        'processed_at' => 'datetime', 
        'approved_at' => 'datetime',
        'released_at' => 'datetime',
        'expiry_date' => 'date',
        'processing_fee' => 'decimal:2',
        'family_monthly_income' => 'decimal:2',
        'bond_amount' => 'decimal:2',
        'family_size' => 'integer',
        'file_migrated_to_supabase' => 'boolean',
        'requirements_submitted' => 'array'
    ];

    /**
     * Computed attributes with caching
     */
    public function getDocumentTypeDisplayAttribute(): string
    {
        if (self::$cachedDocumentTypes === null) {
            self::$cachedDocumentTypes = DocumentSchema::getDocumentTypes();
        }
        return self::$cachedDocumentTypes[$this->type] ?? $this->type;
    }

    public function getPriorityDisplayAttribute(): string
    {
        if (self::$cachedPriorityOptions === null) {
            self::$cachedPriorityOptions = DocumentSchema::getPriorityOptions();
        }
        return self::$cachedPriorityOptions[$this->priority] ?? ucfirst($this->priority);
    }

    public function getStatusDisplayAttribute(): string
    {
        if (self::$cachedStatusOptions === null) {
            self::$cachedStatusOptions = DocumentSchema::getStatusOptions();
        }
        return self::$cachedStatusOptions[$this->status] ?? ucfirst($this->status);
    }

    public function getPaymentStatusDisplayAttribute(): string
    {
        if (self::$cachedPaymentStatusOptions === null) {
            self::$cachedPaymentStatusOptions = DocumentSchema::getPaymentStatusOptions();
        }
        return self::$cachedPaymentStatusOptions[$this->payment_status] ?? ucfirst($this->payment_status);
    }

    public function getIsExpiredAttribute(): bool
    {
        return $this->expiry_date && $this->expiry_date->isPast();
    }

    public function getIsExpiringSoonAttribute(): bool
    {
        if (!$this->expiry_date) {
            return false;
        }

        return $this->expiry_date->diffInDays(now()) <= 30 && $this->expiry_date->isFuture();
    }

    public function getProcessingDaysAttribute(): int
    {
        if (!$this->submitted_at) {
            return 0;
        }

        $endDate = $this->released_at ?? now();
        return $this->submitted_at->diffInDays($endDate);
    }

    public function getIsOverdueAttribute(): bool
    {
        if (!$this->needed_date || in_array($this->status, ['RELEASED', 'REJECTED', 'CANCELLED'])) {
            return false;
        }

        return $this->needed_date->isPast();
    }

    public function getFormattedDocumentNumberAttribute(): string
    {
        return $this->document_number ?? 'N/A';
    }

    public function getFormattedSerialNumberAttribute(): string
    {
        return $this->serial_number ?? 'N/A';
    }

    /**
     * Relationships
     */
    public function resident()
    {
        return $this->belongsTo(Resident::class);
    }

    public function processedByUser()
    {
        return $this->belongsTo(User::class, 'processed_by');
    }

    public function approvedByUser()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function releasedByUser()
    {
        return $this->belongsTo(User::class, 'released_by');
    }

    public function supportingDocuments()
    {
        return $this->hasMany(SupportingDocument::class, 'document_id', 'id');
    }

    public function createdByUser()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedByUser()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Scopes
     */
    public function scopePending($query)
    {
        return $query->where('status', 'PENDING');
    }

    public function scopeProcessing($query)
    {
        return $query->where('status', 'PROCESSING');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'APPROVED');
    }

    public function scopeReleased($query)
    {
        return $query->where('status', 'RELEASED');
    }

    public function scopeRejected($query)
    {
        return $query->where('status', 'REJECTED');
    }

    public function scopeByDocumentType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeByPriority($query, $priority)
    {
        return $query->where('priority', $priority);
    }

    public function scopeByPaymentStatus($query, $status)
    {
        return $query->where('payment_status', $status);
    }

    public function scopeUrgent($query)
    {
        return $query->whereIn('priority', ['urgent', 'rush']);
    }

    public function scopeOverdue($query)
    {
        return $query->where('needed_date', '<', now())
            ->whereNotIn('status', ['RELEASED', 'REJECTED', 'CANCELLED']);
    }

    public function scopeExpired($query)
    {
        return $query->where('expiry_date', '<', now());
    }

    public function scopeExpiringSoon($query, $days = 30)
    {
        return $query->whereBetween('expiry_date', [now(), now()->addDays($days)]);
    }

    public function scopeRequestedThisMonth($query)
    {
        return $query->whereMonth('submitted_at', now()->month)
            ->whereYear('submitted_at', now()->year);
    }

    public function scopeRequestedThisYear($query)
    {
        return $query->whereYear('submitted_at', now()->year);
    }

    public function scopeReleasedThisMonth($query)
    {
        return $query->whereMonth('released_date', now()->month)
            ->whereYear('released_date', now()->year);
    }

    public function scopeByResident($query, $residentId)
    {
        return $query->where('resident_id', $residentId);
    }

    /**
     * Helper methods for document-specific data
     */
    public function isBarangayClearance(): bool
    {
        return $this->type === 'BARANGAY_CLEARANCE';
    }

    public function isBusinessPermit(): bool
    {
        return $this->type === 'BUSINESS_PERMIT';
    }

    public function isCertificateOfIndigency(): bool
    {
        return $this->type === 'CERTIFICATE_OF_INDIGENCY';
    }

    public function isCertificateOfResidency(): bool
    {
        return $this->type === 'CERTIFICATE_OF_RESIDENCY';
    }

    public function hasRequiredDocuments(): bool
    {
        return !empty($this->requirements_submitted);
    }

    public function canBeProcessed(): bool
    {
        return $this->status === 'PENDING' && $this->hasRequiredDocuments();
    }

    public function canBeApproved(): bool
    {
        return in_array($this->status, ['PENDING', 'PROCESSING']);
    }

    public function canBeReleased(): bool
    {
        return $this->status === 'APPROVED' && $this->payment_status === 'PAID';
    }

    public function canBeRejected(): bool
    {
        return !in_array($this->status, ['RELEASED', 'REJECTED', 'CANCELLED']);
    }

    /**
     * Boot the model
     */
    protected static function boot()
    {
        parent::boot();

        // Auto-generate document number and serial number when creating
        static::creating(function ($document) {
            if (!$document->document_number) {
                $document->document_number = static::generateDocumentNumber($document->type);
            }

            if (!$document->serial_number) {
                $document->serial_number = static::generateSerialNumber();
            }

            // Set submitted_at if not provided
            if (!$document->submitted_at) {
                $document->submitted_at = now();
            }

            // Set payment_status to 'PAID' by default (assume all requests are paid upon submission)
            if (!$document->payment_status) {
                $document->payment_status = 'PAID';
            }
        });

        // Update processed_at when status changes to processing
        static::updating(function ($document) {
            if ($document->isDirty('status')) {
                switch ($document->status) {
                    case 'PROCESSING':
                        if (!$document->processed_at) {
                            $document->processed_at = now();
                        }
                        break;
                    case 'APPROVED':
                        if (!$document->approved_at) {
                            $document->approved_at = now();
                        }
                        break;
                    case 'RELEASED':
                        if (!$document->released_at) {
                            $document->released_at = now();
                        }
                        break;
                }
            }
        });
    }

    /**
     * Generate document number based on document type (OPTIMIZED)
     */
    protected static function generateDocumentNumber(string $documentType): string
    {
        $prefix = match ($documentType) {
            'BARANGAY_CLEARANCE' => 'BC',
            'BARANGAY_CLEARANCE_INSTALLATION' => 'BCI',
            'CASH_BOND' => 'CB',
            'SUMMON' => 'SMN',
            'CERTIFICATE_OF_RESIDENCY' => 'CR',
            'CERTIFICATE_OF_INDIGENCY' => 'CI',
            'BUSINESS_PERMIT' => 'BP',
            'BUILDING_PERMIT' => 'BDP',
            'FIRST_TIME_JOB_SEEKER' => 'FTJS',
            'SENIOR_CITIZEN_ID' => 'SCI',
            'PWD_ID' => 'PWD',
            'BARANGAY_ID' => 'BID',
            'RETIREMENT_CESSATION_DISSOLUTION' => 'RCD',
            'NOTICE_OF_HEARING' => 'NOH',
            default => 'DOC',
        }; 

        $year = now()->year;
        $month = now()->format('m');

        // OPTIMIZED: Use cache for sequence numbers to reduce database queries
        $cacheKey = "doc_sequence_{$documentType}_{$year}_{$month}";
        
        $sequence = Cache::remember($cacheKey, 3600, function () use ($documentType, $year, $month) {
            // OPTIMIZED: Use proper ordering by timestamp instead of UUID
            $lastDocument = static::where('type', $documentType)
                ->whereYear('submitted_at', $year)
                ->whereMonth('submitted_at', $month)
                ->orderBy('submitted_at', 'desc')
                ->first();

            if ($lastDocument && $lastDocument->document_number) {
                // Extract sequence from last document number
                $parts = explode('-', $lastDocument->document_number);
                if (count($parts) >= 4) {
                    return (int) end($parts);
                }
            }
            return 0;
        });

        // Increment and update cache
        $sequence++;
        Cache::put($cacheKey, $sequence, 3600);

        return sprintf('%s-%d-%s-%04d', $prefix, $year, $month, $sequence);
    }

    /**
     * Generate unique serial number (OPTIMIZED)
     */
    protected static function generateSerialNumber(): string
    {
        // OPTIMIZED: Use microtime for better uniqueness and performance
        $timestamp = str_replace('.', '', microtime(true));
        $random = strtoupper(Str::random(4));
        
        return 'SN-' . now()->format('Y') . '-' . substr($timestamp, -6) . $random;
    }

    // OwenIt Auditing
    public function transformAudit(array $data): array
    {
        return [
            'user_id' => Auth::id() ?? null,
            'action_type' => $data['event'],
            'auditable_type' => get_class($this),
            'auditable_id' => $this->getKey(),
            'table_name' => $this->getTable(),
            'record_id' => $this->getKey(),
            'old_values' => $data['old_values'] ?? null,
            'new_values' => $data['new_values'] ?? null,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'timestamp' => now(),
            'description' => $this->generateDescription($data['event'])
        ];
    }

    private function generateDescription($event)
    {
        $user = Auth::user() ? Auth::user()->name : 'System';
        return match ($event) {
            'created' => "$user created a new document record",
            'updated' => "$user updated document information",
            'deleted' => "$user deleted a document record",
            default => "$user performed $event action"
        };
    }
}