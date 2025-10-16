<?php

namespace App\Models;

use App\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use OwenIt\Auditing\Contracts\Auditable;
use Illuminate\Support\Facades\Auth;

/**
 * @property int|null $total_households Aggregated total households count
 * @property int|null $four_ps_beneficiaries Aggregated 4Ps beneficiaries count
 * @property int|null $indigent_families Aggregated indigent families count
 * @property int|null $with_senior_citizens Aggregated households with senior citizens count
 * @property int|null $with_pwd_members Aggregated households with PWD members count
 * @property int|null $with_electricity Aggregated households with electricity count
 * @property int|null $with_water_supply Aggregated households with water supply count
 * @property int|null $with_internet_access Aggregated households with internet access count
 */
class Household extends Model implements Auditable
{
    use HasFactory, HasUuids, LogsActivity, \OwenIt\Auditing\Auditable;

    protected $auditModel = ActivityLog::class;
    protected $keyType = 'string';
    public $incrementing = false;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'household_number',
        'household_type',
        'head_resident_id',
        'house_number',
        'street_sitio',
        'barangay',
        'complete_address',
        'monthly_income',
        'primary_income_source',
        'four_ps_beneficiary',
        'indigent_family',
        'has_senior_citizen',
        'has_pwd_member',
        'house_type',
        'ownership_status',
        'has_electricity',
        'has_water_supply',
        'has_internet_access',
        'status',
        'remarks',
        'created_by',
        'updated_by',
    ];
    
    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'id' => 'string',
        'four_ps_beneficiary' => 'boolean',
        'indigent_family' => 'boolean',
        'has_senior_citizen' => 'boolean',
        'has_pwd_member' => 'boolean',
        'has_electricity' => 'boolean',
        'has_water_supply' => 'boolean',
        'has_internet_access' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
    
    /**
     * The attributes that should be hidden for serialization.
     */
    protected $hidden = [
        'created_by',
        'updated_by',
    ];

    /**
     * The attributes that should be appended to the model's array form.
     */
    protected $appends = [
        'has_head_resident',
        'member_count',
    ];

    /**
     * Constants for household types
     */
    const HOUSEHOLD_TYPES = ['NUCLEAR', 'EXTENDED', 'SINGLE', 'SINGLE_PARENT', 'OTHER'];
    
    /**
     * Constants for income ranges
     */
    const INCOME_RANGES = ['BELOW_10000', 'RANGE_10000_25000', 'RANGE_25000_50000', 'RANGE_50000_100000', 'ABOVE_100000'];
    
    /**
     * Constants for house types
     */
    const HOUSE_TYPES = ['CONCRETE', 'SEMI_CONCRETE', 'WOOD', 'BAMBOO', 'MIXED'];
    
    /**
     * Constants for ownership status
     */
    const OWNERSHIP_STATUS = ['OWNED', 'RENTED', 'SHARED', 'INFORMAL_SETTLER'];
    
    /**
     * Constants for status
     */
    const STATUS_OPTIONS = ['ACTIVE', 'INACTIVE', 'TRANSFERRED'];
    
    /**
     * Constants for relationship types
     */
    const RELATIONSHIP_TYPES = [
        'HEAD', 'SPOUSE', 'SON', 'DAUGHTER', 'FATHER', 'MOTHER',
        'BROTHER', 'SISTER', 'GRANDFATHER', 'GRANDMOTHER', 'GRANDSON',
        'GRANDDAUGHTER', 'UNCLE', 'AUNT', 'NEPHEW', 'NIECE', 'COUSIN',
        'IN_LAW', 'BOARDER', 'OTHER'
    ];

    /**
     * Get the validation rules for creating a new household
     */
    public static function getCreateRules(): array
    {
        return [
            'household_number' => 'required|string|max:50|unique:households,household_number',
            'household_type' => 'required|in:NUCLEAR,EXTENDED,SINGLE,SINGLE_PARENT,OTHER',
            'head_resident_id' => 'nullable|exists:residents,id',
            'house_number' => 'required|string|max:50',
            'street_sitio' => 'required|string|max:100',
            'barangay' => 'required|string|max:100',
            'complete_address' => 'required|string',
            'monthly_income' => 'nullable|in:BELOW_10000,RANGE_10000_25000,RANGE_25000_50000,RANGE_50000_100000,ABOVE_100000',
            'primary_income_source' => 'nullable|string|max:255',
            'four_ps_beneficiary' => 'nullable|boolean',
            'indigent_family' => 'nullable|boolean',
            'has_senior_citizen' => 'nullable|boolean',
            'has_pwd_member' => 'nullable|boolean',
            'house_type' => 'nullable|in:CONCRETE,SEMI_CONCRETE,WOOD,BAMBOO,MIXED',
            'ownership_status' => 'nullable|in:OWNED,RENTED,SHARED,INFORMAL_SETTLER',
            'has_electricity' => 'nullable|boolean',
            'has_water_supply' => 'nullable|boolean',
            'has_internet_access' => 'nullable|boolean',
            'status' => 'nullable|in:ACTIVE,INACTIVE,TRANSFERRED',
            'remarks' => 'nullable|string',
            'created_by' => 'nullable|exists:users,id',
            'updated_by' => 'nullable|exists:users,id',
        ];
    }

    /**
     * Get the validation rules for updating a household
     */
    public static function getUpdateRules($id = null): array
    {
        return [
            'household_number' => 'sometimes|required|string|max:50|unique:households,household_number' . ($id ? ",$id" : ''),
            'household_type' => 'sometimes|required|in:NUCLEAR,EXTENDED,SINGLE,SINGLE_PARENT,OTHER',
            'head_resident_id' => 'nullable|exists:residents,id',
            'house_number' => 'sometimes|required|string|max:50',
            'street_sitio' => 'sometimes|required|string|max:100',
            'barangay' => 'sometimes|required|string|max:100',
            'complete_address' => 'sometimes|required|string',
            'monthly_income' => 'nullable|in:BELOW_10000,RANGE_10000_25000,RANGE_25000_50000,RANGE_50000_100000,ABOVE_100000',
            'primary_income_source' => 'nullable|string|max:255',
            'four_ps_beneficiary' => 'nullable|boolean',
            'indigent_family' => 'nullable|boolean',
            'has_senior_citizen' => 'nullable|boolean',
            'has_pwd_member' => 'nullable|boolean',
            'house_type' => 'nullable|in:CONCRETE,SEMI_CONCRETE,WOOD,BAMBOO,MIXED',
            'ownership_status' => 'nullable|in:OWNED,RENTED,SHARED,INFORMAL_SETTLER',
            'has_electricity' => 'nullable|boolean',
            'has_water_supply' => 'nullable|boolean',
            'has_internet_access' => 'nullable|boolean',
            'status' => 'nullable|in:ACTIVE,INACTIVE,TRANSFERRED',
            'remarks' => 'nullable|string',
            'created_by' => 'nullable|exists:users,id',
            'updated_by' => 'nullable|exists:users,id',
        ];
    }

    /**
     * Get validation rules for member relationships
     */
    public static function getMemberValidationRules(): array
    {
        return [
            'member_ids' => 'nullable|array',
            'member_ids.*.resident_id' => [
                'required',
                'string',
                'exists:residents,id',
                function ($attribute, $value, $fail) {
                    $headResidentId = request()->input('head_resident_id');
                    if ($headResidentId && $value === $headResidentId) {
                        $fail('A resident cannot be both household head and a member.');
                    }
                },
            ],
            'member_ids.*.relationship' => 'required|string|in:HEAD,SPOUSE,SON,DAUGHTER,FATHER,MOTHER,BROTHER,SISTER,GRANDFATHER,GRANDMOTHER,GRANDSON,GRANDDAUGHTER,UNCLE,AUNT,NEPHEW,NIECE,COUSIN,IN_LAW,BOARDER,OTHER',
        ];
    }

    /**
     * Boot the model
     */
    protected static function boot()
    {
        parent::boot();
        
        // Household number is now generated on the frontend side
        // Following the principle that frontend is the source of truth
    }

    /**
     * Relationship: Head Resident
     */
    public function headResident(): BelongsTo
    {
        return $this->belongsTo(Resident::class, 'head_resident_id');
    }

    /**
     * Relationship: All Members (including head) via pivot table
     */
    public function members(): BelongsToMany
    {
        return $this->belongsToMany(Resident::class, 'household_members')
            ->withPivot('relationship')
            ->withTimestamps()
            ->orderBy('household_members.relationship')
            ->orderBy('residents.last_name');
    }

    /**
     * Relationship: Non-head members only
     */
    public function nonHeadMembers(): BelongsToMany
    {
        return $this->members()->wherePivot('relationship', '!=', 'HEAD');
    }

    /**
     * Relationship: Head member via pivot table
     */
    public function headMember(): BelongsToMany
    {
        return $this->members()->wherePivot('relationship', 'HEAD');
    }

    /**
     * Relationship: Created by user
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Relationship: Updated by user
     */
    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Relationship: Document requests from any household member
     */
    public function documentRequests(): HasMany
    {
        return $this->hasMany(Document::class, 'household_id');
    }

    /**
     * Convenience Methods for Household Relationships
     */
    public function head(): ?Resident
    {
        /** @var Resident|null $head */
        $head = $this->members()->wherePivot('relationship', 'HEAD')->first();
        return $head;
    }

    public function memberCount(): int
    {
        return $this->members()->count();
    }

    public function children(): \Illuminate\Database\Eloquent\Collection
    {
        return $this->members()->wherePivotIn('relationship', ['SON', 'DAUGHTER'])->get();
    }

    public function adults(): \Illuminate\Database\Eloquent\Collection
    {
        return $this->members()->wherePivotNotIn('relationship', ['SON', 'DAUGHTER'])->get();
    }

    public function spouses(): \Illuminate\Database\Eloquent\Collection
    {
        return $this->members()->wherePivot('relationship', 'SPOUSE')->get();
    }

    /**
     * Scopes for filtering
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'ACTIVE');
    }

    public function scopeFourPs($query)
    {
        return $query->where('four_ps_beneficiary', true);
    }

    public function scopeIndigent($query)
    {
        return $query->where('indigent_family', true);
    }

    public function scopeWithSeniorCitizen($query)
    {
        return $query->where('has_senior_citizen', true);
    }

    public function scopeWithPwd($query)
    {
        return $query->where('has_pwd_member', true);
    }

    public function scopeByBarangay($query, $barangay)
    {
        return $query->where('barangay', $barangay);
    }

    public function scopeByHouseType($query, $houseType)
    {
        return $query->where('house_type', $houseType);
    }

    public function scopeByOwnershipStatus($query, $ownershipStatus)
    {
        return $query->where('ownership_status', $ownershipStatus);
    }

    public function scopeByIncomeRange($query, $incomeRange)
    {
        return $query->where('monthly_income', $incomeRange);
    }

    public function scopeSearch($query, $search)
    {
        if (empty($search)) {
            return $query;
        }

        return $query->where(function ($q) use ($search) {
            $q->where('household_number', 'like', "%{$search}%")
              ->orWhere('complete_address', 'like', "%{$search}%")
              ->orWhereHas('headResident', function ($headQuery) use ($search) {
                  $headQuery->where('first_name', 'like', "%{$search}%")
                           ->orWhere('last_name', 'like', "%{$search}%")
                           ->orWhere('middle_name', 'like', "%{$search}%");
              });
        });
    }

    /**
     * Accessors
     */
    public function getMemberCountAttribute(): int
    {
        return $this->members()->count();
    }

    public function getHasHeadResidentAttribute(): bool
    {
        return !is_null($this->head_resident_id);
    }

    public function getFullAddressAttribute(): string
    {
        return "{$this->house_number} {$this->street_sitio}, {$this->barangay}";
    }

    /**
     * Methods for managing household members
     */
    public function addMember(Resident $resident, string $relationship = 'OTHER'): void
    {
        $this->members()->attach($resident->id, [
            'relationship' => $relationship,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // If adding as head, update the head_resident_id
        if ($relationship === 'HEAD') {
            $this->update(['head_resident_id' => $resident->id]);
        }
    }

    public function removeMember(Resident $resident): void
    {
        $this->members()->detach($resident->id);

        // If removing the head, clear head_resident_id
        if ($this->head_resident_id === $resident->id) {
            $this->update(['head_resident_id' => null]);
        }
    }

    public function updateMemberRelationship(Resident $resident, string $relationship): void
    {
        $this->members()->updateExistingPivot($resident->id, [
            'relationship' => $relationship,
            'updated_at' => now(),
        ]);

        // Handle head relationship changes
        if ($relationship === 'HEAD') {
            $this->update(['head_resident_id' => $resident->id]);
        } elseif ($this->head_resident_id === $resident->id) {
            $this->update(['head_resident_id' => null]);
        }
    }

    public function syncMembers(array $memberData): void
    {
        $syncData = [];
        $newHeadId = null;

        foreach ($memberData as $member) {
            $syncData[$member['resident_id']] = [
                'relationship' => $member['relationship'],
                'created_at' => now(),
                'updated_at' => now(),
            ];

            if ($member['relationship'] === 'HEAD') {
                $newHeadId = $member['resident_id'];
            }
        }

        $this->members()->sync($syncData);
        $this->update(['head_resident_id' => $newHeadId]);
    }

    /**
     * Check if household has a specific resident as member
     */
    public function hasMember(Resident $resident): bool
    {
        return $this->members()->where('residents.id', $resident->id)->exists();
    }

    /**
     * Get member relationship
     */
    public function getMemberRelationship(Resident $resident): ?string
    {
        $member = $this->members()->where('residents.id', $resident->id)->first();
        if (!$member) {
            return null;
        }
        
        return $member->pivot->getAttribute('relationship');
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
            'created' => "$user created a new household record",
            'updated' => "$user updated household information",
            'deleted' => "$user deleted a household record",
            default => "$user performed $event action"
        };
    }
}