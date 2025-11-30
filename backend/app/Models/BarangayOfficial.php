<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use OwenIt\Auditing\Contracts\Auditable;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use App\Models\Schemas\BarangayOfficialSchema;

class BarangayOfficial extends Model implements Auditable
{
    use HasFactory, HasUuids;

    use \OwenIt\Auditing\Auditable;
    
    protected $auditModel = ActivityLog::class;
    
    public function transformAudit(array $data): array
    {
        return [
            'user_id' => Auth::id() ?? null, 
            'action_type' => $data['event'], // created, updated, deleted
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
        return match($event) {
            'created' => "{$user} created a new barangay official record",
            'updated' => "{$user} updated barangay official information", 
            'deleted' => "{$user} deleted a barangay official record",
            default => "{$user} performed {$event} action"
        };
    }

    protected $keyType = 'string';
    public $incrementing = false;

    // Use schema for fillable fields
    protected $fillable;
    protected $casts;

    public function __construct(array $attributes = [])
    {
        // Load fillable fields and casts from schema before calling parent constructor
        try {
            $this->fillable = BarangayOfficialSchema::getFillableFields() ?? [];
            $schemaCasts = BarangayOfficialSchema::getCasts() ?? [];
            $this->casts = array_merge($schemaCasts, [
                'id' => 'string',
            ]);
        } catch (\Exception $e) {
            // Fallback in case schema is not available
            $this->fillable = [];
            $this->casts = ['id' => 'string'];
        }
        
        parent::__construct($attributes);
    }

    // Relationships
    public function resident(): BelongsTo
    {
        return $this->belongsTo(Resident::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Boot the model to enforce business rules
     */
    protected static function boot()
    {
        parent::boot();
        
        // Enforce business rules when creating
        static::creating(function ($official) {
            // Business Rule: All barangay officials must be residents
            if (empty($official->resident_id)) {
                throw new \InvalidArgumentException('All barangay officials must be residents. resident_id is required.');
            }
            
            // Business Rule: All barangay officials must be users
            if (empty($official->user_id)) {
                throw new \InvalidArgumentException('All barangay officials must be users. user_id is required.');
            }
            
            // Validate that the user and resident exist
            if (!User::find($official->user_id)) {
                throw new \InvalidArgumentException('The specified user does not exist.');
            }
            
            if (!Resident::find($official->resident_id)) {
                throw new \InvalidArgumentException('The specified resident does not exist.');
            }
            
            // Auto-populate personal details from resident
            $official->syncPersonalDataFromResident();

            $official->created_by = Auth::user()->id;
        });
        
        // Enforce business rules when updating
        static::updating(function ($official) {
            // If resident_id or user_id is being changed, validate the new values
            if ($official->isDirty('resident_id') && empty($official->resident_id)) {
                throw new \InvalidArgumentException('resident_id cannot be null. All barangay officials must be residents.');
            }
            
            if ($official->isDirty('user_id') && empty($official->user_id)) {
                throw new \InvalidArgumentException('user_id cannot be null. All barangay officials must be users.');
            }
            
            // If resident_id changed, sync personal data from new resident
            if ($official->isDirty('resident_id')) {
                $official->syncPersonalDataFromResident();
            }

            $official->updated_by = Auth::user()->id;
        });
    }

    /**
     * Sync personal data from the associated resident
     */
    public function syncPersonalDataFromResident(): void
    {
        if ($this->resident_id && $this->resident) {
            $resident = $this->resident;
            $this->first_name = $resident->first_name;
            $this->middle_name = $resident->middle_name;
            $this->last_name = $resident->last_name;
            $this->suffix = $resident->suffix;
            $this->full_name = $resident->full_name;
            $this->birth_date = $resident->birth_date;
            $this->gender = $resident->gender;
            $this->contact_number = $resident->mobile_number;
            $this->email_address = $resident->email_address;
            $this->address = $resident->complete_address;
        }
    }

    // Scopes
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', 'ACTIVE');
    }

    public function scopeCurrentTerm(Builder $query): Builder
    {
        return $query->where('is_current_term', true);
    }

    public function scopeByPosition(Builder $query, string $position): Builder
    {
        return $query->where('position', $position);
    }

    // Helper methods
    public function updateStatus(string $status): void
    {
        $this->update([
            'status' => $status,
            'is_current_term' => $status === 'ACTIVE'
        ]);
    }

    public function startNewTerm(Carbon $startDate, Carbon $endDate, int $termNumber = null): void
    {
        $this->update([
            'term_start' => $startDate,
            'term_end' => $endDate,
            'term_number' => $termNumber ?? ($this->term_number + 1),
            'is_current_term' => true,
            'status' => 'ACTIVE'
        ]);
    }
}