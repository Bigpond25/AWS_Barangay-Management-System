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

/**
 * @property string|null $prefix Position prefix for display
 * @property string|null $email Email address from resident relationship
 * @property string|null $contact Contact number from resident relationship
 * @property-read Resident|null $resident Associated resident relationship
 */
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

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        // Foreign Key Relationships
        'resident_id',
        'user_id',
        
        // Personal Information
        'prefix',
        'first_name',
        'last_name',
        'middle_name',
        'suffix',
        'full_name',
        'birth_date',
        'gender',
        
        // Contact Information
        'contact_number',
        'email_address',
        'address',
        
        // Official Position
        'position',
        'position_title',
        'committee_assignments',
        'committee_memberships',
        
        // Term Information
        'term_start',
        'term_end',
        'term_number',
        'is_current_term',
        
        // Election Information
        'election_date',
        'votes_received',
        'is_elected',
        'appointment_document',
        
        // Status
        'status',
        'status_date',
        'status_reason',
        
        // Educational & Professional Background
        'educational_background',
        'work_experience',
        'skills_expertise',
        'trainings_attended',
        'certifications',
        
        // Performance & Accomplishments
        'major_accomplishments',
        'projects_initiated',
        'performance_notes',
        'performance_rating',
        
        // Emergency Contact
        'emergency_contact_name',
        'emergency_contact_number',
        'emergency_contact_relationship',
        
        // Social Media & Communication
        'social_media_accounts',
        
        // Documents & Files
        'documents',
        'profile_photo',
        'digital_signature',
        
        // Oath & Legal
        'oath_taking_date',
        'oath_taking_notes',
        'legal_issues',
        'ethical_violations',
        
        // Attendance & Participation
        'session_attendance_rate',
        'committee_participation',
        'community_engagement',
        
        // Additional Information
        'remarks',
        'bio_summary',
        'personal_mission',
        
        // System Fields
        'created_by',
        'updated_by',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'id' => 'string',
        'birth_date' => 'date',
        'term_start' => 'date',
        'term_end' => 'date',
        'term_number' => 'integer',
        'is_current_term' => 'boolean',
        'election_date' => 'date',
        'votes_received' => 'integer',
        'is_elected' => 'boolean',
        'status_date' => 'date',
        'performance_rating' => 'integer',
        'committee_assignments' => 'array',
        'committee_memberships' => 'array',
        'trainings_attended' => 'array',
        'certifications' => 'array',
        'projects_initiated' => 'array',
        'social_media_accounts' => 'array',
        'documents' => 'array',
        'oath_taking_date' => 'date',
        'session_attendance_rate' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Constants for prefix values
     */
    const PREFIX_MR = 'Mr.';
    const PREFIX_MS = 'Ms.';
    const PREFIX_MRS = 'Mrs.';
    const PREFIX_DR = 'Dr.';
    const PREFIX_HON = 'Hon.';

    /**
     * Constants for gender values
     */
    const GENDER_MALE = 'MALE';
    const GENDER_FEMALE = 'FEMALE';

    /**
     * Constants for position values
     */
    const POSITION_BARANGAY_CAPTAIN = 'BARANGAY_CAPTAIN';
    const POSITION_BARANGAY_SECRETARY = 'BARANGAY_SECRETARY';
    const POSITION_BARANGAY_TREASURER = 'BARANGAY_TREASURER';
    const POSITION_KAGAWAD = 'KAGAWAD';
    const POSITION_SK_CHAIRPERSON = 'SK_CHAIRPERSON';
    const POSITION_SK_KAGAWAD = 'SK_KAGAWAD';
    const POSITION_BARANGAY_CLERK = 'BARANGAY_CLERK';
    const POSITION_BARANGAY_TANOD = 'BARANGAY_TANOD';

    /**
     * Constants for status values
     */
    const STATUS_ACTIVE = 'ACTIVE';
    const STATUS_INACTIVE = 'INACTIVE';
    const STATUS_SUSPENDED = 'SUSPENDED';
    const STATUS_RESIGNED = 'RESIGNED';
    const STATUS_TERMINATED = 'TERMINATED';
    const STATUS_DECEASED = 'DECEASED';

    /**
     * Get the validation rules for creating a new barangay official
     */
    public static function getCreateRules(): array
    {
        return [
            'resident_id' => 'required|exists:residents,id',
            'user_id' => 'required|exists:users,id',
            'prefix' => 'nullable|in:Mr.,Ms.,Mrs.,Dr.,Hon.',
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'suffix' => 'nullable|string|max:10',
            'full_name' => 'nullable|string|max:500',
            'birth_date' => 'required|date',
            'gender' => 'required|in:MALE,FEMALE',
            'contact_number' => 'nullable|string|max:20',
            'email_address' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'position' => 'required|in:BARANGAY_CAPTAIN,BARANGAY_SECRETARY,BARANGAY_TREASURER,KAGAWAD,SK_CHAIRPERSON,SK_KAGAWAD,BARANGAY_CLERK,BARANGAY_TANOD',
            'position_title' => 'nullable|string|max:255',
            'committee_assignments' => 'nullable|array',
            'committee_memberships' => 'nullable|array',
            'term_start' => 'required|date',
            'term_end' => 'required|date',
            'term_number' => 'nullable|integer|min:0',
            'is_current_term' => 'nullable|boolean',
            'election_date' => 'nullable|date',
            'votes_received' => 'nullable|integer|min:0',
            'is_elected' => 'nullable|boolean',
            'appointment_document' => 'nullable|string|max:500',
            'status' => 'nullable|in:ACTIVE,INACTIVE,SUSPENDED,RESIGNED,TERMINATED,DECEASED',
            'status_date' => 'nullable|date',
            'status_reason' => 'nullable|string',
            'educational_background' => 'nullable|string',
            'work_experience' => 'nullable|string',
            'skills_expertise' => 'nullable|string',
            'trainings_attended' => 'nullable|array',
            'certifications' => 'nullable|array',
            'major_accomplishments' => 'nullable|string',
            'projects_initiated' => 'nullable|array',
            'performance_notes' => 'nullable|string',
            'performance_rating' => 'nullable|integer|min:1|max:5',
            'emergency_contact_name' => 'nullable|string|max:255',
            'emergency_contact_number' => 'nullable|string|max:20',
            'emergency_contact_relationship' => 'nullable|string|max:100',
            'social_media_accounts' => 'nullable|array',
            'documents' => 'nullable|array',
            'profile_photo' => 'nullable|string|max:500',
            'digital_signature' => 'nullable|string|max:500',
            'oath_taking_date' => 'nullable|date',
            'oath_taking_notes' => 'nullable|string',
            'legal_issues' => 'nullable|string',
            'ethical_violations' => 'nullable|string',
            'session_attendance_rate' => 'nullable|numeric|min:0|max:100',
            'committee_participation' => 'nullable|string',
            'community_engagement' => 'nullable|string',
            'remarks' => 'nullable|string',
            'bio_summary' => 'nullable|string',
            'personal_mission' => 'nullable|string',
            'created_by' => 'nullable|exists:users,id',
            'updated_by' => 'nullable|exists:users,id',
        ];
    }

    /**
     * Get the validation rules for updating a barangay official
     */
    public static function getUpdateRules(): array
    {
        return [
            'resident_id' => 'sometimes|required|exists:residents,id',
            'user_id' => 'sometimes|required|exists:users,id',
            'prefix' => 'nullable|in:Mr.,Ms.,Mrs.,Dr.,Hon.',
            'first_name' => 'sometimes|required|string|max:255',
            'last_name' => 'sometimes|required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'suffix' => 'nullable|string|max:10',
            'full_name' => 'nullable|string|max:500',
            'birth_date' => 'sometimes|required|date',
            'gender' => 'sometimes|required|in:MALE,FEMALE',
            'contact_number' => 'nullable|string|max:20',
            'email_address' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'position' => 'sometimes|required|in:BARANGAY_CAPTAIN,BARANGAY_SECRETARY,BARANGAY_TREASURER,KAGAWAD,SK_CHAIRPERSON,SK_KAGAWAD,BARANGAY_CLERK,BARANGAY_TANOD',
            'position_title' => 'nullable|string|max:255',
            'committee_assignments' => 'nullable|array',
            'committee_memberships' => 'nullable|array',
            'term_start' => 'sometimes|required|date',
            'term_end' => 'sometimes|required|date',
            'term_number' => 'nullable|integer|min:0',
            'is_current_term' => 'nullable|boolean',
            'election_date' => 'nullable|date',
            'votes_received' => 'nullable|integer|min:0',
            'is_elected' => 'nullable|boolean',
            'appointment_document' => 'nullable|string|max:500',
            'status' => 'nullable|in:ACTIVE,INACTIVE,SUSPENDED,RESIGNED,TERMINATED,DECEASED',
            'status_date' => 'nullable|date',
            'status_reason' => 'nullable|string',
            'educational_background' => 'nullable|string',
            'work_experience' => 'nullable|string',
            'skills_expertise' => 'nullable|string',
            'trainings_attended' => 'nullable|array',
            'certifications' => 'nullable|array',
            'major_accomplishments' => 'nullable|string',
            'projects_initiated' => 'nullable|array',
            'performance_notes' => 'nullable|string',
            'performance_rating' => 'nullable|integer|min:1|max:5',
            'emergency_contact_name' => 'nullable|string|max:255',
            'emergency_contact_number' => 'nullable|string|max:20',
            'emergency_contact_relationship' => 'nullable|string|max:100',
            'social_media_accounts' => 'nullable|array',
            'documents' => 'nullable|array',
            'profile_photo' => 'nullable|string|max:500',
            'digital_signature' => 'nullable|string|max:500',
            'oath_taking_date' => 'nullable|date',
            'oath_taking_notes' => 'nullable|string',
            'legal_issues' => 'nullable|string',
            'ethical_violations' => 'nullable|string',
            'session_attendance_rate' => 'nullable|numeric|min:0|max:100',
            'committee_participation' => 'nullable|string',
            'community_engagement' => 'nullable|string',
            'remarks' => 'nullable|string',
            'bio_summary' => 'nullable|string',
            'personal_mission' => 'nullable|string',
            'created_by' => 'nullable|exists:users,id',
            'updated_by' => 'nullable|exists:users,id',
        ];
    }

    /**
     * Relationships
     */
    public function resident(): BelongsTo
    {
        return $this->belongsTo(Resident::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
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
        });
    }

    /**
     * Sync personal data from the associated resident
     */
    public function syncPersonalDataFromResident(): void
    {
        if ($this->resident_id && $this->resident) {
            /** @var Resident $resident */
            $resident = $this->resident;
            $this->first_name = $resident->first_name;
            $this->middle_name = $resident->middle_name;
            $this->last_name = $resident->last_name;
            $this->suffix = $resident->suffix;
            $this->full_name = $resident->full_name;
            $this->birth_date = $resident->birth_date;
            $this->gender = $resident->gender;
            $this->contact_number = $resident->contact_number ?? $resident->mobile_number ?? null;
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

    public function startNewTerm(Carbon $startDate, Carbon $endDate, ?int $termNumber = null): void
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