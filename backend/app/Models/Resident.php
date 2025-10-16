<?php

namespace App\Models;


use App\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;

/**
 * @property-read int $total_documents
 * @property-read int $pending_documents_count
 * @property-read int $total_tickets
 * @property-read int $total_appointments
 * @property-read array<string, mixed> $summary
 * @property-read int $total_residents
 * @property-read int $active_residents
 * @property-read int $inactive_residents
 * @property-read int $male_residents
 * @property-read int $female_residents
 * @property-read int $senior_citizens
 * @property-read int $pwd_residents
 * @property-read int $four_ps_beneficiaries
 * @property-read int $registered_voters
 * @property-read int $employed_residents
 * @property-read int $children
 * @property-read int $adults
 * @property-read int $seniors
 * @property int|null $total Aggregated total count from queries
 */
class Resident extends Model
{
    use HasFactory, HasUuids, SoftDeletes, LogsActivity;

    protected $keyType = 'string';
    public $incrementing = false;

    /**
     * Cached schema data for performance optimization
     */
    private static $cachedGenderMap = null;
    private static $cachedCivilStatusMap = null;
    
    /**
     * Instance-level cache for computed attributes
     */
    private $cachedFullName = null;
    private $cachedAge = null;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'first_name', 'middle_name', 'last_name', 'suffix', 'gender', 'civil_status',
        'birth_date', 'birth_place', 'nationality', 'religion', 'occupation', 'monthly_income',
        'educational_attainment', 'contact_number', 'email_address', 'emergency_contact_name',
        'emergency_contact_number', 'relationship_to_emergency_contact', 'house_number',
        'street_sitio', 'barangay', 'municipality', 'province', 'postal_code', 'complete_address',
        'is_registered_voter', 'voter_id_number', 'precinct_number', 'senior_citizen',
        'senior_citizen_id', 'person_with_disability', 'pwd_id', 'indigenous_people',
        'tribe_ethnicity', 'four_ps_beneficiary', 'four_ps_id', 'philhealth_member',
        'philhealth_id', 'sss_member', 'sss_id', 'tin_number', 'blood_type', 'height_cm',
        'weight_kg', 'medical_conditions', 'allergies', 'medications', 'created_by', 'updated_by'
    ];
    
    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'birth_date' => 'datetime',
        'senior_citizen' => 'boolean',
        'person_with_disability' => 'boolean',
        'indigenous_people' => 'boolean',
        'four_ps_beneficiary' => 'boolean',
        'is_registered_voter' => 'boolean',
        'philhealth_member' => 'boolean',
        'sss_member' => 'boolean',
        'height_cm' => 'decimal:2',
        'weight_kg' => 'decimal:2',
        'monthly_income' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * The attributes that should be hidden for serialization.
     */
    protected $hidden = [];

    /**
     * Additional dates for Carbon instances
     */
    protected $dates = ['deleted_at'];

    /**
     * The attributes that should be appended to the model's array form.
     */
    protected $appends = [
        'full_name',
        'initials', 
        'age',
        'calculated_age',
        'formatted_birth_date',
        'complete_address_display',
        'is_active',
        'is_minor',
        'is_adult', 
        'is_senior',
        'gender_display',
        'civil_status_display',
        'special_classifications',
        'household_relationship'
    ];
    


    /**
     * OPTIMIZED: Boot method with performance improvements
     */
    protected static function boot()
    {
        parent::boot();
        
        // Auto-set created_by and updated_by
        static::creating(function ($model) {
            if (Auth::check() && !$model->created_by) {
                $model->created_by = Auth::id();
            }
            
            // OPTIMIZED: Only calculate age if birth_date is provided and senior_citizen is not set
            if ($model->birth_date && !isset($model->attributes['senior_citizen'])) {
                // Use Carbon for timezone-aware date calculations
                $birthDate = Carbon::parse($model->birth_date);
                $age = $birthDate->age;
                
                if ($age >= 60) {
                    $model->senior_citizen = true;
                }
            }
        });

        static::updating(function ($model) {
            if (Auth::check() && !$model->updated_by) {
                $model->updated_by = Auth::id();
            }
            
            // OPTIMIZED: Only update senior citizen status if birth_date actually changed
            if ($model->isDirty('birth_date') && $model->birth_date) {
                $birthDate = Carbon::parse($model->birth_date);
                $age = $birthDate->age;
                $model->senior_citizen = $age >= 60;
            }
        });

        // OPTIMIZED: Make sync operation async or conditional
        static::updated(function ($model) {
            // Check if personal data fields have changed
            $personalFields = [
                'first_name', 'middle_name', 'last_name', 'suffix', 
                'birth_date', 'gender', 'mobile_number', 'email_address', 
                'complete_address'
            ];
            
            $hasPersonalChanges = collect($personalFields)->some(function ($field) use ($model) {
                return $model->isDirty($field);
            });
            
            if ($hasPersonalChanges) {
                // PERFORMANCE: Queue this operation instead of doing it synchronously
                // or make it conditional based on whether there are actual barangay officials
                if ($model->barangayOfficials()->exists()) {
                    $model->syncToBarangayOfficialRecords();
                }
            }
        });
    }

    /**
     * OPTIMIZED: Sync resident data to barangay official records
     */
    public function syncToBarangayOfficialRecords(): void
    {
        // PERFORMANCE: Use bulk update instead of individual updates
        $updateData = [
            'first_name' => $this->first_name,
            'middle_name' => $this->middle_name,
            'last_name' => $this->last_name,
            'suffix' => $this->suffix,
            'full_name' => $this->full_name,
            'birth_date' => $this->birth_date,
            'gender' => $this->gender,
            'contact_number' => $this->mobile_number,
            'email_address' => $this->email_address,
            'address' => $this->complete_address,
            'updated_at' => now(),
        ];
        
        // Bulk update instead of individual model updates
        BarangayOfficial::where('resident_id', $this->id)
            ->update($updateData);
    }

    /**
     * OPTIMIZED: Computed attributes with caching
     */
    public function getFullNameAttribute(): string
    {
        // Cache full name calculation since it's frequently accessed
        if (!isset($this->cachedFullName)) {
            $parts = array_filter([
                $this->first_name,
                $this->middle_name,
                $this->last_name
            ]);
            
            $fullName = implode(' ', $parts);
            
            if ($this->suffix) {
                $fullName .= ', ' . $this->suffix;
            }
            
            $this->cachedFullName = $fullName;
        }
        
        return $this->cachedFullName;
    }

    public function getInitialsAttribute(): string
    {
        $firstInitial = $this->first_name ? strtoupper(substr($this->first_name, 0, 1)) : '';
        $lastInitial = $this->last_name ? strtoupper(substr($this->last_name, 0, 1)) : '';
        
        return $firstInitial . $lastInitial;
    }

    public function getCalculatedAgeAttribute(): int
    {
        if (!$this->birth_date) {
            return 0;
        }
        
        // Cache age calculation to avoid repeated Carbon parsing
        if (!isset($this->cachedAge)) {
            $this->cachedAge = $this->birth_date->age;
        }
        
        return $this->cachedAge;
    }

    public function getAgeAttribute(): int
    {
        return $this->getCalculatedAgeAttribute();
    }

    public function getFormattedBirthDateAttribute(): string
    {
        if (!$this->birth_date) {
            return '';
        }
        return $this->birth_date->format('F d, Y');
    }

    public function getCompleteAddressDisplayAttribute(): string
    {
        $addressParts = array_filter([
            $this->house_number,
            $this->street,
            $this->barangay,
            $this->city,
            $this->province,
            $this->region
        ]);
        
        return implode(', ', $addressParts) ?: ($this->complete_address ?? 'Address not available');
    }

    public function getIsActiveAttribute(): bool
    {
        return $this->status === 'ACTIVE';
    }

    public function getIsMinorAttribute(): bool
    {
        return $this->calculated_age < 18;
    }

    public function getIsAdultAttribute(): bool
    {
        return $this->calculated_age >= 18 && $this->calculated_age < 60;
    }

    public function getIsSeniorAttribute(): bool
    {
        return $this->calculated_age >= 60;
    }

    public function getGenderDisplayAttribute(): string
    {
        if (self::$cachedGenderMap === null) {
            self::$cachedGenderMap = [
                'MALE' => 'Male',
                'FEMALE' => 'Female',
                'NON_BINARY' => 'Non-Binary',
                'PREFER_NOT_TO_SAY' => 'Prefer not to say',
            ];
        }

        return self::$cachedGenderMap[$this->gender] ?? ($this->gender ?: 'Not specified');
    }

    public function getCivilStatusDisplayAttribute(): string
    {
        if (self::$cachedCivilStatusMap === null) {
            self::$cachedCivilStatusMap = [
                'SINGLE' => 'Single',
                'LIVE_IN' => 'Live-in',
                'MARRIED' => 'Married',
                'WIDOWED' => 'Widowed',
                'DIVORCED' => 'Divorced',
                'SEPARATED' => 'Separated',
                'ANNULLED' => 'Annulled',
                'PREFER_NOT_TO_SAY' => 'Prefer not to say',
            ];
        }

        return self::$cachedCivilStatusMap[$this->civil_status] ?? ($this->civil_status ?: 'Not specified');
    }

    /**
     * NEW: Household-related computed attributes
     */
    public function getHouseholdRelationshipAttribute(): ?string
    {
        $household = $this->households()->first();
        /** @var \Illuminate\Database\Eloquent\Relations\Pivot|null $pivot */
        $pivot = $household?->pivot;
        return $pivot->relationship ?? null;
    }

    public function getIsHouseholdHeadAttribute(): bool
    {
        return $this->getHouseholdRelationshipAttribute() === 'HEAD';
    }

    /**
     * UPDATED: Household Relationships (using pivot table)
     */
    public function households(): BelongsToMany
    {
        return $this->belongsToMany(Household::class, 'household_members')
            ->withPivot('relationship')
            ->withTimestamps();
    }

    /**
     * NEW: Get the primary household (residents should only be in one household)
     * @return Household|null
     */
    public function household(): ?Household
    {
        /** @var Household|null */
        return $this->households()->first();
    }

    /**
     * UPDATED: Households where this resident is the head
     */
    public function householdsAsHead(): HasMany
    {
        return $this->hasMany(Household::class, 'head_resident_id');
    }

    /**
     * Document relationships
     */
    public function documents(): HasMany
    {
        return $this->hasMany(Document::class, 'resident_id', 'id');
    }

    /**
     * Barangay official relationship
     */
    public function barangayOfficials(): HasMany
    {
        return $this->hasMany(BarangayOfficial::class, 'resident_id', 'id');
    }

    /**
     * Get the current active barangay official record for this resident
     * @return BarangayOfficial|null
     */
    public function currentOfficialPosition(): ?BarangayOfficial
    {
        /** @var BarangayOfficial|null */
        return $this->barangayOfficials()
            ->where('status', 'ACTIVE')
            ->where('is_current_term', true)
            ->first();
    }

    /**
     * Check if this resident is currently a barangay official
     */
    public function isBarangayOfficial(): bool
    {
        return $this->currentOfficialPosition() !== null;
    }

    /**
     * Help desk relationships
     */
    public function tickets(): HasMany
    {
        return $this->hasMany(Ticket::class, 'resident_id', 'id');
    }

    public function complaints(): HasMany
    {
        return $this->hasMany(Complaint::class, 'resident_id', 'id');
    }

    public function suggestions(): HasMany
    {
        return $this->hasMany(Suggestion::class, 'resident_id', 'id');
    }

    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class, 'resident_id', 'id');
    }

    /**
     * Blotter case relationships
     */
    public function complainantBlotterCases(): HasMany
    {
        return $this->hasMany(Blotter::class, 'complainant_resident_id', 'id');
    }

    public function respondentBlotterCases(): HasMany
    {
        return $this->hasMany(Blotter::class, 'respondent_resident_id', 'id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Scopes (mostly unchanged, some updated for pivot table)
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'ACTIVE');
    }

    public function scopeInactive($query)
    {
        return $query->where('status', 'INACTIVE');
    }

    public function scopeDeceased($query)
    {
        return $query->where('status', 'DECEASED');
    }

    public function scopeTransferred($query)
    {
        return $query->where('status', 'TRANSFERRED');
    }

    public function scopeSeniorCitizens($query)
    {
        return $query->where('senior_citizen', true);
    }

    public function scopePwd($query)
    {
        return $query->where('person_with_disability', true);
    }

    public function scopeIndigenous($query)
    {
        return $query->where('indigenous_people', true);
    }

    public function scopeFourPs($query)
    {
        return $query->where('four_ps_beneficiary', true);
    }

    /**
     * UPDATED: Household-related scopes using pivot table
     */
    public function scopeHouseholdHeads($query)
    {
        return $query->whereHas('households', function ($q) {
            $q->where('household_members.relationship', 'HEAD');
        });
    }

    public function scopeHouseholdMembers($query)
    {
        return $query->whereHas('households', function ($q) {
            $q->where('household_members.relationship', '!=', 'HEAD');
        });
    }

    public function scopeWithoutHousehold($query)
    {
        return $query->whereDoesntHave('households');
    }

    public function scopeWithHousehold($query)
    {
        return $query->whereHas('households');
    }

    public function scopeByHouseholdRelationship($query, $relationship)
    {
        return $query->whereHas('households', function ($q) use ($relationship) {
            $q->where('household_members.relationship', $relationship);
        });
    }

    /**
     * Other scopes (unchanged)
     */
    public function scopeByGender($query, $gender)
    {
        return $query->where('gender', $gender);
    }

    public function scopeByCivilStatus($query, $status)
    {
        return $query->where('civil_status', $status);
    }

    public function scopeByEmploymentStatus($query, $status)
    {
        return $query->where('employment_status', $status);
    }

    public function scopeByVoterStatus($query, $status)
    {
        return $query->where('voter_status', $status);
    }

    public function scopeByAgeRange($query, $minAge, $maxAge)
    {
        $today = Carbon::today();
        $maxBirthDate = $today->copy()->subYears($minAge);
        $minBirthDate = $today->copy()->subYears($maxAge + 1);
        
        return $query->whereBetween('birth_date', [$minBirthDate, $maxBirthDate]);
    }

    /**
     * Search scope for residents
     * Searches across name fields, contact info, and other searchable fields
     */
    public function scopeSearch($query, $search)
    {
        if (empty($search)) {
            return $query;
        }

        $search = trim($search);
        
        return $query->where(function ($q) use ($search) {
            // Direct search in all text fields
            $q->where('first_name', 'ILIKE', "%{$search}%")
              ->orWhere('middle_name', 'ILIKE', "%{$search}%")
              ->orWhere('last_name', 'ILIKE', "%{$search}%")
              ->orWhere('mobile_number', 'ILIKE', "%{$search}%")
              ->orWhere('email_address', 'ILIKE', "%{$search}%")
              
              // Combination of first name last name
              ->orWhereRaw("CONCAT(first_name, ' ', last_name) ILIKE ?", ["%{$search}%"])
              ->orWhereRaw("CONCAT(last_name, ' ', first_name) ILIKE ?", ["%{$search}%"])
              ->orWhere('suffix', 'ILIKE', "%{$search}%")
              ->orWhere('birth_place', 'ILIKE', "%{$search}%")
              ->orWhere('barangay', 'ILIKE', "%{$search}%")
              ->orWhere('street', 'ILIKE', "%{$search}%")
              ->orWhere('house_number', 'ILIKE', "%{$search}%")
              ->orWhere('complete_address', 'ILIKE', "%{$search}%")
              ->orWhere('mother_name', 'ILIKE', "%{$search}%")
              ->orWhere('father_name', 'ILIKE', "%{$search}%")
              ->orWhere('occupation', 'ILIKE', "%{$search}%")
              ->orWhere('employer', 'ILIKE', "%{$search}%")
              ->orWhere('id_number', 'ILIKE', "%{$search}%")
              ->orWhere('philhealth_number', 'ILIKE', "%{$search}%")
              ->orWhere('sss_number', 'ILIKE', "%{$search}%")
              ->orWhere('tin_number', 'ILIKE', "%{$search}%")
              ->orWhere('voters_id_number', 'ILIKE', "%{$search}%")
              ->orWhere('precinct_number', 'ILIKE', "%{$search}%")
              
              // Search by enum values if they match
              ->orWhere('gender', 'ILIKE', "%{$search}%")
              ->orWhere('civil_status', 'ILIKE', "%{$search}%")
              ->orWhere('nationality', 'ILIKE', "%{$search}%")
              ->orWhere('religion', 'ILIKE', "%{$search}%")
              ->orWhere('educational_attainment', 'ILIKE', "%{$search}%")
              ->orWhere('employment_status', 'ILIKE', "%{$search}%")
              ->orWhere('voter_status', 'ILIKE', "%{$search}%")
              ->orWhere('status', 'ILIKE', "%{$search}%");
        });
    }

    public function scopeMinors($query)
    {
        $eighteenYearsAgo = Carbon::today()->subYears(18);
        return $query->where('birth_date', '>', $eighteenYearsAgo);
    }

    public function scopeAdults($query)
    {
        $eighteenYearsAgo = Carbon::today()->subYears(18);
        $sixtyYearsAgo = Carbon::today()->subYears(60);
        return $query->whereBetween('birth_date', [$sixtyYearsAgo, $eighteenYearsAgo]);
    }

    public function scopeSeniors($query)
    {
        $sixtyYearsAgo = Carbon::today()->subYears(60);
        return $query->where('birth_date', '<=', $sixtyYearsAgo);
    }

    public function scopeVoters($query)
    {
        return $query->where('voter_status', 'REGISTERED');
    }

    /**
     * UPDATED: Helper methods for household management
     */
    public function isHouseholdHead(): bool
    {
        return $this->getIsHouseholdHeadAttribute();
    }

    public function belongsToHousehold(): bool
    {
        return $this->households()->exists();
    }

    /**
     * @return Household|null
     */
    public function getPrimaryHousehold(): ?Household
    {
        /** @var Household|null */
        return $this->households()->first();
    }

    public function getHouseholdRelationshipType(): ?string
    {
        return $this->getHouseholdRelationshipAttribute();
    }

    /**
     * NEW: Household management methods
     */
    public function joinHousehold(Household $household, string $relationship = 'OTHER'): void
    {
        // Remove from any existing household first
        $this->leaveHousehold();
        
        // Join the new household
        $this->households()->attach($household->id, [
            'relationship' => $relationship,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function leaveHousehold(): void
    {
        $this->households()->detach();
    }

    public function updateHouseholdRelationship(string $relationship): void
    {
        $household = $this->getPrimaryHousehold();
        if ($household) {
            $this->households()->updateExistingPivot($household->id, [
                'relationship' => $relationship,
                'updated_at' => now(),
            ]);
        }
    }

    /**
     * Unchanged helper methods
     */
    public function hasSpecialClassification(): bool
    {
        return $this->senior_citizen 
            || $this->person_with_disability 
            || $this->indigenous_people 
            || $this->four_ps_beneficiary;
    }

    public function getSpecialClassificationsAttribute(): array
    {
        $classifications = [];
        
        if ($this->senior_citizen) {
            $classifications[] = 'Senior Citizen';
        }
        
        if ($this->person_with_disability) {
            $classifications[] = 'Person with Disability';
        }
        
        if ($this->indigenous_people) {
            $classifications[] = 'Indigenous People';
        }
        
        if ($this->four_ps_beneficiary) {
            $classifications[] = '4Ps Beneficiary';
        }
        
        return $classifications;
    }

    public function activate(): void
    {
        $this->update(['status' => 'ACTIVE']);
    }

    public function deactivate(): void
    {
        $this->update(['status' => 'INACTIVE']);
    }

    public function markAsDeceased(): void
    {
        $this->update(['status' => 'DECEASED']);
    }

    public function markAsTransferred(): void
    {
        $this->update(['status' => 'TRANSFERRED']);
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
        return match($event) {
            'created' => "$user created a new resident record",
            'updated' => "$user updated resident information",
            'deleted' => "$user deleted a resident record",
            default => "$user performed $event action"
        };
    }

    // Constants for validation
    public const GENDERS = ['MALE', 'FEMALE', 'NON_BINARY', 'PREFER_NOT_TO_SAY'];
    public const CIVIL_STATUSES = ['SINGLE', 'LIVE_IN', 'MARRIED', 'WIDOWED', 'DIVORCED', 'SEPARATED', 'ANNULLED', 'PREFER_NOT_TO_SAY'];
    public const STATUSES = ['ACTIVE', 'INACTIVE', 'DECEASED', 'TRANSFERRED'];
    public const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'UNKNOWN'];
    public const EDUCATIONAL_ATTAINMENTS = [
        'NO_EDUCATION', 'ELEMENTARY_UNDERGRADUATE', 'ELEMENTARY_GRADUATE',
        'HIGH_SCHOOL_UNDERGRADUATE', 'HIGH_SCHOOL_GRADUATE', 'VOCATIONAL',
        'COLLEGE_UNDERGRADUATE', 'COLLEGE_GRADUATE', 'MASTERAL', 'DOCTORAL'
    ];

    /**
     * Get validation rules for creating a resident
     */
    public static function getCreateRules(): array
    {
        return [
            'first_name' => 'required|string|max:100',
            'middle_name' => 'nullable|string|max:100',
            'last_name' => 'required|string|max:100',
            'suffix' => 'nullable|string|max:20',
            'gender' => 'required|string|in:' . implode(',', self::GENDERS),
            'civil_status' => 'required|string|in:' . implode(',', self::CIVIL_STATUSES),
            'birth_date' => 'required|date|before:today',
            'birth_place' => 'nullable|string|max:255',
            'nationality' => 'nullable|string|max:100|default:Filipino',
            'religion' => 'nullable|string|max:100',
            'occupation' => 'nullable|string|max:150',
            'monthly_income' => 'nullable|numeric|min:0|max:9999999.99',
            'educational_attainment' => 'nullable|string|in:' . implode(',', self::EDUCATIONAL_ATTAINMENTS),
            'contact_number' => 'nullable|string|max:20',
            'email_address' => 'nullable|email|max:150',
            'emergency_contact_name' => 'nullable|string|max:150',
            'emergency_contact_number' => 'nullable|string|max:20',
            'relationship_to_emergency_contact' => 'nullable|string|max:100',
            'house_number' => 'nullable|string|max:50',
            'street_sitio' => 'nullable|string|max:150',
            'barangay' => 'nullable|string|max:100',
            'municipality' => 'nullable|string|max:100',
            'province' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:10',
            'complete_address' => 'nullable|string|max:500',
            'is_registered_voter' => 'boolean',
            'voter_id_number' => 'nullable|string|max:50',
            'precinct_number' => 'nullable|string|max:20',
            'senior_citizen' => 'boolean',
            'senior_citizen_id' => 'nullable|string|max:50',
            'person_with_disability' => 'boolean',
            'pwd_id' => 'nullable|string|max:50',
            'indigenous_people' => 'boolean',
            'tribe_ethnicity' => 'nullable|string|max:100',
            'four_ps_beneficiary' => 'boolean',
            'four_ps_id' => 'nullable|string|max:50',
            'philhealth_member' => 'boolean',
            'philhealth_id' => 'nullable|string|max:50',
            'sss_member' => 'boolean',
            'sss_id' => 'nullable|string|max:50',
            'tin_number' => 'nullable|string|max:20',
            'blood_type' => 'nullable|string|in:' . implode(',', self::BLOOD_TYPES),
            'height_cm' => 'nullable|numeric|min:0|max:300',
            'weight_kg' => 'nullable|numeric|min:0|max:500',
            'medical_conditions' => 'nullable|string|max:1000',
            'allergies' => 'nullable|string|max:1000',
            'medications' => 'nullable|string|max:1000',
        ];
    }

    /**
     * Get validation rules for updating a resident
     */
    public static function getUpdateRules(): array
    {
        return [
            'first_name' => 'sometimes|required|string|max:100',
            'middle_name' => 'nullable|string|max:100',
            'last_name' => 'sometimes|required|string|max:100',
            'suffix' => 'nullable|string|max:20',
            'gender' => 'sometimes|required|string|in:' . implode(',', self::GENDERS),
            'civil_status' => 'sometimes|required|string|in:' . implode(',', self::CIVIL_STATUSES),
            'birth_date' => 'sometimes|required|date|before:today',
            'birth_place' => 'nullable|string|max:255',
            'nationality' => 'nullable|string|max:100',
            'religion' => 'nullable|string|max:100',
            'occupation' => 'nullable|string|max:150',
            'monthly_income' => 'nullable|numeric|min:0|max:9999999.99',
            'educational_attainment' => 'nullable|string|in:' . implode(',', self::EDUCATIONAL_ATTAINMENTS),
            'contact_number' => 'nullable|string|max:20',
            'email_address' => 'nullable|email|max:150',
            'emergency_contact_name' => 'nullable|string|max:150',
            'emergency_contact_number' => 'nullable|string|max:20',
            'relationship_to_emergency_contact' => 'nullable|string|max:100',
            'house_number' => 'nullable|string|max:50',
            'street_sitio' => 'nullable|string|max:150',
            'barangay' => 'nullable|string|max:100',
            'municipality' => 'nullable|string|max:100',
            'province' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:10',
            'complete_address' => 'nullable|string|max:500',
            'is_registered_voter' => 'boolean',
            'voter_id_number' => 'nullable|string|max:50',
            'precinct_number' => 'nullable|string|max:20',
            'senior_citizen' => 'boolean',
            'senior_citizen_id' => 'nullable|string|max:50',
            'person_with_disability' => 'boolean',
            'pwd_id' => 'nullable|string|max:50',
            'indigenous_people' => 'boolean',
            'tribe_ethnicity' => 'nullable|string|max:100',
            'four_ps_beneficiary' => 'boolean',
            'four_ps_id' => 'nullable|string|max:50',
            'philhealth_member' => 'boolean',
            'philhealth_id' => 'nullable|string|max:50',
            'sss_member' => 'boolean',
            'sss_id' => 'nullable|string|max:50',
            'tin_number' => 'nullable|string|max:20',
            'blood_type' => 'nullable|string|in:' . implode(',', self::BLOOD_TYPES),
            'height_cm' => 'nullable|numeric|min:0|max:300',
            'weight_kg' => 'nullable|numeric|min:0|max:500',
            'medical_conditions' => 'nullable|string|max:1000',
            'allergies' => 'nullable|string|max:1000',
            'medications' => 'nullable|string|max:1000',
        ];
    }

    /**
     * Get validation rules for creating residents (alias method)
     */
    public static function getCreateValidationRules(): array
    {
        return self::getCreateRules();
    }

    /**
     * Get validation rules for updating residents (alias method)
     */
    public static function getUpdateValidationRules(): array
    {
        return self::getUpdateRules();
    }

    /**
     * Override the default serialization to include computed attributes
     */
    public function toArray()
    {
        $array = parent::toArray();
        
        // Add computed attributes
        $array['full_name'] = $this->full_name;
        $array['initials'] = $this->initials;
        $array['calculated_age'] = $this->calculated_age;
        $array['formatted_birth_date'] = $this->formatted_birth_date;
        $array['complete_address_display'] = $this->complete_address_display;
        $array['is_active'] = $this->is_active;
        $array['is_minor'] = $this->is_minor;
        $array['is_adult'] = $this->is_adult;
        $array['is_senior'] = $this->is_senior;
        $array['gender_display'] = $this->gender_display;
        $array['civil_status_display'] = $this->civil_status_display;
        $array['special_classifications'] = $this->getSpecialClassificationsAttribute();
        $array['household_relationship'] = $this->getHouseholdRelationshipAttribute();
        $array['is_household_head'] = $this->getIsHouseholdHeadAttribute();

        return $array;
    }
}