<?php

namespace App\Models;

use App\Models\Schemas\ResidentSchema;
use App\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class Resident extends Model
{
    use HasFactory, HasUuids, SoftDeletes, LogsActivity;

    protected $keyType = 'string';
    public $incrementing = false;

    /**
     * Get fillable fields from schema
     */
    protected $fillable;
    
    /**
     * Get casts from schema
     */
    protected $casts;

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
        'household_relationship',
        'is_household_head'
    ];
    
    public function __construct(array $attributes = [])
    {
        // Set fillable and casts from schema
        $this->fillable = ResidentSchema::getFillableFields();
        $this->casts = array_merge(
            ResidentSchema::getCasts(),
            [
                'birth_date' => 'date',
                'senior_citizen' => 'boolean',
                'person_with_disability' => 'boolean',
                'indigenous_people' => 'boolean',
                'four_ps_beneficiary' => 'boolean',
                'created_at' => 'datetime',
                'updated_at' => 'datetime',
            ]
        );
        
        parent::__construct($attributes);
    }

    /**
     * Boot the model
     */
    protected static function boot()
    {
        parent::boot();
        
        // Auto-set created_by and updated_by
        static::creating(function ($model) {
            if (Auth::check() && !$model->created_by) {
                $model->created_by = Auth::id();
            }
            
            // Auto-set senior citizen status based on computed age
            if ($model->birth_date) {
                $age = Carbon::parse($model->birth_date)->age;
                if ($age >= 60) {
                    $model->senior_citizen = true;
                }
            }
        });

        static::updating(function ($model) {
            if (Auth::check() && !$model->updated_by) {
                $model->updated_by = Auth::id();
            }
            
            // Update senior citizen status if birth_date changed
            if ($model->isDirty('birth_date') && $model->birth_date) {
                $age = Carbon::parse($model->birth_date)->age;
                $model->senior_citizen = $age >= 60;
            }
        });

        // Sync data to barangay official records when resident data changes
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
                // Sync data to all barangay official records for this resident
                $model->syncToBarangayOfficialRecords();
            }
        });
    }

    /**
     * Sync resident data to all associated barangay official records
     */
    public function syncToBarangayOfficialRecords(): void
    {
        $this->barangayOfficials()->each(function (BarangayOfficial $official) {
            $official->update([
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
            ]);
        });
    }

    /**
     * Computed attributes
     */
    public function getFullNameAttribute(): string
    {
        $parts = array_filter([
            $this->first_name,
            $this->middle_name,
            $this->last_name
        ]);
        
        $fullName = implode(' ', $parts);
        
        if ($this->suffix) {
            $fullName .= ', ' . $this->suffix;
        }
        
        return $fullName;
    }

    public function getInitialsAttribute(): string
    {
        $firstInitial = $this->first_name ? strtoupper(substr($this->first_name, 0, 1)) : '';
        $lastInitial = $this->last_name ? strtoupper(substr($this->last_name, 0, 1)) : '';
        
        return $firstInitial . $lastInitial;
    }

    public function getCalculatedAgeAttribute(): int
    {
        return $this->birth_date ? $this->birth_date->age : 0;
    }

    public function getAgeAttribute(): int
    {
        return $this->getCalculatedAgeAttribute();
    }

    public function getFormattedBirthDateAttribute(): string
    {
        return $this->birth_date ? $this->birth_date->format('F d, Y') : '';
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
        $genderMap = [
            'MALE' => 'Male',
            'FEMALE' => 'Female',
            'NON_BINARY' => 'Non-Binary',
            'PREFER_NOT_TO_SAY' => 'Prefer not to say',
        ];

        return $genderMap[$this->gender] ?? ($this->gender ?: 'Not specified');
    }

    public function getCivilStatusDisplayAttribute(): string
    {
        $statusMap = [
            'SINGLE' => 'Single',
            'LIVE_IN' => 'Live-in',
            'MARRIED' => 'Married',
            'WIDOWED' => 'Widowed',
            'DIVORCED' => 'Divorced',
            'SEPARATED' => 'Separated',
            'ANNULLED' => 'Annulled',
            'PREFER_NOT_TO_SAY' => 'Prefer not to say',
        ];

        return $statusMap[$this->civil_status] ?? ($this->civil_status ?: 'Not specified');
    }

    /**
     * NEW: Household-related computed attributes
     */
    public function getHouseholdRelationshipAttribute(): ?string
    {
        $household = $this->households()->first();
        return $household ? $household->pivot->relationship : null;
    }

    public function getIsHouseholdHeadAttribute(): bool
    {
        return $this->household_relationship === 'HEAD';
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
     */
    public function household(): ?Household
    {
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
     */
    public function currentOfficialPosition(): ?BarangayOfficial
    {
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
        return $this->is_household_head;
    }

    public function belongsToHousehold(): bool
    {
        return $this->households()->exists();
    }

    public function getPrimaryHousehold(): ?Household
    {
        return $this->households()->first();
    }

    public function getHouseholdRelationshipType(): ?string
    {
        return $this->household_relationship;
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
        $array['household_relationship'] = $this->household_relationship;
        $array['is_household_head'] = $this->is_household_head;

        return $array;
    }
}