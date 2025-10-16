<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Resident;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Log;

class ResidentController extends Controller
{
    /**
     * Display a listing of residents (OPTIMIZED)
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Resident::query();

            // Apply filters
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            if ($request->has('barangay')) {
                $query->where('barangay', $request->barangay);
            }

            if ($request->has('search')) {
                $search = $request->search;
                $query->search($search);
            }

            // Special classifications filters
            if ($request->boolean('senior_citizen')) {
                $query->seniorCitizens();
            }

            if ($request->boolean('person_with_disability')) {
                $query->pwd();
            }

            if ($request->boolean('four_ps_beneficiary')) {
                $query->fourPs();
            }

            if ($request->boolean('is_household_head')) {
                $query->householdHeads();
            }

            // Age range filter
            if ($request->has('age_from') && $request->has('age_to')) {
                $query->byAgeRange($request->age_from, $request->age_to);
            }

            // Gender filter
            if ($request->has('gender')) {
                $query->byGender($request->gender);
            }

            // Civil status filter
            if ($request->has('civil_status')) {
                $query->byCivilStatus($request->civil_status);
            }

            // Employment status filter
            if ($request->has('employment_status')) {
                $query->byEmploymentStatus($request->employment_status);
            }

            // Voter status filter
            if ($request->has('voter_status')) {
                $query->byVoterStatus($request->voter_status);
            }

            // OPTIMIZED: Only load necessary relationships for list view
            // Avoid loading heavy relationships unless specifically requested
            $includes = [];
            if ($request->has('include')) {
                $requestedIncludes = explode(',', $request->get('include'));
                $validIncludes = ['households', 'createdBy', 'updatedBy'];
                $includes = array_intersect($requestedIncludes, $validIncludes);
            }

            // Default minimal relationships for performance
            $defaultIncludes = [
                'createdBy:id,first_name,last_name',
                'updatedBy:id,first_name,last_name'
            ];

            // Only add households if specifically requested (expensive join)
            if (in_array('households', $includes)) {
                $defaultIncludes[] = 'households:id,household_number';
            }

            $query->with($defaultIncludes);

            // OPTIMIZED: Use select to limit fields for list view
            $query->select([
                'id', 'first_name', 'last_name', 'middle_name', 'suffix',
                'gender', 'birth_date', 'civil_status', 'complete_address',
                'mobile_number', 'email_address', 'employment_status',
                'senior_citizen', 'person_with_disability', 'four_ps_beneficiary',
                'status', 'profile_photo_url', 'created_at', 'updated_at',
                'created_by', 'updated_by'
            ]);

            // Pagination
            $perPage = $request->get('per_page', 15);
            $residents = $query->orderBy('last_name')
                             ->orderBy('first_name')
                             ->paginate($perPage);

            return response()->json($residents);

        } catch (\Exception $e) {
            Log::error('Failed to retrieve residents', ['error' => $e->getMessage()]);
            return response()->json([
                'message' => 'Failed to retrieve residents',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resident
     */
    public function store(Request $request): JsonResponse
    {
        try {
            // Validate using schema rules
            $validatedData = $request->validate(Resident::getCreateValidationRules());

            // Set created_by if user is authenticated
            if (auth('sanctum')->check()) {
                $validatedData['created_by'] = auth('sanctum')->id();
            }

            // Create the resident
            $resident = Resident::create($validatedData);

            // Load relationships for response
            $resident->load([
                'households',
                'createdBy:id,first_name,last_name'
            ]);

            Log::info('Resident created successfully', ['resident_id' => $resident->id]);

            return response()->json([
                'message' => 'Resident created successfully',
                'data' => $resident
            ], 201);

        } catch (ValidationException $e) {
            Log::warning('Resident creation validation failed', ['errors' => $e->errors()]);
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Failed to create resident', ['error' => $e->getMessage()]);
            return response()->json([
                'message' => 'Failed to create resident',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resident
     */
    public function show(Request $request, Resident $resident): JsonResponse
    {
        try {
            // Support for including relationships via query parameter
            $includes = [];
            if ($request->has('include')) {
                $requestedIncludes = explode(',', $request->get('include'));
                $validIncludes = ['households', 'documents', 'tickets', 'complaints', 'appointments', 'suggestions'];
                $includes = array_intersect($requestedIncludes, $validIncludes);
            }

            // Always load basic relationships
            $defaultIncludes = [
                'households',
                'householdsAsHead',
                'createdBy:id,first_name,last_name',
                'updatedBy:id,first_name,last_name'
            ];

            // Merge with requested includes
            $allIncludes = array_merge($defaultIncludes, $includes);

            $resident->load($allIncludes);

            // Build response with computed relationship counts
            $residentData = $resident->toArray();
            $residentData['total_documents'] = $resident->documents()->count();
            $residentData['pending_documents_count'] = $resident->documents()->where('status', 'PENDING')->count();
            $residentData['total_tickets'] = $resident->tickets()->count();
            $residentData['total_appointments'] = $resident->appointments()->count();

            return response()->json([
                'data' => $residentData
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to retrieve resident', [
                'resident_id' => $resident->id,
                'error' => $e->getMessage()
            ]);
            return response()->json([
                'message' => 'Failed to retrieve resident',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get resident with all relationships loaded
     */
    public function getResidentWithRelationships(Request $request, Resident $resident): JsonResponse
    {
        try {
            $resident->load([
                'households.head:id,first_name,last_name',
                'households.members:id,first_name,last_name',
                'householdsAsHead.members:id,first_name,last_name',
                'documents:id,type,status,submitted_at,processed_at,resident_id',
                'tickets:id,type,status,subject,created_at,resident_id',
                'appointments:id,type,status,date,time,purpose,resident_id',
                'complaints:id,status,incident_date,created_at,resident_id',
                'suggestions:id,status,subject,created_at,resident_id',
                'createdBy:id,first_name,last_name',
                'updatedBy:id,first_name,last_name'
            ]);

            // Build summary counts separately
            $summary = [
                'total_documents' => $resident->documents->count(),
                'pending_documents' => $resident->documents->where('status', 'PENDING')->count(),
                'approved_documents' => $resident->documents->where('status', 'APPROVED')->count(),
                'total_tickets' => $resident->tickets->count(),
                'open_tickets' => $resident->tickets->where('status', 'OPEN')->count(),
                'total_appointments' => $resident->appointments->count(),
                'upcoming_appointments' => $resident->appointments->where('date', '>=', now()->toDateString())->count(),
                'total_households' => $resident->households->count() + $resident->householdsAsHead->count()
            ];

            $residentData = $resident->toArray();
            $residentData['summary'] = $summary;

            return response()->json([
                'data' => $residentData
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to retrieve resident with relationships', [
                'resident_id' => $resident->id,
                'error' => $e->getMessage()
            ]);
            return response()->json([
                'message' => 'Failed to retrieve resident with relationships',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get resident's households
     */
    public function getResidentHouseholds(Request $request, Resident $resident): JsonResponse
    {
        try {
            $households = $resident->households()->with([
                'head:id,first_name,last_name,middle_name',
                'members:id,first_name,last_name,middle_name,relationship_to_head'
            ])->get();

            $householdsAsHead = $resident->householdsAsHead()->with([
                'members:id,first_name,last_name,middle_name,relationship_to_head'
            ])->get();

            return response()->json([
                'data' => [
                    'member_of_households' => $households,
                    'head_of_households' => $householdsAsHead,
                    'total_households' => $households->count() + $householdsAsHead->count()
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to retrieve resident households', [
                'resident_id' => $resident->id,
                'error' => $e->getMessage()
            ]);
            return response()->json([
                'message' => 'Failed to retrieve resident households',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get resident's documents
     */
    public function getResidentDocuments(Request $request, Resident $resident): JsonResponse
    {
        try {
            $query = $resident->documents();

            // Filter by status if provided
            if ($request->has('status')) {
                $query->where('status', $request->get('status'));
            }

            // Filter by type if provided
            if ($request->has('type')) {
                $query->where('type', $request->get('type'));
            }

            // Sort by date
            $sortBy = $request->get('sort_by', 'submitted_at');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            $documents = $query->with([
                'supportingDocuments:id,document_id,file_name,file_path',
                'createdBy:id,first_name,last_name',
                'updatedBy:id,first_name,last_name'
            ])->paginate(15);

            return response()->json([
                'data' => $documents->items(),
                'meta' => [
                    'current_page' => $documents->currentPage(),
                    'last_page' => $documents->lastPage(),
                    'per_page' => $documents->perPage(),
                    'total' => $documents->total()
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to retrieve resident documents', [
                'resident_id' => $resident->id,
                'error' => $e->getMessage()
            ]);
            return response()->json([
                'message' => 'Failed to retrieve resident documents',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get resident's tickets (appointments, complaints, suggestions)
     */
    public function getResidentTickets(Request $request, Resident $resident): JsonResponse
    {
        try {
            $tickets = $resident->tickets();

            // Filter by type if provided
            if ($request->has('type')) {
                $tickets->where('type', $request->get('type'));
            }

            // Filter by status if provided
            if ($request->has('status')) {
                $tickets->where('status', $request->get('status'));
            }

            // Sort by date
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');
            $tickets->orderBy($sortBy, $sortOrder);

            $paginatedTickets = $tickets->paginate(15);

            return response()->json([
                'data' => $paginatedTickets->items(),
                'meta' => [
                    'current_page' => $paginatedTickets->currentPage(),
                    'last_page' => $paginatedTickets->lastPage(),
                    'per_page' => $paginatedTickets->perPage(),
                    'total' => $paginatedTickets->total()
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to retrieve resident tickets', [
                'resident_id' => $resident->id,
                'error' => $e->getMessage()
            ]);
            return response()->json([
                'message' => 'Failed to retrieve resident tickets',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified resident
     */
    public function update(Request $request, Resident $resident): JsonResponse
    {
        try {
            // Validate using schema rules
            $validatedData = $request->validate(Resident::getUpdateValidationRules());

            // Set updated_by if user is authenticated
            if (auth('sanctum')->check()) {
                $validatedData['updated_by'] = auth('sanctum')->id();
            }

            // Update the resident
            $resident->update($validatedData);

            // Load relationships for response
            $resident->load([
                'households',
                'updatedBy:id,first_name,last_name'
            ]);

            Log::info('Resident updated successfully', ['resident_id' => $resident->id]);

            return response()->json([
                'message' => 'Resident updated successfully',
                'data' => $resident
            ]);

        } catch (ValidationException $e) {
            Log::warning('Resident update validation failed', [
                'resident_id' => $resident->id,
                'errors' => $e->errors()
            ]);
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Failed to update resident', [
                'resident_id' => $resident->id,
                'error' => $e->getMessage()
            ]);
            return response()->json([
                'message' => 'Failed to update resident',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resident (soft delete)
     */
    public function destroy(Resident $resident): JsonResponse
    {
        try {
            // Remove from any household relationships first
            $resident->leaveHousehold();
            
            // Soft delete by changing status
            $resident->update(['status' => 'INACTIVE']);

            Log::info('Resident deactivated successfully', ['resident_id' => $resident->id]);

            return response()->json([
                'message' => 'Resident deactivated successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to deactivate resident', [
                'resident_id' => $resident->id,
                'error' => $e->getMessage()
            ]);
            return response()->json([
                'message' => 'Failed to deactivate resident',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Check for duplicate residents
     */
    public function checkDuplicates(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'first_name' => 'required|string',
                'last_name' => 'required|string',
                'birth_date' => 'required|date'
            ]);

            $duplicates = Resident::where('first_name', 'like', '%' . $request->first_name . '%')
                                ->where('last_name', 'like', '%' . $request->last_name . '%')
                                ->where('birth_date', $request->birth_date)
                                ->where('status', '!=', 'INACTIVE')
                                ->get(['id', 'first_name', 'last_name', 'middle_name', 'birth_date', 'complete_address']);

            return response()->json([
                'data' => $duplicates
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to check duplicates',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get residents statistics (OPTIMIZED - single query approach)
     */
    public function statistics(): JsonResponse
    {
        try {
            // Single optimized query to get all basic counts at once
            $basicStats = Resident::selectRaw("
                COUNT(*) as total_residents,
                COUNT(CASE WHEN status = 'ACTIVE' THEN 1 END) as active_residents,
                COUNT(CASE WHEN status != 'ACTIVE' THEN 1 END) as inactive_residents,
                COUNT(CASE WHEN status = 'ACTIVE' AND gender = 'MALE' THEN 1 END) as male_residents,
                COUNT(CASE WHEN status = 'ACTIVE' AND gender = 'FEMALE' THEN 1 END) as female_residents,
                COUNT(CASE WHEN status = 'ACTIVE' AND senior_citizen = true THEN 1 END) as senior_citizens,
                COUNT(CASE WHEN status = 'ACTIVE' AND person_with_disability = true THEN 1 END) as pwd_residents,
                COUNT(CASE WHEN status = 'ACTIVE' AND four_ps_beneficiary = true THEN 1 END) as four_ps_beneficiaries,
                COUNT(CASE WHEN status = 'ACTIVE' AND indigenous_people = true THEN 1 END) as indigenous_people,
                COUNT(CASE WHEN status = 'ACTIVE' AND voter_status = 'REGISTERED' THEN 1 END) as registered_voters,
                COUNT(CASE WHEN status = 'ACTIVE' AND employment_status IN ('EMPLOYED', 'SELF_EMPLOYED') THEN 1 END) as employed_residents,
                COUNT(CASE WHEN status = 'ACTIVE' AND EXTRACT(YEAR FROM AGE(birth_date)) < 18 THEN 1 END) as children,
                COUNT(CASE WHEN status = 'ACTIVE' AND EXTRACT(YEAR FROM AGE(birth_date)) BETWEEN 18 AND 59 THEN 1 END) as adults,
                COUNT(CASE WHEN status = 'ACTIVE' AND EXTRACT(YEAR FROM AGE(birth_date)) >= 60 THEN 1 END) as seniors
            ")->first();

            // Optimized household heads count using direct join
            $householdHeads = Resident::join('household_members', 'residents.id', '=', 'household_members.resident_id')
                ->where('residents.status', 'ACTIVE')
                ->where('household_members.relationship', 'HEAD')
                ->count();

            // Optimized grouped queries - only run if needed
            $residentsByBarangay = Resident::where('status', 'ACTIVE')
                ->whereNotNull('barangay')
                ->selectRaw('barangay, COUNT(*) as count')
                ->groupBy('barangay')
                ->pluck('count', 'barangay')
                ->toArray();

            $residentsByCivilStatus = Resident::where('status', 'ACTIVE')
                ->whereNotNull('civil_status')
                ->selectRaw('civil_status, COUNT(*) as count')
                ->groupBy('civil_status')
                ->pluck('count', 'civil_status')
                ->toArray();

            $residentsByEmploymentStatus = Resident::where('status', 'ACTIVE')
                ->whereNotNull('employment_status')
                ->selectRaw('employment_status, COUNT(*) as count')
                ->groupBy('employment_status')
                ->pluck('count', 'employment_status')
                ->toArray();

            $stats = [
                'total_residents' => (int) $basicStats->total_residents,
                'active_residents' => (int) $basicStats->active_residents,
                'inactive_residents' => (int) $basicStats->inactive_residents,
                'male_residents' => (int) $basicStats->male_residents,
                'female_residents' => (int) $basicStats->female_residents,
                'senior_citizens' => (int) $basicStats->senior_citizens,
                'pwd_residents' => (int) $basicStats->pwd_residents,
                'four_ps_beneficiaries' => (int) $basicStats->four_ps_beneficiaries,
                'indigenous_people' => (int) $basicStats->indigenous_people,
                'household_heads' => (int) $householdHeads,
                'registered_voters' => (int) $basicStats->registered_voters,
                'employed_residents' => (int) $basicStats->employed_residents,
                
                'by_age_group' => [
                    'children' => (int) $basicStats->children,
                    'adults' => (int) $basicStats->adults,
                    'seniors' => (int) $basicStats->seniors,
                ],
                'by_civil_status' => $residentsByCivilStatus,
                'by_employment_status' => $residentsByEmploymentStatus,
                'by_barangay' => $residentsByBarangay,
            ];

            return response()->json([
                'data' => $stats
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to get residents statistics', ['error' => $e->getMessage()]);
            return response()->json([
                'message' => 'Failed to get statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get age group statistics with details
     */
    public function ageGroups(): JsonResponse
    {
        try {
            $ageGroups = [
                'children' => Resident::active()->minors()->count(),
                'adults' => Resident::active()->adults()->count(),
                'seniors' => Resident::active()->seniors()->count(),
                'by_age_range' => [
                    '0-4' => Resident::active()->byAgeRange(0, 4)->count(),
                    '5-9' => Resident::active()->byAgeRange(5, 9)->count(),
                    '10-14' => Resident::active()->byAgeRange(10, 14)->count(),
                    '15-19' => Resident::active()->byAgeRange(15, 19)->count(),
                    '20-24' => Resident::active()->byAgeRange(20, 24)->count(),
                    '25-29' => Resident::active()->byAgeRange(25, 29)->count(),
                    '30-34' => Resident::active()->byAgeRange(30, 34)->count(),
                    '35-39' => Resident::active()->byAgeRange(35, 39)->count(),
                    '40-44' => Resident::active()->byAgeRange(40, 44)->count(),
                    '45-49' => Resident::active()->byAgeRange(45, 49)->count(),
                    '50-54' => Resident::active()->byAgeRange(50, 54)->count(),
                    '55-59' => Resident::active()->byAgeRange(55, 59)->count(),
                    '60+' => Resident::active()->seniors()->count(),
                ]
            ];

            return response()->json([
                'data' => $ageGroups
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to get age group statistics', ['error' => $e->getMessage()]);
            return response()->json([
                'message' => 'Failed to get age group statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Restore a deactivated resident
     */
    public function restore(Resident $resident): JsonResponse
    {
        try {
            $resident->activate();

            Log::info('Resident restored successfully', ['resident_id' => $resident->id]);

            return response()->json([
                'message' => 'Resident restored successfully',
                'data' => $resident
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to restore resident', [
                'resident_id' => $resident->id,
                'error' => $e->getMessage()
            ]);
            return response()->json([
                'message' => 'Failed to restore resident',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Special list endpoints
     */

    /**
     * Get senior citizens
     */
    public function seniorCitizens(Request $request): JsonResponse
    {
        return $this->getSpecialList(
            Resident::active()->seniorCitizens(),
            $request->get('barangay'),
            'senior citizens'
        );
    }

    /**
     * Get persons with disability (PWD)
     */
    public function pwd(Request $request): JsonResponse
    {
        return $this->getSpecialList(
            Resident::active()->pwd(),
            $request->get('barangay'),
            'PWD residents'
        );
    }

    /**
     * Get 4Ps beneficiaries
     */
    public function fourPs(Request $request): JsonResponse
    {
        return $this->getSpecialList(
            Resident::active()->fourPs(),
            $request->get('barangay'),
            '4Ps beneficiaries'
        );
    }

    /**
     * Get household heads
     */
    public function householdHeads(Request $request): JsonResponse
    {
        return $this->getSpecialList(
            Resident::active()->householdHeads(),
            $request->get('barangay'),
            'household heads'
        );
    }

    /**
     * Get indigenous people
     */
    public function indigenous(Request $request): JsonResponse
    {
        return $this->getSpecialList(
            Resident::active()->indigenous(),
            $request->get('barangay'),
            'indigenous people'
        );
    }

    /**
     * Upload profile photo
     */
    public function uploadPhoto(Request $request, Resident $resident): JsonResponse
    {
        try {
            $request->validate([
                'photo' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120' // 5MB max
            ]);

            $photo = $request->file('photo');
            
            // Use Supabase storage if configured, otherwise fall back to local storage
            if (config('services.supabase.url') && app()->bound('App\Contracts\StorageInterface')) {
                $storageService = app('App\Contracts\StorageInterface');
                $result = $storageService->uploadFile(
                    $photo,
                    'residents-photos',
                    "", // Let service generate UUID filename
                    true // public bucket
                );
                
                if ($result['success']) {
                    $resident->update([
                        'profile_photo_url' => $result['path'], // Store relative path, not full URL
                        'photo_bucket' => $result['bucket'],
                        'photo_path' => $result['path'],
                        'photo_storage_provider' => 'supabase',
                        'photo_migrated_to_supabase' => true,
                        'updated_by' => auth('sanctum')->id()
                    ]);
                } else {
                    throw new \Exception($result['error'] ?? 'Upload failed');
                }
            } else {
                // Fallback to local storage
                $path = $photo->store('residents/photos', 'public');
                $resident->update([
                    'profile_photo_url' => $path, // Store relative path, not full URL
                    'photo_storage_provider' => 'local',
                    'updated_by' => auth('sanctum')->id()
                ]);
            }

            Log::info('Profile photo uploaded successfully', [
                'resident_id' => $resident->id,
                'storage_provider' => $resident->photo_storage_provider ?? 'local'
            ]);

            return response()->json([
                'message' => 'Profile photo uploaded successfully',
                'data' => $resident
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Failed to upload profile photo', [
                'resident_id' => $resident->id,
                'error' => $e->getMessage()
            ]);
            return response()->json([
                'message' => 'Failed to upload profile photo',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Helper method for special lists
     */
    private function getSpecialList($query, ?string $barangay, string $description): JsonResponse
    {
        try {
            if ($barangay) {
                $query->where('barangay', $barangay);
            }

            $residents = $query->with('households')
                              ->orderBy('last_name')
                              ->orderBy('first_name')
                              ->get();

            return response()->json([
                'data' => [
                    'data' => $residents,
                    'count' => $residents->count()
                ]
            ]);

        } catch (\Exception $e) {
            Log::error("Failed to get {$description}", ['error' => $e->getMessage()]);
            return response()->json([
                'message' => "Failed to get {$description}",
                'error' => $e->getMessage()
            ], 500);
        }
    }
}